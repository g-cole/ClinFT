from fhirclient import client
from datetime import date

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
	conditions = proc.reasonReference#[0].reference.code.coding[0].display

	#import fhirclient.models.condition as c
	#condition = c.Condition.read('8', smart.server)
	#condition_text = 'hi'#condition.code.coding[0].display

	#search = c.Condition.where(struct={'id': '8'})
	#condition1text = condition1.perform_resources(smart.server)
	#for condition in proc.reasonReference


#search = p.Procedure.where(struct={'subject': 'hca-pat-1', 'status': 'completed'})
#procedures = search.perform_resources(smart.server)
#for procedure in procedures:
#    procedure.as_json()
#    # {'status': u'completed', 'code': {'text': u'Lumpectomy w/ SN', ...


	
	return {'exam_type' : exam_type,
			'indications' : indications,
			'condition' : conditions
			}

def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))