import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  ListOrdered,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Save,
  Eye,
  Code2,
  FileCode,
  FolderOpen,
  Plus,
  Check
} from 'lucide-react';

export const SkiltrixFileSystemPage: React.FC = () => {
  const [editorMode, setEditorMode] = useState<'editor' | 'code' | 'preview'>('editor');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textColor, setTextColor] = useState('#000000');
  const [activeFile, setActiveFile] = useState('views.py');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState([
    { name: 'views.py', type: 'python' },
    { name: 'models.py', type: 'python' },
    { name: 'urls.py', type: 'python' },
    { name: 'admin.py', type: 'python' },
    { name: 'script.js', type: 'js' },
    { name: 'fetch.js', type: 'js' }
  ]);

  const [fileBuffers, setFileBuffers] = useState<Record<string, string>>({
    'views.py': `from django.shortcuts import render, redirect
from django.views import View
from django.http import JsonResponse
from shared_lib.skiltrix_core.models import Language, Course, Internship

class FileSystem(View):
    def get(self, request):
        if request.user.is_authenticated:
            items = ["views.py", "models.py", "urls.py", "admin.py"]
            return render(request, "files.html", {"items": items})
        return redirect("access_restricted")

    def post(self, request):
        return JsonResponse({"status": "saved"})`,

    'models.py': `from django.db import models
from shared_lib.sfs_core.models import AllUsers

class Course(models.Model):
    course_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default="beginner")
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)`,

    'urls.py': `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompaniesViewSet, InternshipViewSet, CoursesViewSet

router = DefaultRouter()
router.register(r"companies", CompaniesViewSet, basename="companies")
router.register(r"internships", InternshipViewSet, basename="internships")
router.register(r"courses", CoursesViewSet, basename="courses")

urlpatterns = [
    path("api/", include(router.urls)),
]`,

    'admin.py': `from django.contrib import admin
from shared_lib.skiltrix_core.models import Companies, Internship, Courses

admin.site.register(Companies)
admin.site.register(Internship)
admin.site.register(Courses)`,

    'script.js': `// Dynamic document synchronization client
document.addEventListener("DOMContentLoaded", () => {
    const editor = document.querySelector(".con-editable");
    const saveBtn = document.querySelector("#save-doc-btn");

    saveBtn?.addEventListener("click", async () => {
        console.log("Document serialized successfully.");
    });
});`,

    'fetch.js': `// SkilTrix Unified API Gateway Client
export async function fetchFileBuffer(fileName) {
    const response = await fetch(\`/api/files/\${fileName}\`);
    return await response.json();
}`
  });

  const handleCreateFile = () => {
    const fileName = prompt('Enter new filename (e.g. settings.py, style.css):');
    if (fileName && !fileBuffers[fileName]) {
      const ext = fileName.split('.').pop() || 'txt';
      setFiles(prev => [...prev, { name: fileName, type: ext }]);
      setFileBuffers(prev => ({
        ...prev,
        [fileName]: `// File: ${fileName}\n// Created in SkilTrix Live File System\n`
      }));
      setActiveFile(fileName);
    }
  };

  const handleSaveBuffer = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const executeCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    executeCmd('fontSize', '4'); // standard browser scale approximation
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextColor(e.target.value);
    executeCmd('foreColor', e.target.value);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SkilTrix File System & Rich Editor</h1>
          <p className="page-subtitle">Interactive document composer, source explorer, and editor toolbar</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${editorMode === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setEditorMode('editor')}
          >
            WYSIWYG Editor
          </button>
          <button
            className={`btn btn-sm ${editorMode === 'code' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setEditorMode('code')}
          >
            <Code2 size={14} />
            <span>Code View</span>
          </button>
          <button
            className={`btn btn-sm ${editorMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setEditorMode('preview')}
          >
            <Eye size={14} />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      <div className="skiltrix-editor-grid">
        {/* File Explorer Tree matching files.html items */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <FolderOpen size={16} />
              <span>PROJECT FILES</span>
            </div>
            <button
              className="action-btn"
              onClick={handleCreateFile}
              title="Add New File"
              style={{ width: '24px', height: '24px', padding: 0 }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {files.map(file => (
              <div
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: activeFile === file.name ? 'var(--primary)' : 'transparent',
                  color: activeFile === file.name ? 'white' : 'var(--text-main)',
                  fontWeight: activeFile === file.name ? 600 : 400
                }}
              >
                <FileCode size={14} />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* WYSIWYG Editor Toolbar matching backend files.html .editor */}
          {editorMode === 'editor' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '0.65rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.02)'
              }}
            >
              {/* History */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="action-btn" onClick={() => executeCmd('undo')} title="Undo">
                  <RotateCcw size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('redo')} title="Redo">
                  <RotateCw size={16} />
                </button>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

              {/* Text Formats */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="action-btn" onClick={() => executeCmd('bold')} title="Bold">
                  <Bold size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('italic')} title="Italic">
                  <Italic size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('underline')} title="Underline">
                  <Underline size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('strikeThrough')} title="Strikethrough">
                  <Strikethrough size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('subscript')} title="Subscript">
                  <Subscript size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('superscript')} title="Superscript">
                  <Superscript size={16} />
                </button>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

              {/* Lists */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="action-btn" onClick={() => executeCmd('insertOrderedList')} title="Numbered List">
                  <ListOrdered size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('insertUnorderedList')} title="Bullet List">
                  <List size={16} />
                </button>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

              {/* Alignment */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="action-btn" onClick={() => executeCmd('justifyLeft')} title="Align Left">
                  <AlignLeft size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('justifyCenter')} title="Align Center">
                  <AlignCenter size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('justifyRight')} title="Align Right">
                  <AlignRight size={16} />
                </button>
                <button className="action-btn" onClick={() => executeCmd('justifyFull')} title="Justify">
                  <AlignJustify size={16} />
                </button>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

              {/* Font Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  className="form-select"
                  style={{ width: '110px', height: '32px', padding: '2px 8px', fontSize: '0.8rem' }}
                  value={fontFamily}
                  onChange={e => {
                    setFontFamily(e.target.value);
                    executeCmd('fontName', e.target.value);
                  }}
                >
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Times / Serif</option>
                  <option value="monospace">Monospace</option>
                </select>

                <select
                  className="form-select"
                  style={{ width: '68px', height: '32px', padding: '2px 8px', fontSize: '0.8rem' }}
                  value={fontSize}
                  onChange={e => handleFontSizeChange(e.target.value)}
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="32">32px</option>
                </select>

                <input
                  type="color"
                  value={textColor}
                  onChange={handleColorChange}
                  style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  title="Font Color"
                />
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

              {/* Insertions */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  className="action-btn"
                  onClick={() => {
                    const url = prompt('Enter link URL:');
                    if (url) executeCmd('createLink', url);
                  }}
                  title="Insert Link"
                >
                  <Link2 size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) executeCmd('insertImage', url);
                  }}
                  title="Insert Image"
                >
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Mode 1: ContentEditable Editor Canvas matching .con-editable */}
          {editorMode === 'editor' && (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                minHeight: '400px',
                padding: '1.5rem',
                outline: 'none',
                lineHeight: '1.6',
                fontFamily
              }}
            >
              <h2>Ascentracore Solutions Technical Documentation</h2>
              <p>
                Welcome to the unified <b>SkilTrix</b> technical document editor. Use the comprehensive formatting tools in the top bar to format code snippets, lists, mathematical sub/superscripts, and tables.
              </p>
              <ul>
                <li>Integrated with Django REST API backends</li>
                <li>Real-time client-side preview and formatting</li>
                <li>Direct file system synchronization</li>
              </ul>
            </div>
          )}

          {/* Mode 2: Code Syntax Viewer matching files.html .code-container */}
          {editorMode === 'code' && (
            <div style={{ display: 'flex', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.88rem', overflowX: 'auto', minHeight: '400px' }}>
              <div style={{ padding: '1rem 0.75rem', background: '#252526', color: '#858585', textAlign: 'right', borderRight: '1px solid #333', userSelect: 'none' }}>
                {(fileBuffers[activeFile] || '').split('\n').map((_, i) => (
                  <div key={i} style={{ height: '22px' }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                value={fileBuffers[activeFile] || ''}
                onChange={e => setFileBuffers(prev => ({ ...prev, [activeFile]: e.target.value }))}
                style={{
                  margin: 0,
                  padding: '1rem',
                  lineHeight: '22px',
                  flex: 1,
                  background: 'transparent',
                  color: '#d4d4d4',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem',
                  resize: 'none',
                  minHeight: '400px'
                }}
              />
            </div>
          )}

          {/* Mode 3: Preview */}
          {editorMode === 'preview' && (
            <div style={{ minHeight: '400px', padding: '2rem', background: 'var(--bg-card)' }}>
              <div style={{ padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ color: 'var(--primary)', margin: 0 }}>Rendered Document Preview</h2>
                  <span className="badge badge-active">{activeFile}</span>
                </div>
                <pre
                  style={{
                    background: 'var(--bg-main)',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}
                >
                  {fileBuffers[activeFile] || '// Empty buffer'}
                </pre>
              </div>
            </div>
          )}

          {/* Editor Footer matching save button */}
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Active Buffer: <b>{activeFile}</b> • UTF-8 Encoding
              </span>
              {saveSuccess && (
                <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <Check size={12} />
                  <span>Saved to buffer</span>
                </span>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveBuffer}
            >
              <Save size={14} />
              <span>Save Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
