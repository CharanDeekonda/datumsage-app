// File: src/app/api/datasets/route.ts

import { NextResponse } from 'next/server';
// import mysql from 'mysql2/promise'; // Commented out
// import jwt from 'jsonwebtoken'; // Commented out

export async function GET(request: Request) {
  try {
    // --- ALL DATABASE & AUTH LOGIC COMMENTED OUT ---
    /*
    const authHeader = request.headers.get('Authorization');
    // ...
    const connection = await mysql.createConnection(dbConfig);
    const [datasets] = await connection.execute(
      'SELECT id, file_name, upload_date, storage_path FROM datasets WHERE user_id = ? ORDER BY upload_date DESC',
      [userId]
    );
    await connection.end();
    */

    // Always return an empty list of datasets
    return NextResponse.json({ datasets: [] });

  } catch (error) {
    console.error('Mock Get datasets error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
