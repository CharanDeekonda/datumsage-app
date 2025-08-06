// File: src/app/login/page.tsx

'use client'; 

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/AuthBackground'; // Import the background

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard'); 
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || 'Login failed.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <AuthBackground />
      <form 
        onSubmit={handleSubmit}
        className="h-[520px] w-[400px] bg-black/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg backdrop-blur-lg border-2 border-white/10 shadow-2xl shadow-black/60 px-9 py-12"
      >
        <h3 className="text-3xl font-medium leading-10 text-center text-white">Login Here</h3>

        <label className="block mt-8 text-base font-medium text-white">Email</label>
        <input 
          type="email" 
          placeholder="Enter your email" 
          id="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block h-12 w-full bg-white/10 rounded-md px-4 mt-2 text-sm font-light text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
        />

        <label className="block mt-8 text-base font-medium text-white">Password</label>
        <input 
          type="password" 
          placeholder="Enter your password" 
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="block h-12 w-full bg-white/10 rounded-md px-4 mt-2 text-sm font-light text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        
        {error && <p className="text-xs text-center text-red-400 mt-4">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="mt-12 w-full bg-white text-[#080710] py-4 text-lg font-semibold rounded-md cursor-pointer hover:bg-gray-200 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>

        <div className="text-sm text-center mt-6">
          <p className="text-gray-300">
            New user?{' '}
            <Link href="/register" className="font-semibold text-white hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
