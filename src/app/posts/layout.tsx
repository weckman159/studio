import React from 'react';

// This layout wraps the entire posts section, providing a consistent container.
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
