// File: src/app/api/db-health/route.ts

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    // Execute a simple query to check the connection
    const [rows] = await connection.execute('SELECT NOW();') as [Array<{ 'NOW()': string }>, unknown];

    // Close the connection
    await connection.end();

    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection is healthy.',
      database_time: rows[0]['NOW()'] 
    });

  } catch (error) {
    console.error('Database connection error:', error);
    // In case of an error, return a 500 status code and the error message
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to the database.'
      }, 
      { status: 500 }
    );
  }
}