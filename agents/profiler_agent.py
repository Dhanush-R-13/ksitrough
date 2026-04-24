from crewai import Agent
from services.gemini_service import get_local_llm

def create_profiler():
    return Agent(
        role="Psychological Profiler",
        goal="Analyze witness statements for deceptive language, cognitive bias, and emotional framing.",
        backstory="You are an expert interrogator and behavioral analyst. You read between the lines to find out who is lying, who is biased, and who is telling the absolute truth.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )