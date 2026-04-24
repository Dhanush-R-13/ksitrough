from crewai import Agent
from services.gemini_service import get_local_llm

def create_reporter():
    return Agent(
        role="Legal Reporter",
        goal="Take the Chief Justice's final verdict and format it into a pristine, professional legal document.",
        backstory="You are a Supreme Court clerk. You take chaotic investigation data and format it into beautiful, easy-to-read legal summaries.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )