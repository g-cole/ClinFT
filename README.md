# ClinFT
Clinical free-text assistant

Finds codable concepts in free-text fields to automatically add them to the associated structured data using FHIR. No extraneous dependencies (including jQuery).

This is a proof-of-concept application for a term project at the University of Utah department of Biomedical Informatics. It should not be used in a production setting in its current state.

Use case: Gastroenterology

Most endoscopic note-writing software generates text and populates structured data using menu options. If the clinician uses a free-text option or otherwise modifies the note, that information is essentialy lost, not coded into the database and unusable unless NLP is used later. This application attempts to solve this problem by running basic NLP (JavaScript RegEx search + negation detection) as the clinician is writing the note. When a term from the data dictionary is found, it is highlighted and the clinician then has the option to hover over it and add the concept to the structured data.

Front-end demo (OUTDATED - highlights words starting with capital letters) can be viewed at https://g-cole.github.io/ClinFT/frontend_demo

Anaconda/Miniconda instructions (terminal):
```conda update conda
conda create -n clinft python=3.6.3
source activate clinft
conda install flask
pip install fhirclient
cd <your_git_projects_folder>/ClinFT
python startserver.py
```
Application will run in browser at http://localhost:8000/01/05
where "01" is the patient FHIR ID and "05" is procedure FHIR ID. These are the IDs from our open HSCP demo server.

Demo video and rationale:

[![ClinFT demo video](https://img.youtube.com/vi/CfDZTMjxvwo/0.jpg)](https://www.youtube.com/watch?v=CfDZTMjxvwo)
