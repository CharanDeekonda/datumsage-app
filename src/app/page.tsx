// File: src/app/page.tsx

import { redirect } from 'next/navigation';

export default function HomePage() {
  // This will automatically redirect any visitor from the root URL ("/")
  // to the "/login" page.
  redirect('/login');
}