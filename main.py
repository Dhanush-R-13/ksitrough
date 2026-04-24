from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # 1. IMPORT THIS
from Crew.witness_crew import run_witness_analysis
import uvicorn

app = FastAPI()

# 2. ADD THIS ENTIRE BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any frontend (React, Live Server, etc.) to connect
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    crime_scene: str
    witness_data: str

@app.post("/api/analyze")
async def analyze_witnesses(data: AnalysisRequest):
    try:
        report = run_witness_analysis(data.crime_scene, data.witness_data)
        return {"report": str(report)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)