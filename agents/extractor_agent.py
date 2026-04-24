from crewai import Agent
from services.gemini_service import get_local_llm

def create_extractor():
    return Agent(
        role="Forensic Fact Extractor",
        goal="Extract raw, objective facts and chronological actions from witness statements without interpretation.",
        backstory="You are a meticulous paralegal who only cares about cold, hard facts. You strip away emotion and opinion, leaving only the who, what, when, and where.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )