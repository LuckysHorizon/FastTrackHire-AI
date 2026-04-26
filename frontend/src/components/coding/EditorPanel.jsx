import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';

const EXT_MAP = {
  python: 'py',
  javascript: 'js',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
};

const LANG_COLORS = {
  python: '#3776AB',
  javascript: '#F7DF1E',
  java: '#ED8B00',
  cpp: '#00599C',
  go: '#00ACD7',
};

const EditorPanel = ({ code, language, onChange }) => {
  const editorRef = useRef(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);

  const ext = EXT_MAP[language] || language;
  const langColor = LANG_COLORS[language] || '#888';

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1E1E2E] overflow-hidden">
      {/* Editor Title Bar */}
      <div className="h-10 bg-[#16161E] flex items-center px-4 gap-3 shrink-0 border-b border-white/5">
        {/* File tab */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E2E] rounded-t border-t-2 text-white/80"
          style={{ borderColor: langColor }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
          <span className="text-[12px] font-mono text-white/70">solution.{ext}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language === 'cpp' ? 'cpp' : language}
          value={code || ''}
          onChange={onChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            wordWrap: 'off',
            tabSize: language === 'python' ? 4 : 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            renderWhitespace: 'none',
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              useShadows: false,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('fasttrack-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff79c6' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'number', foreground: 'bd93f9' },
                { token: 'type', foreground: '8be9fd' },
                { token: 'function', foreground: '50fa7b' },
              ],
              colors: {
                'editor.background': '#1E1E2E',
                'editor.foreground': '#CDD6F4',
                'editor.lineHighlightBackground': '#2A2A3E',
                'editorCursor.foreground': '#F38BA8',
                'editor.selectionBackground': '#45475A',
                'editorLineNumber.foreground': '#45475A',
                'editorLineNumber.activeForeground': '#CDD6F4',
                'scrollbar.shadow': '#00000000',
                'editorGutter.background': '#1E1E2E',
              },
            });
            monaco.editor.setTheme('fasttrack-dark');
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007ACC] flex items-center px-4 gap-6 shrink-0">
        <span className="text-[11px] text-white/80 font-mono">
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="text-[11px] text-white/60 font-mono">UTF-8</span>
        <span className="text-[11px] text-white/60 font-mono">
          {language === 'python' ? 'Spaces: 4' : 'Spaces: 2'}
        </span>
        <div className="flex-1" />
        <span className="text-[11px] text-white/80 font-mono uppercase tracking-wider">{language}</span>
      </div>
    </div>
  );
};

export default EditorPanel;
