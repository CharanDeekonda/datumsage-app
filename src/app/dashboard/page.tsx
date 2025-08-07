// File: src/app/dashboard/page.tsx - FINAL VERSION

'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// --- TYPE DEFINITIONS ---
interface DecodedToken { email: string; }
interface Dataset {
  id: number;
  file_name: string;
  upload_date: string;
  storage_path: string;
}
interface DatasetInfo {
  shape: [number, number];
  columns: string[];
  preview: Record<string, unknown>[];
}
interface QueryResult {
  data: Record<string, unknown>[];
  columns: string[];
}
interface Visualization {
    type: string;
    title: string;
    image: string;
}
interface ApiError { error: string; }

export default function DashboardPage() {
  // --- STATE MANAGEMENT ---
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [question, setQuestion] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [isVisualizing, setIsVisualizing] = useState(false);

  const router = useRouter();

  // --- DATA FETCHING ---
  const fetchDatasets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        handleLogout();
        return;
    };
    try {
      const response = await axios.get('/api/datasets', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setDatasets(response.data.datasets);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setUserEmail(decodedToken.email);
        fetchDatasets();
      } catch (error) { handleLogout(); }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  // --- EVENT HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadStatus('Uploading and analyzing...');
    const formData = new FormData();
    formData.append('file', selectedFile);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/ai/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // After upload, immediately switch to analysis view
      await fetchDatasets();
      setSelectedDataset(response.data.newDataset);
      setDatasetInfo(response.data.dataset_info);
      setUploadStatus('');
      setSelectedFile(null);

    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<ApiError>;
            setUploadStatus(axiosError.response?.data?.error || 'Upload failed.');
        } else {
            setUploadStatus('An unexpected error occurred.');
        }
    }
  };

  const handleSelectDataset = async (dataset: Dataset) => {
      setSelectedDataset(dataset);
      // This is a placeholder for fetching initial analysis for an existing dataset
      // For now, we just switch views.
  };

  const handleQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question || !selectedDataset) return;
    setIsQuerying(true);
    setQueryResult(null);
    try {
      const response = await axios.post('/api/ai/query', {
        dataset_id: selectedDataset.storage_path, // Use the permanent path
        query: question,
      });
      setQueryResult(response.data.result);
      setSqlQuery(response.data.sql_query);
    } catch (err) {
      console.error("Query failed:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleVisualize = async () => {
    if (!selectedDataset) return;
    setIsVisualizing(true);
    setVisualizations([]);
    try {
        const response = await axios.post('/api/ai/visualize', {
            dataset_id: selectedDataset.storage_path
        });
        setVisualizations(response.data.visualizations);
    } catch (err) {
      console.error("Visualization failed:", err);
    } finally {
        setIsVisualizing(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen text-white">
      <nav className="bg-black/30 border-b border-white/10 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">DatumSage</h1>
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-gray-300 mr-4 hidden sm:block">{userEmail}</span>
                    <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium bg-white/10 rounded-md hover:bg-white/20 transition-colors">Logout</button>
                </div>
            </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {selectedDataset ? (
            // --- ANALYSIS VIEW ---
            <>
              <button onClick={() => { setSelectedDataset(null); setDatasetInfo(null); }} className="text-sm text-gray-400 hover:text-white mb-4">&larr; Back to Datasets</button>
              
              {/* Dataset Overview */}
              {datasetInfo && (
                <div className="bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(255, 0, 0, 0.4)' }}>
                  <h2 className="text-2xl font-semibold mb-4">Dataset Overview: <span className="text-purple-400">{selectedDataset.file_name}</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <p><strong>Shape:</strong> {datasetInfo.shape[0]} rows, {datasetInfo.shape[1]} columns</p>
                      <p><strong>Columns:</strong> {datasetInfo.columns.join(', ')}</p>
                  </div>
                  <h3 className="font-semibold mt-4 mb-2">Data Preview:</h3>
                  <div className="overflow-x-auto">
                      <table className="min-w-full text-xs text-left">
                          <thead className="bg-white/5">
                              <tr>{datasetInfo.columns.map(col => <th key={col} className="p-2">{col}</th>)}</tr>
                          </thead>
                          <tbody>
                              {datasetInfo.preview.map((row, i) => <tr key={i} className="border-b border-white/10">{datasetInfo.columns.map(col => <td key={col} className="p-2">{String(row[col])}</td>)}</tr>)}
                          </tbody>
                      </table>
                  </div>
                </div>
              )}

              {/* Natural Language Query */}
              <div className="bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(0, 153, 208, 0.4)' }}>
                <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
                <form onSubmit={handleQuery}>
                  <div className="flex items-center space-x-4">
                    <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., 'What are the top 5 countries by population?'" className="flex-grow h-12 w-full bg-white/10 rounded-md px-4 text-sm font-light text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
                    <button type="submit" className="w-auto px-6 py-3 text-sm font-medium bg-white text-[#080710] rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors" disabled={isQuerying}>
                      {isQuerying ? 'Thinking...' : 'Query'}
                    </button>
                  </div>
                </form>
                {queryResult && (
                    <div className="mt-4 p-4 bg-white/5 rounded-md" style={{ boxShadow: '0 4px 24px 0 rgba(255, 255, 255, 0.3)' }}>
                        <h3 className="font-semibold mb-2">Query Result:</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-white/10">
                                    <tr>{queryResult.columns.map(col => <th key={col} className="p-2">{col}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {queryResult.data.map((row, i) => <tr key={i} className="border-b border-white/10">{queryResult.columns.map(col => <td key={col} className="p-2">{String(row[col])}</td>)}</tr>)}
                                </tbody>
                            </table>
                        </div>
                        {/* <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-gray-400">Show SQL Query</summary>
                            <code className="block bg-black/50 p-2 rounded-md mt-1 text-gray-300">{sqlQuery}</code>
                        </details> */}
                    </div>
                )}
              </div>

              {/* Visualizations */}
              <div className="bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(255, 213, 0, 0.4)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Automatic Visualizations</h2>
                    <button onClick={handleVisualize} className="w-auto px-4 py-2 text-sm font-medium bg-white/10 rounded-md hover:bg-white/20 transition-colors" disabled={isVisualizing}>
                      {isVisualizing ? 'Generating...' : 'Generate Charts'}
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    {visualizations.map((viz, i) => (
                        <div key={i}>
                            <h3 className="font-semibold mb-2">{viz.title}</h3>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`data:image/png;base64,${viz.image}`} alt={viz.title} className="rounded-md shadow-lg" />
                        </div>
                    ))}
                </div>
              </div>
            </>
          ) : null}
          
          {/* This section now only shows when no dataset is selected */}
          {!selectedDataset && (
            <>
              <div className="bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,255,0.5)' }}>
                <h2 className="text-2xl font-semibold mb-4">Upload New Dataset</h2>
                <form onSubmit={handleUpload}>
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" accept=".csv,.xlsx,.tsv" />
                    <button type="submit" className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-white text-[#080710] rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors" disabled={!selectedFile || uploadStatus.includes('Uploading')}>
                      {uploadStatus.includes('Uploading') ? 'Processing...' : 'Upload & Analyze'}
                    </button>
                  </div>
                </form>
                {uploadStatus && <p className="mt-4 text-sm text-gray-400">{uploadStatus}</p>}
              </div>

              <div className="bg-black/30 p-8 rounded-lg backdrop-blur-lg border border-white/10 shadow-lg">
                <h2 className="text-2xl font-semibold">Your Datasets</h2>
                <div className="mt-4">
                  {datasets.length === 0 ? (
                    <p className="text-gray-400">You have not uploaded any datasets yet.</p>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {datasets.map((dataset) => (
                        <li key={dataset.id} className="py-4 flex justify-between items-center">
                          <div>
                            <p className="text-md font-medium">{dataset.file_name}</p>
                            <p className="text-sm text-gray-400">
                              Uploaded on: {new Date(dataset.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                          <button onClick={() => handleSelectDataset(dataset)} className="px-4 py-2 text-sm font-medium bg-white/10 rounded-md hover:bg-white/20 transition-colors">
                            Analyze
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
