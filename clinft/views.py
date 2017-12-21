from flask import render_template, request
from clinft import app
from fhir_tools import fhir_tools

@app.route('/')
@app.route('/index')
def pat_pick():
	return('Patient Picker Page')

@app.route('/<patient_id>')
def proc_pick(patient_id):
	return('Procedure picker page for patient #'+patient_id)

@app.route('/<patient_id>/<procedure_id>')
def proc_doc(patient_id, procedure_id):
	patient = fhir_tools.get_patient_info(patient_id)
	procedure = fhir_tools.get_procedure_info(procedure_id)
	terminology = fhir_tools.get_terminology("EGD_terminology.json")
	return render_template('index.html', title='Home', patient=patient, procedure=procedure, terminology=terminology)

@app.route('/update-fhir', methods=['POST'])
def get_names():
	if request.method == 'POST':
		bundle = request.get_json()
		close_timestamp = bundle.pop()
		open_timestamp = bundle.pop()
		proc_id = bundle.pop()
		pat_id = bundle.pop()
		results = fhir_tools.update_fhir(pat_id, proc_id, bundle)      
	return results
