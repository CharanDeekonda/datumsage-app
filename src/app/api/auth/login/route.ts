// File: src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
// import mysql, { RowDataPacket } from 'mysql2/promise'; // Commented out
// import bcrypt from 'bcryptjs'; // Commented out
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    console.log(`Mock Login attempt for: ${email}`);

    // --- DATABASE LOGIC COMMENTED OUT ---
    /*
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    await connection.end();
    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    */

    // Create a fake JWT token for the mock user
    const token = jwt.sign(
      { userId: 1, email: email }, // Use a dummy user ID and the provided email
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'Login successful (mock).', token });

  } catch (error) {
    console.error('Mock Login error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
