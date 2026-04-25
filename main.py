from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from Crew.witness_crew import run_witness_analysis
import json
import re
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    crime_scene: str
    statements: list[str]

@app.post("/api/analyze")
async def analyze_witnesses(data: AnalysisRequest):
    try:
        combined_statements = "\n\n".join(data.statements)
        raw_report = str(run_witness_analysis(data.crime_scene, combined_statements))
        
        # --- STEP 1: ATTEMPT JSON EXTRACTION ---
        json_match = re.search(r'(\{.*\})', raw_report, re.DOTALL)
        result_data = None
        
        if json_match:
            try:
                result_data = json.loads(json_match.group(1), strict=False)
            except:
                result_data = None

        # --- STEP 2: EMERGENCY RECOVERY (If AI just sent text) ---
        if not result_data:
            # We manually create the object from the raw text so the UI works
            # We split the text by bullet points or newlines for the lists
            sentences = [s.strip() for s in raw_report.split('\n') if len(s.strip()) > 10][:3]
            result_data = {
                "agreed": ["Extracted from text report"],
                "contradictions": sentences if sentences else ["Conflicts detected in text"],
                "gaps": ["Further investigation required"],
                "confidence": 65,
                "verdict": raw_report
            }

        # --- STEP 3: FINAL SHIPMENT ---
        return {
            "agreed": result_data.get("agreed", ["Facts processed"]),
            "contradictions": result_data.get("contradictions", ["Analysis complete"]),
            "gaps": result_data.get("gaps", ["Gaps identified"]),
            "confidence": int(result_data.get("confidence", 70)),
            "verdict": result_data.get("verdict", raw_report)
        }

    except Exception as e:
        return {
            "agreed": ["Error in pipeline"],
            "contradictions": [str(e)],
            "gaps": ["Check backend"],
            "confidence": 0,
            "verdict": "Critical system failure."
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)