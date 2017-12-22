"""ClinFT: Flask views"""
from flask import render_template, request
from clinft import app
from fhir_tools import fhir_tools

@app.route('/')
@app.route('/index')
def pat_pick():
    """View for root URL"""
    return('Patient Picker Page')

@app.route('/<patient_id>')
def proc_pick(patient_id):
    """View when only patient ID is given"""
    return('Procedure picker page for patient #'+patient_id)

@app.route('/<patient_id>/<procedure_id>')
def proc_doc(patient_id, procedure_id):
    """Main view - App requires patient ID and procedure ID"""
    patient = fhir_tools.get_patient_info(patient_id)
    procedure = fhir_tools.get_procedure_info(procedure_id)
    terminology = fhir_tools.get_terminology("EGD_terminology.json")
    return render_template('index.html', title='Home', patient=patient, \
    	procedure=procedure, terminology=terminology)

@app.route('/update-fhir', methods=['POST'])
def get_names():
    """URL to receive data from front-end via http POST"""
    if request.method == 'POST':
        bundle = request.get_json()
        close_timestamp = bundle.pop()
        open_timestamp = bundle.pop()
        proc_id = bundle.pop()
        pat_id = bundle.pop()
        results = fhir_tools.update_fhir(pat_id, proc_id, bundle)
        #make session analytics dependent of successful fhir push or make
        #server reply part of the analytics?
        fhir_tools.add_session_analytics(open_timestamp, close_timestamp, bundle)
    return results
