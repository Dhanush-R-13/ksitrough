from crewai import Crew, Task, Process

# Import all 7 of your agent creation functions
from agents.extractor_agent import create_extractor
from agents.timeline_agent import create_timeline
from agents.profiler_agent import create_profiler
from agents.forensic_agent import create_forensic
from agents.comparator_agent import create_comparator
from agents.judge_agent import create_judge
from agents.report_agent import create_reporter

def run_witness_analysis(crime_scene: str, witness_data: str):
    """
    This is the exact function name that main.py is looking for.
    It takes the inputs from the API, runs the 7-agent local pipeline,
    and returns the final report.
    """
    
    # 1. Initialize all 7 Agents (they will automatically use Qwen3 via your service file)
    extractor = create_extractor()
    timeline = create_timeline()
    profiler = create_profiler()
    forensic = create_forensic()
    comparator = create_comparator()
    judge = create_judge()
    reporter = create_reporter()

    # 2. Define the Tasks for the Agents
    extract_task = Task(
        description=f"Extract objective, raw facts from the following witness statements: {witness_data}",
        expected_output="A bulleted list of raw facts and actions.",
        agent=extractor
    )

    timeline_task = Task(
        description="Take the extracted facts and organize them into a strict chronological timeline. Flag any missing time gaps.",
        expected_output="A chronological timeline of events.",
        agent=timeline
    )

    profile_task = Task(
        description=f"Analyze these witness statements for deceptive language, cognitive bias, and emotional framing: {witness_data}",
        expected_output="A psychological profile and bias warning for each witness.",
        agent=profiler
    )

    forensic_task = Task(
        description=f"Compare the witness claims to this physical Ground Truth of the crime scene: {crime_scene}. Flag any physical impossibilities.",
        expected_output="A forensic physics report highlighting impossible claims.",
        agent=forensic
    )

    compare_task = Task(
        description=f"Cross-reference all these witness statements against each other and list every single direct contradiction: {witness_data}",
        expected_output="A list of direct contradictions between witnesses.",
        agent=comparator
    )

    judge_task = Task(
        description="Review the timeline, profiles, forensic analysis, and contradictions. Calculate a 'Reliability Score' (0-100%) for each witness and declare what actually happened.",
        expected_output="A final verdict with reliability scores for all witnesses.",
        agent=judge
    )

    report_task = Task(
        description="""Synthesize the findings from the other agents. 
        You MUST output your final answer as a single, raw JSON object. Do not output anything outside of the JSON.
        
        Your JSON object must contain exactly these 5 keys:
        "agreed": (integer, number of agreed facts),
        "contradictions": (integer, number of contradictions),
        "gaps": (integer, number of evidence gaps),
        "confidence": (integer, overall confidence score out of 100),
        "verdict": (string, write a detailed 3-4 sentence summary of who is reliable, who is lying, and what the police should do).
        
        EXAMPLE FORMAT:
        {
            "agreed": 5,
            "contradictions": 2,
            "gaps": 1,
            "confidence": 85,
            "verdict": "Witness 2 is highly reliable as they match the ground truth. Witness 3 is hallucinating details about the weather. Prioritize the search for the silver sedan."
        }
        """,
        expected_output="A strict JSON object containing the 4 metrics and the text verdict.",
        agent=reporter # (Change this to whatever your final agent is named)
    )
    # 3. Form the 7-Agent Crew
    # Because you are running locally, we removed max_rpm and sleep callbacks!
    crew = Crew(
        agents=[extractor, timeline, profiler, forensic, comparator, judge, reporter],
        tasks=[extract_task, timeline_task, profile_task, forensic_task, compare_task, judge_task, report_task],
        process=Process.sequential,
        verbose=True
    )

    # 4. Start the pipeline and return the result
    return crew.kickoff()