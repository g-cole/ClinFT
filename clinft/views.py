from flask import render_template
from clinft import app
from fhir_tools import fhir_tools

@app.route('/')
@app.route('/index')
def index():
	patient = fhir_tools.get_patient_info('01')
	procedure = fhir_tools.get_procedure_info('01')
	return render_template('index.html', title='Home', patient=patient, procedure=procedure)