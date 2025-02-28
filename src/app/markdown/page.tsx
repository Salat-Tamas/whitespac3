'use client';

import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor'),
  { ssr: false }
);

export default function MarkdownPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Markdown Editor</h1>
      <MarkdownEditor />
    </div>
  );
}
