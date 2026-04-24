from crewai import Agent
from services.gemini_service import get_local_llm

def create_timeline():
    return Agent(
        role="Forensic Chronologist",
        goal="Take extracted facts and organize them into a strict chronological timeline. Flag any missing time gaps.",
        backstory="You are a master of time and sequence. You can take fragmented events and build a perfect minute-by-minute reconstruction of a crime scene.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )