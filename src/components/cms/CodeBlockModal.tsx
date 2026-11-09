import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Code, Copy, Check } from 'lucide-react';

interface CodeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (codeHtml: string) => void;
}

export const CodeBlockModal: React.FC<CodeBlockModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [title, setTitle] = useState('C Variables Example');
  const [language, setLanguage] = useState('c');
  const [code, setCode] = useState(`#include <stdio.h>\n\nint main() {\n    int age = 21;\n    printf("Age: %d\\n", age);\n    return 0;\n}`);
  const [output, setOutput] = useState('Age: 21');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const escapedOutput = output
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = code.trim().split('\n');
    const lineNumbersHtml = showLineNumbers
      ? `<div class="code-line-numbers" style="user-select: none; opacity: 0.4; padding-right: 12px; border-right: 1px solid rgba(255,255,255,0.1); margin-right: 12px; text-align: right;">${lines.map((_, i) => `<div>${i + 1}</div>`).join('')}</div>`
      : '';

    const outputBlock = output.trim()
      ? `
        <div class="code-output-container" style="background: #020617; border-top: 1px solid #1e293b; padding: 12px 16px; font-family: monospace; font-size: 13px; color: #38bdf8;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">Output:</div>
          <pre style="margin: 0; white-space: pre-wrap;">${escapedOutput}</pre>
        </div>
      `
      : '';

    const htmlSnippet = `
      <div class="cms-code-block" data-lang="${language}" style="margin: 24px 0; border-radius: 10px; overflow: hidden; background: #0f172a; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
        <div class="code-header" style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 16px; border-bottom: 1px solid #334155;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; font-size: 13px; color: #f1f5f9;">${title || language.toUpperCase()}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; text-transform: uppercase; font-weight: 700;">${language}</span>
          </div>
          <button type="button" class="copy-code-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code.trim())}')); const el=this; el.innerText='Copied!'; setTimeout(()=>el.innerText='Copy', 2000);" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #f8fafc; font-size: 12px; padding: 4px 10px; border-radius: 6px; cursor: pointer;">
            Copy
          </button>
        </div>
        <div style="display: flex; padding: 16px; font-family: monospace; font-size: 14px; line-height: 1.6; color: #e2e8f0; overflow-x: auto;">
          ${lineNumbersHtml}
          <pre style="margin: 0; white-space: pre;"><code>${escapedCode}</code></pre>
        </div>
        ${outputBlock}
      </div>
    `;

    onInsert(htmlSnippet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Advanced Code Block">
      <form onSubmit={handleInsert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label">Code Block Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C Variables Example"
            />
          </div>
          <div>
            <label className="form-label">Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="bash">Bash / Shell</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Source Code</label>
          <textarea
            className="form-input"
            rows={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            placeholder="Type or paste source code here..."
            required
          />
        </div>

        <div>
          <label className="form-label">Execution Output (Optional)</label>
          <textarea
            className="form-input"
            rows={2}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            placeholder="Expected console output when compiled/run..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="show_line_nums"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
          />
          <label htmlFor="show_line_nums" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            Include line numbers in code container
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Insert Code Block
          </button>
        </div>
      </form>
    </Modal>
  );
};
