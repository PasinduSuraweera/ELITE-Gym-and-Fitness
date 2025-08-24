"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link,
  Quote,
  Code,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
  minHeight = "300px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateActiveStates();
    handleContentChange();
  };

  const updateActiveStates = () => {
    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            executeCommand('redo');
          } else {
            e.preventDefault();
            executeCommand('undo');
          }
          break;
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive 
          ? 'bg-red-600 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-gray-700 rounded-lg overflow-hidden bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-900/50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-700 pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('bold')}
            isActive={isActive.bold}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('italic')}
            isActive={isActive.italic}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('underline')}
            isActive={isActive.underline}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-700 pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'h2')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'h3')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-700 pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-700 pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('justifyRight')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Special */}
        <div className="flex gap-1 border-r border-gray-700 pr-2 mr-2">
          <ToolbarButton
            onClick={insertLink}
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'pre')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* History */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => executeCommand('undo')}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('redo')}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onMouseUp={updateActiveStates}
        onKeyUp={updateActiveStates}
        className="p-4 text-white bg-gray-800 focus:outline-none prose prose-invert max-w-none"
        style={{ minHeight }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          font-style: italic;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }
        [contenteditable] h3 {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }
        [contenteditable] p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #ef4444;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #d1d5db;
        }
        [contenteditable] pre {
          background: #1f2937;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1em 0;
          border: 1px solid #374151;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        [contenteditable] li {
          margin: 0.25em 0;
        }
        [contenteditable] a {
          color: #ef4444;
          text-decoration: underline;
        }
        [contenteditable] a:hover {
          color: #dc2626;
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
