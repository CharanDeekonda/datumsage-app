DatumSage: AI-Powered Conversational Data Analysis Platform
DatumSage is a full-stack, multi-user web application that empowers users to analyze and visualize their data through natural language conversation. It leverages a powerful AI agent to understand user queries, perform complex data analysis on uploaded datasets (CSV, TSV, XLSX), and generate insightful summaries and charts, making data science accessible to everyone.

(Note: You should replace this with a real screenshot of your dashboard)

✨ Features
Multi-Format Support: Upload and analyze datasets in various formats, including CSV, TSV, and XLSX.

Natural Language Queries: Ask complex questions about your data in plain English (e.g., "What were the top 5 selling products last month?").

AI-Powered Analysis: Utilizes a LangChain Pandas Agent with Google's Gemini Pro model to interpret questions and execute Python code on the data.

Automatic Visualizations: Instantly generate and display relevant charts and graphs (histograms, bar charts, correlation matrices) from your data.

Secure User Authentication: A complete user registration and login system using JWT for secure sessions.

Persistent Storage: User accounts and dataset metadata are securely stored in a MySQL database.

Modern UI: A sleek, responsive, and user-friendly interface built with Next.js and Tailwind CSS.

🛠️ Tech Stack & Architecture
The application is built with a modern microservice architecture to separate concerns and ensure scalability.

Frontend (Main App): Next.js (React)

Handles the user interface, page routing, and acts as the main backend server.

AI Service: Python & Flask

A dedicated microservice that exposes API endpoints for all AI-powered tasks.

Database: MySQL

Stores user data, dataset information, and chat history.

Category

Technology

Frontend

React, Next.js, TypeScript, Tailwind CSS, Axios

Backend

Node.js (within Next.js), Express.js (within Next.js), JWT

AI Service

Python, Flask, LangChain, Google Gemini, Pandas, Matplotlib, Seaborn

Database

MySQL

Dev Tools

Git, npm, pip, venv

🚀 Getting Started
Follow these instructions to set up and run the project on your local machine.

Prerequisites
Node.js (v18.18.0 or newer)

Python (v3.10 or newer)

[suspicious link removed]

1. Clone the Repository
git clone [https://github.com/your-username/datumsage-app.git](https://github.com/your-username/datumsage-app.git)
cd datumsage-app

2. Configure Environment Variables
You will need two separate .env files for this project.

a. Main Application (.env.local)

Create a file named .env.local in the root directory (datumsage-app):

# .env.local
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD='your_mysql_password'
DB_DATABASE=datumsage_db
JWT_SECRET='your_super_secret_jwt_key'
PYTHON_API_URL='http://localhost:5001'

b. Python AI Service (.env)

Create a file named .env inside the python-ai-service directory:

# python-ai-service/.env
GEMINI_API_KEY="your_google_ai_studio_api_key"

3. Set Up the Database
Connect to your local MySQL server.

Create the database: CREATE DATABASE datumsage_db;

Run the table creation scripts (found in the project documentation or previous setup steps).

4. Install Dependencies & Run
You will need two terminals running simultaneously.

Terminal 1: Start the Main Application (Next.js)

# In the root 'datumsage-app' folder
npm install
npm run dev

Your app will be available at http://localhost:3000.

Terminal 2: Start the Python AI Service

# In the 'python-ai-service' folder
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate # On macOS/Linux

pip install -r requirements.txt
python app.py

The AI service will be running at http://localhost:5001.

Usage
Navigate to http://localhost:3000. You will be redirected to the login page.

Create a new account and log in.

On the dashboard, upload a dataset (CSV, TSV, or XLSX).

Once uploaded, you will see a data preview and can start asking questions.

Ask a question in the query box (e.g., "What is the average age?").

Click the "Generate Charts" button to see automatic visualizations.
