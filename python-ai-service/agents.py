# File: python-ai-service/agents.py

import os
from crewai import Agent
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Set up the primary LLM that all agents will use
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    verbose=True,
    temperature=0.1,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# --- AGENT DEFINITIONS ---

data_analyst = Agent(
    role="Data Analyst",
    goal="Understand and summarize the dataset's structure and key insights",
    backstory="You are an expert data analyst skilled in exploratory data analysis, identifying patterns, and summarizing datasets.",
    llm=llm,
    verbose=True,
    allow_delegation=False
)

query_validator = Agent(
    role="Query Validator",
    goal="Validate and interpret user queries for dataset analysis",
    backstory="You are a natural language processing expert who validates and translates user queries into actionable data tasks.",
    llm=llm,
    verbose=True,
    allow_delegation=False
)

sql_generator = Agent(
    role="SQL Generator",
    goal="Generate SQL queries based on validated user queries",
    backstory="You are a database expert proficient in crafting SQL queries to extract relevant data from datasets.",
    llm=llm,
    verbose=True,
    allow_delegation=False
)

visualization_expert = Agent(
    role="Visualization Expert",
    goal="Generate insightful visualizations and describe them in natural language",
    backstory="You are a data visualization specialist skilled in creating clear and informative charts and explaining them clearly.",
    llm=llm,
    verbose=True,
    allow_delegation=False
)
