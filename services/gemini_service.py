import os
from crewai import LLM

def get_local_llm():
    """Returns the local Qwen3:4b model via Ollama."""
    return LLM(
        model="ollama/qwen3:4b",
        base_url="http://localhost:11434",
        temperature=0.1
    )

def get_gemini_llm_pinned(slot=None): return get_local_llm()
def get_groq_llm_fast(): return get_local_llm()
def get_groq_llm_smart(): return get_local_llm()
def get_groq_llm_timeline(): return get_local_llm()