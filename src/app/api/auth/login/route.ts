
// File: src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

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

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: 'Login successful.', token });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
