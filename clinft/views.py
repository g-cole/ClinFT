from flask import render_template
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
	return render_template('index.html', title='Home', patient=patient, procedure=procedure)

#working on it...
@app.route('/<patient_id>/<procedure_id>', methods=['POST', 'GET'])
def get_post_json():    
    data = request.get_json()
    return jsonify(status='success', data="test")
