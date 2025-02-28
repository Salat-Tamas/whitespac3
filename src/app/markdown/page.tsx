'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor'),
  { ssr: false }
);

export default function MarkdownPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
        <p className="text-muted-foreground mt-2">
          Write and format your content using Markdown
        </p>
      </div>
      <MarkdownEditor />
    </div>
  );
}