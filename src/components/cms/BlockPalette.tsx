import React from 'react';
import {
  Code,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookMarked,
  Video,
  Table as TableIcon,
  Sparkles,
  Heading,
  Quote
} from 'lucide-react';

interface BlockPaletteProps {
  onInsertHtml: (htmlSnippet: string) => void;
  onOpenCodeModal: () => void;
  onOpenYouTubeModal: () => void;
  onOpenDefinitionModal: () => void;
  onOpenMediaModal: () => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  onInsertHtml,
  onOpenCodeModal,
  onOpenYouTubeModal,
  onOpenDefinitionModal,
  onOpenMediaModal,
}) => {
  const insertInfoBox = () => {
    onInsertHtml(`
      <div class="cms-callout-box cms-callout-info" style="background: rgba(30, 58, 138, 0.25); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #60a5fa; margin: 0 0 6px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#3b82f6;"></span>
          Information Note
        </h4>
        <p style="margin: 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">Enter important educational insight, architectural concept, or background explanation here...</p>
      </div>
    `);
  };

  const insertWarningBox = () => {
    onInsertHtml(`
      <div class="cms-callout-box cms-callout-warning" style="background: rgba(180, 83, 9, 0.22); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #fbbf24; margin: 0 0 6px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b;"></span>
          Important Note
        </h4>
        <p style="margin: 0; color: #fef3c7; font-size: 15px; line-height: 1.6;">Watch out for common beginner mistakes, syntax pitfalls, or compiler requirements...</p>
      </div>
    `);
  };

  const insertSuccessBox = () => {
    onInsertHtml(`
      <div class="cms-callout-box cms-callout-success" style="background: rgba(22, 101, 52, 0.22); border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #4ade80; margin: 0 0 6px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
          Best Practice / Expected Output
        </h4>
        <p style="margin: 0; color: #dcfce7; font-size: 15px; line-height: 1.6;">Follow this recommended approach for clean, production-grade implementation...</p>
      </div>
    `);
  };

  const insertDangerBox = () => {
    onInsertHtml(`
      <div class="cms-callout-box cms-callout-danger" style="background: rgba(185, 28, 28, 0.22); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #f87171; margin: 0 0 6px 0; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
          Critical Warning / Pitfall
        </h4>
        <p style="margin: 0; color: #fee2e2; font-size: 15px; line-height: 1.6;">Never perform this operation without boundary checks to avoid segmentation faults or buffer overflows.</p>
      </div>
    `);
  };

  const insertComparisonTable = () => {
    onInsertHtml(`
      <div style="overflow-x: auto; margin: 24px 0;">
        <table class="cms-comparison-table" style="width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; border-radius: 8px;">
          <thead>
            <tr style="background: #1e293b; color: #f8fafc;">
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Feature / Concept</th>
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Approach A</th>
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Approach B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #334155; font-weight: 600; color: #94a3b8;">Memory Usage</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">4 Bytes (32-bit standard)</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">8 Bytes (64-bit standard)</td>
            </tr>
            <tr style="background: rgba(255, 255, 255, 0.02);">
              <td style="padding: 12px 16px; border: 1px solid #334155; font-weight: 600; color: #94a3b8;">Range</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">-2,147,483,648 to 2,147,483,647</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">-9,223,372,036,854,775,808 to ...</td>
            </tr>
          </tbody>
        </table>
      </div>
    `);
  };

  return (
    <div className="block-palette-container" style={{ padding: '16px' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
        Educational Blocks
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {/* Code Block Inserter */}
        <button
          type="button"
          onClick={onOpenCodeModal}
          className="btn btn-secondary"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', gap: '8px', textAlign: 'center', height: '86px' }}
          title="Insert Syntax Highlighted Code Editor with Copy Icon"
        >
          <Code size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Code Block</span>
        </button>

        {/* YouTube Video Inserter */}
        <button
          type="button"
          onClick={onOpenYouTubeModal}
          className="btn btn-secondary"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', gap: '8px', textAlign: 'center', height: '86px' }}
          title="Insert YouTube Video Card with Custom Thumbnail"
        >
          <Video size={20} color="#f43f5e" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>YouTube Video</span>
        </button>

        {/* Definition Box */}
        <button
          type="button"
          onClick={onOpenDefinitionModal}
          className="btn btn-secondary"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', gap: '8px', textAlign: 'center', height: '86px' }}
          title="Insert Term Definition Box"
        >
          <BookMarked size={20} color="#10b981" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Definition Box</span>
        </button>
      </div>

      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '20px', marginBottom: '12px' }}>
        Callout & Alert Boxes
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {/* Info Box */}
        <button
          type="button"
          onClick={insertInfoBox}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', justifyContent: 'flex-start' }}
        >
          <Info size={16} color="#3b82f6" />
          <span style={{ fontSize: '0.8rem' }}>Info Box</span>
        </button>

        {/* Warning Box */}
        <button
          type="button"
          onClick={insertWarningBox}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', justifyContent: 'flex-start' }}
        >
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem' }}>Warning Note</span>
        </button>

        {/* Success Box */}
        <button
          type="button"
          onClick={insertSuccessBox}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', justifyContent: 'flex-start' }}
        >
          <CheckCircle size={16} color="#22c55e" />
          <span style={{ fontSize: '0.8rem' }}>Success Box</span>
        </button>

        {/* Danger Box */}
        <button
          type="button"
          onClick={insertDangerBox}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', justifyContent: 'flex-start' }}
        >
          <XCircle size={16} color="#ef4444" />
          <span style={{ fontSize: '0.8rem' }}>Danger Box</span>
        </button>
      </div>

      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '20px', marginBottom: '12px' }}>
        Layout & Media
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={insertComparisonTable}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', justifyContent: 'flex-start' }}
        >
          <TableIcon size={16} color="#6366f1" />
          <span style={{ fontSize: '0.8rem' }}>Insert Comparison Table</span>
        </button>

        <button
          type="button"
          onClick={onOpenMediaModal}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', justifyContent: 'flex-start' }}
        >
          <Sparkles size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem' }}>Media Library Selector</span>
        </button>
      </div>
    </div>
  );
};
