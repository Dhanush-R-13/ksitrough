from crewai import Agent
from services.gemini_service import get_local_llm

def create_judge():
    return Agent(
        role="The Chief Justice",
        goal="Review the timeline, profile, forensics, and contradictions to calculate a final Reliability Score (0-100%) and declare what actually happened.",
        backstory="You are an impartial, highly analytical judge with decades of experience spotting perjury and synthesizing complex crime scene data into a final verdict.",
        llm=get_local_llm(),
        verbose=True,
        allow_delegation=False
    )