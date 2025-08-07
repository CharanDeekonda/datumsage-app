// File: src/app/page.tsx

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Change this line to redirect to the dashboard
  redirect('/dashboard');
}