'use client';

import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';

export default function MarkdownEditor() {
  const [value, setValue] = useState<string | undefined>("**Hello world!!!**");

  return (
    <div className="w-full max-w-4xl mx-auto" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={setValue}
        height={400}
        className="shadow-lg rounded-lg"
      />
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <MDEditor.Markdown source={value} />
      </div>
    </div>
  );
}
