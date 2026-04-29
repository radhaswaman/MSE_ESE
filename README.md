# VIT Result Calculator

This project has two parts:

- A Django backend that stores student results in SQLite.
- A React frontend that lets you enter marks, calculate results, and save them.

If you are opening this project in VS Code for the first time, follow the steps below exactly.

## What You Need

- Python 3.10 or newer
- Node.js 18 or newer
- VS Code

## Project Structure

- `manage.py` and `vit_project/` contain the Django backend.
- `result/` contains the result calculation app and database models.
- `frontend/` contains the React user interface.
- `db.sqlite3` is the local database file used by Django.

## 1) Open the Project in VS Code

Open the folder named `Syllabus Lab Assignment 6` in VS Code.

## 2) Start the Backend

Open a terminal in VS Code and run these commands from the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Leave this terminal running. The backend will be available at:

- `http://127.0.0.1:8000/`
- API root: `http://127.0.0.1:8000/api/`

## 3) Start the Frontend

Open a second terminal in VS Code and run these commands:

```powershell
cd frontend
npm install
npm start
```

Leave this terminal running. The React app will open at:

- `http://localhost:3000/`

## 4) How to Use the App

1. Enter the student name, registration number, and semester.
2. Fill in MSE and ESE marks for all subjects.
3. Click Calculate to view the result.
4. Click Save Result to store the result in SQLite.

## API Endpoints

- `POST /api/calculate/` calculates marks without saving.
- `POST /api/save/` saves a student result.
- `GET /api/<reg_no>/` fetches a saved result by registration number.

## If Something Does Not Run

- If Django says `corsheaders` is missing, run `pip install -r requirements.txt` again.
- If the frontend does not open, make sure `npm install` finished successfully.
- If port 8000 or 3000 is already in use, close the other app or choose another port.

## Notes

- The project uses SQLite, so no separate database setup is needed.
- The backend is already configured to allow requests from the React dev server at `http://localhost:3000`.