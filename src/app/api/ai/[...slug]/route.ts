// File: src/app/api/ai/[...slug]/route.ts - FINAL VERSION

import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { NextRequest } from 'next/server';
import FormData from 'form-data';

// --- CONFIGURATION ---
// IMPORTANT: Make sure this is set in your Vercel Environment Variables
const PYTHON_API_URL = process.env.PYTHON_API_URL;

interface ApiError { error: string; }

// --- MAIN HANDLER ---
async function handler(req: NextRequest) {
  try {
    if (!PYTHON_API_URL) {
      throw new Error("PYTHON_API_URL is not configured in environment variables.");
    }

    const slug = req.nextUrl.pathname.replace('/api/ai/', '');
    const pythonUrl = `${PYTHON_API_URL}/${slug}`;

    let response;

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      // --- FORWARD FILE UPLOAD ---
      if (contentType.includes('multipart/form-data')) {
        const backendFormData = new FormData();
        const frontendFormData = await req.formData();
        const file = frontendFormData.get('file') as File;

        if (!file) {
          return NextResponse.json({ error: 'No file found' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);
        backendFormData.append('file', nodeBuffer, file.name);

        response = await axios.post(pythonUrl, backendFormData, {
          headers: { ...backendFormData.getHeaders() },
        });

      } else {
        // --- FORWARD JSON DATA ---
        const body = await req.json();
        response = await axios.post(pythonUrl, body);
      }
    } else {
      // Handle GET requests if any in the future
      response = await axios.get(pythonUrl);
    }

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
