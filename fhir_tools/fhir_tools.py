from fhirclient import client
from datetime import date
import urllib.request
import json

settings = {
	'app_id': 'clinft',
	'api_base': 'https://api-stu3.hspconsortium.org/clinft/open'
}

def get_patient_info(pat_id):
	"""
	words
	"""
	smart = client.FHIRClient(settings=settings)
	import fhirclient.models.patient as p
	patient = p.Patient.read(pat_id, smart.server)

	name = patient.name[0].given[0]+' '+patient.name[0].family
	dob = patient.birthDate.isostring #yyyy-mm-dd
	age = calculate_age(patient.birthDate.date)
	gender = patient.gender

	return {'name' : name,
			'id' : pat_id,
			'dob' : dob,
			'age' : age,
			'gender' : gender}

def get_procedure_info(proc_id):
	"""
	more words
	"""
	smart = client.FHIRClient(settings=settings)
	import fhirclient.models.procedure as p
	proc = p.Procedure.read(proc_id, smart.server)

	exam_type = proc.code.coding[0].display
	indications = proc.reasonCode[0].text

	cond_id_desc = []
	for cond in proc.reasonReference:
		cond_json = json.loads(urllib.request.urlopen(settings['api_base'] + '/Condition/' + cond.reference.split('/')[1]).read())
		cond_id_desc.append(
			(
				cond_json['code']['coding'][0]["code"],
				cond_json['code']['coding'][0]['display']
			)
		)
	cond_fmt = ""
	for cond in cond_id_desc:
		cond_fmt += cond[0] + ' : ' + cond[1] + ' <a style="color: #0000EE; cursor: pointer;" onClick="remove_dx(' + cond[0] + ')">x</a><br>'


#push to FHIR server with "put" to update record
	


	
	return {'exam_type' : exam_type,
			'indications' : indications,
			'condition' : cond_fmt#test["code"]["coding"][0]["code"]
			}

def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
