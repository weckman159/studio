// components/CKEditorWrapper.tsx
'use client';
import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
  initialData: string;
  onChange: (data: string) => void;
}

const CKEditorWrapper = ({ initialData, onChange }: CKEditorWrapperProps) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={initialData}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default CKEditorWrapper;
