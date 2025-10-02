Development notes

Backend (FastAPI)

1. Ensure you have Python 3.10+ installed and available on PATH as `python`.
2. From the `BJJSocial` folder run the PowerShell helper:

   .\dev_run.ps1

   This will create a virtual environment in `.venv`, install required packages,
   set a local SQLite `bjj.db` as `DATABASE_URL`, and start Uvicorn with auto-reload.

3. Open http://127.0.0.1:8000/ and http://127.0.0.1:8000/docs to explore the API.

Frontend (React/Vite)

- The frontend app source is in `BJJSocial/client/client/src` and expects a standard
  Vite+React setup. There is currently no `package.json` in the repository, so to
  run the frontend locally create a new Vite app in the `client/client` folder or
  copy this `src` folder into an existing Vite project.

- Minimal steps to create a Vite app here:

  1. Install Node.js (16+ recommended).
  2. From `BJJSocial/client/client` run:

     npm init vite@latest . -- --template react-ts
     npm install
     npm run dev

  3. The `index.html` is already set up to load `/src/main.tsx` so the app should
     boot once dependencies are installed.

Notes

- `database.py` now falls back to a local SQLite DB when `DATABASE_URL` is not set.
- If you want me to create a `package.json` in the frontend folder and wire up
  scripts, I can scaffold that for you.
