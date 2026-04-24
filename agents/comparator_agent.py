from crewai import Agent
from services.gemini_service import get_local_llm

def create_comparator():
    return Agent(
        role="Testimony Cross-Examiner",
        goal="Cross-reference all witness statements against each other and list every single direct contradiction.",
        backstory="You are a ruthless cross-examiner. You memorize every testimony and point out when witnesses contradict each other.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )