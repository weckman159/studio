// src/app/page.tsx - Redirect to /posts
import { redirect } from 'next/navigation';

export default function HomePage() {
  // The main feed is now at /posts.
  redirect('/posts');
}
