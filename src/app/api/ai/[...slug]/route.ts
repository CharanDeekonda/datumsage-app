// File: src/app/api/ai/[...slug]/route.ts

import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { NextRequest } from 'next/server';
import FormData from 'form-data';
import { writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

// --- CONFIGURATION ---
const PYTHON_API_URL = 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

interface JwtPayload { userId: number; }
interface ApiError { error: string; }

// --- MAIN HANDLER ---
async function handler(req: NextRequest) {
  try {
    const slug = req.nextUrl.pathname.replace('/api/ai/', '');
    const pythonUrl = `${PYTHON_API_URL}/${slug}`;

    // --- UPLOAD LOGIC WITH PERSISTENT STORAGE ---
    if (slug === 'upload' && req.method === 'POST') {
      // 1. Authenticate user via JWT
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const userId = decoded.userId;

      // 2. Process and save the file permanently
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file found in form data' }, { status: 400 });
      }
      
      const buffer = await file.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, '_')}`;
      const storagePath = path.join(process.cwd(), 'uploads', filename);
      
      await writeFile(storagePath, nodeBuffer);

      // 3. Save file metadata to MySQL database
      const connection = await mysql.createConnection(dbConfig);
      const [result] = await connection.execute(
        'INSERT INTO datasets (user_id, file_name, storage_path) VALUES (?, ?, ?)',
        [userId, file.name, storagePath]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newDatasetId = (result as any).insertId;
      await connection.end();

      // 4. Call Python service for initial analysis
      const form = new FormData();
      form.append('file', nodeBuffer, file.name);
      const response = await axios.post(pythonUrl, form, {
        headers: { ...form.getHeaders() },
      });

      // 5. Return all necessary info to the frontend
      response.data.newDataset = {
          id: newDatasetId,
          file_name: file.name,
          upload_date: new Date().toISOString(),
          storage_path: storagePath
      };
      return NextResponse.json(response.data);
    }

    // --- GENERIC PROXY LOGIC FOR OTHER ROUTES (query, visualize) ---
    const body = await req.json();
    const response = await axios.post(pythonUrl, body);
    return NextResponse.json(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('AI Proxy Error:', axiosError.response?.data || axiosError.message);
      return NextResponse.json(
        { error: axiosError.response?.data?.error || 'Error communicating with the AI service' },
        { status: axiosError.response?.status || 500 }
      );
    }
    console.error('AI Proxy Error (Unknown):', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred' },
      { status: 500 }
    );
  }
}

export { handler as POST };
