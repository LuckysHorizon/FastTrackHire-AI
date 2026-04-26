# Start FastTrackHire Simulation Intelligence

Follow these steps to launch the FastTrackHire simulation environment.

## 1. Start the Backend Intelligence Engine
Open a **PowerShell** window in the `backend` directory and run:

```powershell
# Navigate to backend (if not already there)


# (Optional) Setup Virtual Environment
cd backend
python -m venv venv
.\venv\Scripts\Activate

# Install Dependencies
pip install -r requirements.txt

# Launch FastAPI Server
python main.py
```
*The backend will be available at `http://127.0.0.1:8000`*

## 2. Start the Frontend Simulation Interface
Open a **second** PowerShell window in the `frontend` directory and run:

```powershell
# Navigate to frontend (if not already there)
cd frontend

# Install Dependencies (if needed)
npm install

# Launch Vite Development Server
npm run dev
```
*The simulation interface will be available at `http://localhost:5173`*

---

## Troubleshooting Connectivity

### Check Backend Status
Visit `http://127.0.0.1:8000/` in your browser. You should see:
```json
{
  "status": "ok",
  "db_connected": true
}
```

### Kill Stale Processes
If a port is already in use, run these commands in an Admin PowerShell:

```powershell
# Kill Frontend (Port 5173)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Kill Backend (Port 8000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```
