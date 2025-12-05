// src/app/page.tsx - Redirect to client version
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to client version for full interactivity
  redirect('/home-client');
}
