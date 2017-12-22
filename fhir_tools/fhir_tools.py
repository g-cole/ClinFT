"""
This module is a part of the Clinical Free-text assistant project.
It is a collection of functions for interfacing with a FHIR server and passing data to FLASK.
"""

__version__ = '0.1'
__author__ = 'Garrett Cole'

import json
from os import path
from datetime import date
import urllib.request
import uuid
import requests
from fhirclient import client

SETTINGS = { \
    'app_id': 'clinft', \
    'api_base': 'https://api-stu3.hspconsortium.org/clinft/open' \
}
SESSION_ANALYTICS = []

def get_patient_info(pat_id):
    """
    Queries a FHIR server for patient information

    Args:
        param1: FHIR patient ID

    Returns:
        A dictionary that includes a patient's name, ID, date of birth, age, and gender

    """
    smart = client.FHIRClient(settings=SETTINGS)
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
    Queries a FHIR server for procedure information. The procedure text might be in a TIU database,
    so it's currently just part of the template.

    Args:
        param1: FHIR procedure ID

    Returns:
        A dictionary that includes the procedure ID, exam type (name), indications, and an array
        of associated diagnostic codes/descriptions. The array type works well with JS and Python.
    """
    smart = client.FHIRClient(settings=SETTINGS)
    import fhirclient.models.procedure as p
    proc = p.Procedure.read(proc_id, smart.server)

    exam_type = proc.code.coding[0].display
    indications = proc.reasonCode[0].text

    cond_code_desc = []
    for cond in proc.reasonReference:
        cond_json = json.loads(urllib.request.urlopen(SETTINGS['api_base'] + '/Condition/' + \
        	cond.reference.split('/')[1]).read())
        cond_code_desc.append([cond_json['code']['coding'][0]["code"], \
        	cond_json['code']['coding'][0]['display']])

    return {'proc_id' : proc_id,
            'exam_type' : exam_type,
            'indications' : indications,
            'condition' : cond_code_desc}

def calculate_age(born):
    """Calculates age for given birthday"""
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

def get_terminology(domain_terminology):
    """
    Returns JSON object from specified terminology .JSON file. The terminologies are not client
    facing, in case they are paid products and need to be protected. They could also could be
    split or dynamically created for speed/caching.

    Args:
        param1: Filename string for required terminology

    Returns:
        JSON object of terminology
    """
    troot = path.realpath(path.dirname(__file__))
    with open(path.join(troot, 'kb', domain_terminology), 'r') as tfile:
        tdata = json.load(tfile)
    return tdata

def update_fhir(pat_id, proc_id, diagnoses):
    """
    Create patient condition resources with new diagnoses array

    Args:
        param1: FHIR patient ID
        param2: FHIR procedure ID
        param3: array of diagnoses

    Returns:
        Success/error codes from FHIR server

    """
    responses = ""
    for diag in diagnoses:
        json_cond_template = r"""
{
  "resourceType": "Condition",
  "subject": {
    "reference": "Patient/%s"
  },
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "%s",
        "display": "%s"
      }
    ]
  },
  "clinicalStatus": "active",
  "verificationStatus": "confirmed"
}"""%(pat_id, diag[0], diag[1])
        data = json.loads(json_cond_template)
        url = SETTINGS['api_base']
        data = json.loads(json_cond_template)
        headers = {'content-type': 'application/json'}
        response = requests.post(url, data=data, headers=headers)
        print(response)
        responses += str(response)
    return responses
    #To Do: get the reference to each created condition and add it to the procedure with proc_id.
    #Also check for removed diagnosis. This is more complicated than I originally thought...

class SessionAnalytics(object):
    """Creates object with session details for analytics"""
    def __init__(self, session_id=0, open_timestamp=0, close_timestamp=0, diagnoses=None):
        """Initialize a session_analytics object"""
        if session_id == 0:
            session_id = int(uuid.uuid1())
        self.__session_id = session_id
        self.__open_timestamp = open_timestamp
        self.__close_timestamp = close_timestamp
        self.__diagnoses = diagnoses

    @property
    def session_id(self):
        """Return session_id"""
        return self.__session_id
    @property
    def open_timestamp(self):
        """Return open_timestamp"""
        return self.__open_timestamp
    @property
    def close_timestamp(self):
        """Return close_timestamp"""
        return self.__close_timestamp
    @property
    def diagnoses(self):
        """Return diagnoses"""
        return self.__diagnoses

    def __str__(self):
        return "Session_id: %i\nOpen timestamp: %i\nClose timestamp: %i\nDiagnoses:%s"% \
        (self.session_id, self.open_timestamp, self.close_timestamp, str(self.diagnoses))

def add_session_analytics(open_timestamp, close_timestamp, diagnoses):
    """
    Create new SessionAnalytics object and add it to the SESSION_ANALYTICS global array
    To Do: Pickle SESSION_ANALYTICS for next time server is run, or replace it with a sqlite db

    Args:
        param1: Page-open timestamp
        param2: Save button pressed timestamp
        param3: Diagnoses array
    """
    sessanaly = SessionAnalytics(open_timestamp=open_timestamp, \
    	                   close_timestamp=close_timestamp, \
    	                   diagnoses=diagnoses)
    SESSION_ANALYTICS.append(sessanaly)
    print("_"*40)
    for ses in SESSION_ANALYTICS:
        print(ses.__str__())
    print("_"*40)
