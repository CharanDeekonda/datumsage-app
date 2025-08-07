// File: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
// import mysql from 'mysql2/promise'; // Commented out
// import bcrypt from 'bcryptjs'; // Commented out

// --- DATABASE CODE IS NOW COMMENTED OUT ---
/*
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
*/

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid input. Email is required and password must be at least 6 characters long.' },
        { status: 400 }
      );
    }
    
    console.log(`Mock Registration for: ${email}`);

    // --- DATABASE LOGIC COMMENTED OUT ---
    /*
    const connection = await mysql.createConnection(dbConfig);
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      await connection.end();
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );
    await connection.end();
    */

    // Always return a success message
    return NextResponse.json(
      { message: 'User registered successfully (mock).' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mock Registration error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
