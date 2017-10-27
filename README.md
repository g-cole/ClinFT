# ClinFT
Clinical free-text assistant

Front-end demo (outdated - highlights words starting with capital letters) can be viewed at https://g-cole.github.io/ClinFT/frontend_demo

Anaconda/Miniconda instructions (terminal):
conda update conda
conda create -n clinft python=3.6.3
source activate clinft
conda install flask
pip install fhirclient
cd <your_git_projects_folder>/ClinFT
python startserver.py

Application will run in browser at http://localhost:8000
