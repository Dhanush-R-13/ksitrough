from crewai import Agent
from services.gemini_service import get_local_llm

def create_forensic():
    return Agent(
        role="Forensic Physicist",
        goal="Compare witness claims to the physical Ground Truth and flag any scientific or physical impossibilities.",
        backstory="You are an expert in crash dynamics and physics. If a witness says a car did something physically impossible, you catch it immediately.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )