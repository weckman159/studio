// components/CKEditorWrapper.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";

// This is a dynamic import. It will only be loaded on the client side.
const ClassicEditor = require('@ckeditor/ckeditor5-build-classic');

interface CKEditorWrapperProps {
  initialData: string;
  onChange: (data: string) => void;
}

const CKEditorWrapper = ({ initialData, onChange }: CKEditorWrapperProps) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // This effect ensures that the component is only rendered on the client side.
    editorRef.current = {
      CKEditor,
      ClassicEditor
    };
  }, []);

  if (!editorRef.current) {
    return <div>Загрузка редактора...</div>;
  }

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
