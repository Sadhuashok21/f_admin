import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, LayoutGrid, Sparkles } from 'lucide-react';

interface TopicCardItem {
  name: string;
  desc: string;
  url: string;
}

interface TopicCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (gridHtml: string) => void;
}

// 32 C Variable and Keyword types preset
const DEFAULT_32_VARIABLES: TopicCardItem[] = [
  { name: 'auto', desc: 'Automatic storage duration specifier', url: '/courses/c-programming/variables/auto' },
  { name: 'break', desc: 'Terminates loop or switch statement', url: '/courses/c-programming/variables/break' },
  { name: 'case', desc: 'Branch label in switch statements', url: '/courses/c-programming/variables/case' },
  { name: 'char', desc: 'Character integer type (1 byte)', url: '/courses/c-programming/variables/char' },
  { name: 'const', desc: 'Read-only variable qualifier', url: '/courses/c-programming/variables/const' },
  { name: 'continue', desc: 'Skips to next loop iteration', url: '/courses/c-programming/variables/continue' },
  { name: 'default', desc: 'Catch-all switch statement case', url: '/courses/c-programming/variables/default' },
  { name: 'do', desc: 'Post-test iterative loop statement', url: '/courses/c-programming/variables/do' },
  { name: 'double', desc: 'Double-precision floating point (8 bytes)', url: '/courses/c-programming/variables/double' },
  { name: 'else', desc: 'Alternative conditional statement', url: '/courses/c-programming/variables/else' },
  { name: 'enum', desc: 'Enumerated integer constant list', url: '/courses/c-programming/variables/enum' },
  { name: 'extern', desc: 'External linkage identifier', url: '/courses/c-programming/variables/extern' },
  { name: 'float', desc: 'Single-precision floating point (4 bytes)', url: '/courses/c-programming/variables/float' },
  { name: 'for', desc: 'Indexed looping control construct', url: '/courses/c-programming/variables/for' },
  { name: 'goto', desc: 'Unconditional jump to label', url: '/courses/c-programming/variables/goto' },
  { name: 'if', desc: 'Conditional decision branch statement', url: '/courses/c-programming/variables/if' },
  { name: 'int', desc: 'Standard integer type (4 bytes)', url: '/courses/c-programming/variables/int' },
  { name: 'long', desc: 'Extended integer type specifier', url: '/courses/c-programming/variables/long' },
  { name: 'register', desc: 'Fast CPU register storage hint', url: '/courses/c-programming/variables/register' },
  { name: 'return', desc: 'Exits function with return value', url: '/courses/c-programming/variables/return' },
  { name: 'short', desc: 'Compact integer specifier (2 bytes)', url: '/courses/c-programming/variables/short' },
  { name: 'signed', desc: 'Explicitly signed integer representation', url: '/courses/c-programming/variables/signed' },
  { name: 'sizeof', desc: 'Compile-time memory size operator', url: '/courses/c-programming/variables/sizeof' },
  { name: 'static', desc: 'Preserves variable lifetime across calls', url: '/courses/c-programming/variables/static' },
  { name: 'struct', desc: 'Composite heterogeneous data structure', url: '/courses/c-programming/variables/struct' },
  { name: 'switch', desc: 'Multi-way conditional branching table', url: '/courses/c-programming/variables/switch' },
  { name: 'typedef', desc: 'Type aliasing synonym definition', url: '/courses/c-programming/variables/typedef' },
  { name: 'union', desc: 'Overlapping memory storage union', url: '/courses/c-programming/variables/union' },
  { name: 'unsigned', desc: 'Non-negative integer specifier', url: '/courses/c-programming/variables/unsigned' },
  { name: 'void', desc: 'Empty type or generic pointer representation', url: '/courses/c-programming/variables/void' },
  { name: 'volatile', desc: 'Suppresses compiler optimization on reads', url: '/courses/c-programming/variables/volatile' },
  { name: 'while', desc: 'Pre-test iterative loop statement', url: '/courses/c-programming/variables/while' },
];

export const TopicCardsModal: React.FC<TopicCardsModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [gridTitle, setGridTitle] = useState('All 32 Standard C Variables & Keywords');
  const [cards, setCards] = useState<TopicCardItem[]>(DEFAULT_32_VARIABLES);

  const handleAddCard = () => {
    setCards(prev => [...prev, { name: 'New Topic', desc: 'Brief description...', url: '#' }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: keyof TopicCardItem, val: string) => {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: val } : c));
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();

    const cardsHtml = cards.map(c => `
      <a href="${c.url}" class="cms-topic-card" style="display: block; text-decoration: none; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 16px; transition: transform 0.2s ease, border-color 0.2s ease;">
        <div style="font-weight: 700; font-size: 15px; color: #38bdf8; margin-bottom: 4px; font-family: monospace;">${c.name}</div>
        <div style="font-size: 13px; color: #94a3b8; line-height: 1.4;">${c.desc}</div>
      </a>
    `).join('');

    const htmlSnippet = `
      <div class="cms-topic-grid-wrapper" style="margin: 32px 0;">
        ${gridTitle ? `<h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">${gridTitle}</h3>` : ''}
        <div class="cms-topic-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
          ${cardsHtml}
        </div>
      </div>
    `;

    onInsert(htmlSnippet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Multiple Topic Cards Grid (e.g. 32 Variables)">
      <form onSubmit={handleInsert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">Section Heading</label>
          <input
            type="text"
            className="form-input"
            value={gridTitle}
            onChange={(e) => setGridTitle(e.target.value)}
            placeholder="e.g. All 32 Variables in C"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            Cards Count: {cards.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCards(DEFAULT_32_VARIABLES)}
              title="Reset to the 32 C keywords standard set"
            >
              <Sparkles size={14} color="#38bdf8" />
              <span>Load 32 Variables Preset</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddCard}
            >
              <Plus size={14} />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {cards.map((card, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr 2fr auto',
                gap: '8px',
                alignItems: 'center',
                background: '#070b13',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #1e293b'
              }}
            >
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px', fontFamily: 'monospace' }}
                value={card.name}
                onChange={(e) => handleCardChange(idx, 'name', e.target.value)}
                placeholder="Topic Name"
              />
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
                value={card.desc}
                onChange={(e) => handleCardChange(idx, 'desc', e.target.value)}
                placeholder="Short Description"
              />
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
                value={card.url}
                onChange={(e) => handleCardChange(idx, 'url', e.target.value)}
                placeholder="/courses/.../topic"
              />
              <button
                type="button"
                onClick={() => handleRemoveCard(idx)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                title="Remove Card"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Insert {cards.length} Topic Cards Grid
          </button>
        </div>
      </form>
    </Modal>
  );
};
