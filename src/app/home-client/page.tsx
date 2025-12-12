// src/app/home-client/page.tsx - Redirect to /posts
import { redirect } from 'next/navigation';

export default function HomeClientPage() {
  // The main feed is now at /posts.
  redirect('/posts');
}
