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
        description="""Take the Judge's raw verdict and format it into a professional, easily readable 'Final Analysis Report'.
        Structure it exactly like this:
        ---
        🚨 INCIDENT TIMELINE
        [Insert Timeline here]
        
        ⚖️ WITNESS RELIABILITY SCORES
        [Insert Scores and short reasons here]
        
        🔍 CRITICAL CONTRADICTIONS & FORENSIC FLAWS
        [Insert the biggest lies or impossible physics here]
        
        📝 CHIEF JUSTICE FINAL VERDICT
        [Insert the Judge's final conclusion here]
        ---""",
        expected_output="A beautifully formatted final report ready for the UI.",
        agent=reporter
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