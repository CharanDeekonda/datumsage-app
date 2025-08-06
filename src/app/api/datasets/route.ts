// File: src/app/api/datasets/route.ts

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Define a type for the decoded JWT payload
interface JwtPayload {
  userId: number;
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

export async function GET(request: Request) {
  try {
    // 1. Verify Authentication via JWT from the header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    const userId = decoded.userId;

    // 2. Fetch datasets for the authenticated user from the database
    const connection = await mysql.createConnection(dbConfig);
    const [datasets] = await connection.execute(
      // Select only the necessary columns and order by the most recent
      'SELECT id, file_name, upload_date, storage_path FROM datasets WHERE user_id = ? ORDER BY upload_date DESC',
      [userId]
    );
    await connection.end();

    // 3. Return the list of datasets to the frontend
    return NextResponse.json({ datasets });

  } catch (error) {
    console.error('Get datasets error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
