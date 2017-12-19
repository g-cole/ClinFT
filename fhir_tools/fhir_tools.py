from fhirclient import client
from datetime import date
from os import path
import urllib.request
import json

settings = {
	'app_id': 'clinft',
	'api_base': 'https://api-stu3.hspconsortium.org/clinft/open'
}

def get_patient_info(pat_id):
	"""
	returns patient id, name, dob, age, and gender from FHIR to FLASK
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
	returns procedure type, indications, and dx list from FHIR to FLASK
	"""
	smart = client.FHIRClient(settings=settings)
	import fhirclient.models.procedure as p
	proc = p.Procedure.read(proc_id, smart.server)

	exam_type = proc.code.coding[0].display
	indications = proc.reasonCode[0].text

	#ClinFhir doesn't access condition resources the same way as patients or procedures, so access via JSON
	cond_code_desc = []
	for cond in proc.reasonReference:
		cond_json = json.loads(urllib.request.urlopen(settings['api_base'] + '/Condition/' + cond.reference.split('/')[1]).read())
		cond_code_desc.append(
			[
				cond_json['code']['coding'][0]["code"],
				cond_json['code']['coding'][0]['display']
			]
		)
	
	return {'exam_type' : exam_type,
			'indications' : indications,
			'condition' : cond_code_desc
			}

def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

def get_terminology(domain_terminology):
	troot = path.realpath(path.dirname(__file__))
	#json_url = path.join(SITE_ROOT, "/terminologies", domain_terminology)
	#json_url = url_for('static', filename='terminologies/' + domain_terminology)
	with open(path.join(troot, 'terminologies', domain_terminology), 'r') as tfile:
		tdata = json.load(tfile)
	return tdata
	#return json.loads(domain_terminology)
#push to FHIR server with "put" to update record
#http://www.hl7.org/implement/standards/fhir/http.html#create
