// File: src/app/api/ai/[...slug]/route.ts

import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { NextRequest } from 'next/server';
import FormData from 'form-data';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Readable } from 'stream';

// The base URL of our running Python AI service
const PYTHON_API_URL = 'http://localhost:5001';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

async function handler(req: NextRequest) {
  try {
    const slug = req.nextUrl.pathname.replace('/api/ai/', '');
    const pythonUrl = `${PYTHON_API_URL}/${slug}`;

    let response;

    if (req.method === 'POST') {
      // Check if it's a file upload (multipart/form-data)
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file found in form data' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);

        const form = new FormData();
        form.append('file', nodeBuffer, file.name);

        response = await axios.post(pythonUrl, form, {
          headers: {
            ...form.getHeaders(),
          },
        });
      } else {
        // It's a regular JSON POST request
        const body = await req.json();
        response = await axios.post(pythonUrl, body);
      }
    } else {
      // Handle GET requests if any in the future
      response = await axios.get(pythonUrl);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    // This is the corrected, type-safe error handling block
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error('AI Proxy Error:', axiosError.response?.data || axiosError.message);
      return NextResponse.json(
        { error: axiosError.response?.data?.error || 'Error communicating with the AI service' },
        { status: axiosError.response?.status || 500 }
      );
    }
    // Fallback for non-Axios errors
    console.error('AI Proxy Error (Unknown):', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred' },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
