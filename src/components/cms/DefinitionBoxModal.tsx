import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BookMarked } from 'lucide-react';

interface DefinitionBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (definitionHtml: string) => void;
}

export const DefinitionBoxModal: React.FC<DefinitionBoxModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [term, setTerm] = useState('Variable Scope');
  const [definition, setDefinition] = useState('The region of a program where a defined variable is accessible, determining its visibility and lifetime within blocks or functions.');
  const [example, setExample] = useState('Local variables defined inside main() cannot be accessed from helper functions without passing them as parameters.');

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;

    const htmlSnippet = `
      <div class="cms-definition-box" style="margin: 24px 0; border: 1px solid #059669; border-radius: 10px; background: rgba(5, 150, 105, 0.08); padding: 18px 22px; position: relative;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: #34d399; margin-bottom: 4px;">
          Formal Definition
        </div>
        <h4 style="margin: 0 0 10px 0; color: #ffffff; font-size: 1.15rem; font-weight: 700;">
          ${term.trim()}
        </h4>
        <p style="margin: 0 0 12px 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
          ${definition.trim()}
        </p>
        ${example.trim() ? `
          <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #a7f3d0;">
            <strong style="color: #6ee7b7;">Example:</strong> ${example.trim()}
          </div>
        ` : ''}
      </div>
    `;

    onInsert(htmlSnippet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Definition Box">
      <form onSubmit={handleInsert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">Term / Subject</label>
          <input
            type="text"
            className="form-input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Variable Scope"
            required
          />
        </div>

        <div>
          <label className="form-label">Definition</label>
          <textarea
            className="form-input"
            rows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Clear, authoritative definition..."
            required
          />
        </div>

        <div>
          <label className="form-label">Practical Example (Optional)</label>
          <textarea
            className="form-input"
            rows={2}
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="Concrete example illustrating this definition..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Insert Definition
          </button>
        </div>
      </form>
    </Modal>
  );
};
