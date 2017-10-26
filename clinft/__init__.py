from flask import Flask
app = Flask(__name__)

import clinft.views
import fhir_tools.fhir_tools