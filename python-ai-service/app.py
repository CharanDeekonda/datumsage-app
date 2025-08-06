# File: python-ai-service/app.py - FINAL SIMPLIFIED VERSION

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
import sqlite3
import uuid
import io
import base64
import matplotlib
matplotlib.use('Agg') # Use a non-interactive backend for matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
from werkzeug.utils import secure_filename
import tempfile

# Import the necessary components from langchain
from langchain_experimental.agents.agent_toolkits import create_csv_agent
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

# Set the API key as an environment variable for the library
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

# Initialize the Gemini model once, globally
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest",
    temperature=0.1
)

# Initialize Flask app
app = Flask(__name__)
CORS(app) 

# --- HELPER FUNCTIONS (for upload and visualize) ---

def load_dataset(file_path):
    """Load dataset based on file type"""
    file_extension = file_path.split('.')[-1].lower()
    if file_extension == 'csv':
        return pd.read_csv(file_path)
    elif file_extension == 'xlsx':
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

def create_visualization(df, viz_type, column=None):
    """Create visualization and return base64 encoded image"""
    plt.figure(figsize=(10, 6))
    
    if viz_type == 'histogram' and column:
        sns.histplot(df[column], kde=True, color='#8B5CF6')
        plt.title(f'Distribution of {column}')
    elif viz_type == 'countplot' and column:
        sns.countplot(x=column, data=df, palette='viridis')
        plt.title(f'Count of {column}')
        plt.xticks(rotation=45, ha='right')
    elif viz_type == 'correlation':
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 1:
            sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm')
            plt.title('Correlation Matrix')
    
    plt.tight_layout()
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=100)
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return image_base64

# --- API ROUTES ---

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        filename = secure_filename(file.filename)
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{filename}")
        file.save(temp_file_path)

        df = load_dataset(temp_file_path)
        
        dataset_info = {
            'shape': df.shape,
            'columns': df.columns.tolist(),
            'preview': df.head().to_dict('records'),
            'missing_values': df.isnull().sum().to_dict(),
        }
        
        return jsonify({
            'success': True,
            'dataset_info': dataset_info,
            'dataset_id': temp_file_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def process_query():
    data = request.json
    file_path = data.get('dataset_id')
    question = data.get('query')

    if not file_path or not question:
        return jsonify({"error": "file_path and question are required"}), 400
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"File not found at path: {file_path}"}), 404

    try:
        # --- THIS IS THE IMPROVED PROMPT ---
        # We give the agent a more detailed, step-by-step instruction
        agent_prompt = f"""
        You are an expert data analyst working with a pandas dataframe.
        Your task is to answer the following question: '{question}'
        
        Follow these steps precisely:
        1.  The dataframe is already loaded for you. Do not create a sample dataframe.
        2.  If the user asks about efficiency or 'trips per vehicle', you must first create a new column named 'trips_per_vehicle' by dividing the 'trips' column by the 'active_vehicles' column.
        3.  After any necessary calculations, perform the main analysis based on the user's question.
        4.  Your final answer must be a concise, text-based summary of your findings.
        """

        # Create a specialized CSV agent
        agent = create_csv_agent(
            llm,
            file_path,
            verbose=True,
            allow_dangerous_code=True
        )
        
        # Run the agent with our new, improved prompt
        result = agent.invoke(agent_prompt)
        
        sql_query = "Agent executed Python code via pandas to find the answer."
        output_text = result.get('output', str(result))

        final_result = {
            "data": [{"Answer": line} for line in output_text.split('\n')],
            "columns": ["Answer"]
        }

        return jsonify({
            'success': True,
            'sql_query': sql_query,
            'result': final_result
        })

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/visualize', methods=['POST'])
def create_visualizations():
    data = request.json
    dataset_id = data.get('dataset_id')

    if not dataset_id or not os.path.exists(dataset_id):
        return jsonify({'error': 'Dataset not found'}), 400
    
    try:
        df = load_dataset(dataset_id)
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        visualizations = []
        
        if numeric_cols:
            hist_image = create_visualization(df, 'histogram', numeric_cols[0])
            visualizations.append({
                'type': 'histogram',
                'title': f'Distribution of {numeric_cols[0]}',
                'image': hist_image
            })
        
        if categorical_cols:
            count_image = create_visualization(df, 'countplot', categorical_cols[0])
            visualizations.append({
                'type': 'countplot',
                'title': f'Count by {categorical_cols[0]}',
                'image': count_image
            })
            
        if len(numeric_cols) > 1:
            corr_image = create_visualization(df, 'correlation')
            visualizations.append({
                'type': 'correlation',
                'title': 'Correlation Matrix',
                'image': corr_image
            })
            
        return jsonify({
            'success': True,
            'visualizations': visualizations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
