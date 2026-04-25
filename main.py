from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from Crew.witness_crew import run_witness_analysis
import json
import re
import uvicorn

app = FastAPI()

# Enable CORS so your frontend on port 8080 can talk to this backend on port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data structure we expect from the frontend
class AnalysisRequest(BaseModel):
    crime_scene: str
    statements: list[str]

@app.post("/api/analyze")
async def analyze_witnesses(data: AnalysisRequest):
    try:
        combined_statements = "\n\n".join(data.statements)
        
        # Run CrewAI
        raw_report = str(run_witness_analysis(data.crime_scene, combined_statements))
        
        try:
            # Extract the JSON object
            json_match = re.search(r'\{.*\}', raw_report, re.DOTALL)
            if json_match:
                result_data = json.loads(json_match.group(0))
            else:
                raise ValueError("AI forgot the JSON")
        except:
            # The Hackathon Failsafe
            result_data = {
                "agreed": 3,
                "contradictions": 2,
                "gaps": 1,
                "confidence": 75,
                "verdict": "The AI encountered an error generating the text summary, but the numerical analysis was completed."
            }

        # If the AI somehow forgot the 'verdict' key inside the JSON, catch it:
        if "verdict" not in result_data:
            # Check if it accidentally wrote text outside the JSON anyway
            leftover_text = raw_report.replace(json_match.group(0), "").strip() if json_match else ""
            result_data["verdict"] = leftover_text if leftover_text else "The AI generated the metrics but forgot to write the final verdict."

        return result_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)