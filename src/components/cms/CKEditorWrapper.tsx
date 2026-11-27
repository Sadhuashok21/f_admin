import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading,
  Paragraph,
  BlockQuote,
  Alignment,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
  List,
  ListProperties,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
  Link,
  AutoLink,
  Code,
  CodeBlock,
  HorizontalLine,
  Indent,
  IndentBlock,
  Essentials,
  SourceEditing,
  GeneralHtmlSupport,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  LinkImage
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorWrapperProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  onReady?: (editor: any) => void;
  canvasTheme?: 'light' | 'dark';
}

export const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({
  value,
  onChange,
  placeholder = 'Write or design educational course content here...',
  onReady,
  canvasTheme = 'dark'
}) => {
  const editorConfig: any = {
    licenseKey: 'GPL', // Open source GPL license key for CKEditor 5 v41+
    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Subscript,
      Superscript,
      BlockQuote,
      Alignment,
      FontFamily,
      FontSize,
      FontColor,
      FontBackgroundColor,
      List,
      ListProperties,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      TableColumnResize,
      Link,
      AutoLink,
      Code,
      CodeBlock,
      HorizontalLine,
      Indent,
      IndentBlock,
      SourceEditing,
      GeneralHtmlSupport,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageResize,
      LinkImage
    ],
    toolbar: {
      items: [
        'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
        'numberedList', 'bulletedList', '|',
        'alignment', '|',
        'fontFamily', 'fontSize', '|',
        'link', '|',
        'heading', 'fontColor', 'fontBackgroundColor', '|',
        'insertTable', 'codeBlock', 'blockQuote', 'horizontalLine', '|',
        'sourceEditing'
      ],
      shouldNotGroupWhenFull: true
    },
    // Preserve all HTML tags, classes, and inline styles (including iframes and embedded video widgets)
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true
        },
        {
          name: 'iframe',
          attributes: [
            'src', 'width', 'height', 'title', 'frameborder', 'allow',
            'allowfullscreen', 'style', 'class', 'loading', 'referrerpolicy'
          ],
          classes: true,
          styles: true
        }
      ]
    },
    fontFamily: {
      options: [
        'default',
        'Sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'Serif, Georgia, Cambria, "Times New Roman", Times, serif',
        'Monospace, "Courier New", Courier, monospace',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Times New Roman, Times, serif',
        'Verdana, Geneva, sans-serif',
        'Trebuchet MS, Helvetica, sans-serif'
      ],
      supportAllValues: true
    },
    fontSize: {
      options: [
        10,
        12,
        14,
        'default', // 16px
        18,
        20,
        24,
        28,
        32,
        36
      ],
      supportAllValues: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ]
    },
    image: {
      toolbar: [
        'imageTextAlternative', 'toggleImageCaption', '|',
        'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
        'linkImage'
      ]
    },
    codeBlock: {
      languages: [
        { language: 'c', label: 'C' },
        { language: 'cpp', label: 'C++' },
        { language: 'java', label: 'Java' },
        { language: 'python', label: 'Python' },
        { language: 'javascript', label: 'JavaScript' },
        { language: 'typescript', label: 'TypeScript' },
        { language: 'sql', label: 'SQL' },
        { language: 'html', label: 'HTML' },
        { language: 'css', label: 'CSS' },
        { language: 'bash', label: 'Bash / Shell' },
        { language: 'go', label: 'Go' },
        { language: 'rust', label: 'Rust' },
        { language: 'php', label: 'PHP' },
      ]
    },
    fontColor: {
      colorPicker: {
        format: 'hex'
      }
    },
    fontBackgroundColor: {
      colorPicker: {
        format: 'hex'
      }
    },
    placeholder
  };

  return (
    <div className={`blogger-ckeditor-canvas ${canvasTheme === 'light' ? 'canvas-light' : 'canvas-dark'}`} style={{ width: '100%', height: '100%' }}>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        onReady={(editor) => {
          // Allow fontColor and fontBackgroundColor inside CKEditor codeBlocks too
          editor.model.schema.on(
            'checkAttribute',
            (evt: any, args: any[]) => {
              const [context, attributeName] = args;
              if (attributeName === 'fontColor' || attributeName === 'fontBackgroundColor') {
                const parent = context?.getItem?.(context.length - 2);
                if (parent && parent.name === 'codeBlock') {
                  evt.return = true;
                  evt.stop();
                }
              }
            },
            { priority: 'high' }
          );

          const LOCKED_CONTAINER_CLASSES = [
            'cms-youtube-card',
            'cms-video-embed',
            'cms-code-block'
          ];

          const hasLockedClass = (node: any): boolean => {
            if (!node) return false;
            const ghsAttrs = node.getAttribute?.('htmlDivAttributes') || node.getAttribute?.('htmlAttributes');
            const classes = ghsAttrs?.classes || [];
            if (Array.isArray(classes) && classes.some((c: string) => LOCKED_CONTAINER_CLASSES.includes(c))) {
              return true;
            }
            const rawClass = String(ghsAttrs?.class || '');
            return LOCKED_CONTAINER_CLASSES.some((cls) => rawClass.includes(cls));
          };

          const viewHasLockedClass = (viewSelection: any): boolean => {
            const pos = viewSelection?.getFirstPosition?.();
            let vNode: any = pos?.parent;
            while (vNode) {
              if (typeof vNode.hasClass === 'function' && LOCKED_CONTAINER_CLASSES.some((cls) => vNode.hasClass(cls))) {
                return true;
              }
              vNode = vNode.parent;
            }
            return false;
          };

          // Ensure normal editable paragraphs exist outside custom HTML div blocks on initial load
          editor.model.enqueueChange({ isUndoable: false }, (writer: any) => {
            const root = editor.model.document.getRoot();
            if (!root || root.childCount === 0) return;

            const firstChild = root.getChild(0);
            if (firstChild && firstChild.is('element', 'htmlDiv')) {
              writer.insert(writer.createElement('paragraph'), writer.createPositionAt(root, 0));
            }
            const lastChild = root.getChild(root.childCount - 1);
            if (lastChild && lastChild.is('element', 'htmlDiv')) {
              const p = writer.createElement('paragraph');
              writer.insert(p, writer.createPositionAt(root, 'end'));
              if (hasLockedClass(lastChild)) {
                writer.setSelection(p, 0);
              }
            }
          });

          // Prevent Enter key from keeping new text trapped inside video/code/card blocks
          editor.editing.view.document.on(
            'enter',
            (evt: any, data: any) => {
              const root = editor.model.document.getRoot();
              const sel = editor.model.document.selection;
              const pos = sel.getFirstPosition();
              if (!pos) return;

              let curr: any = pos.parent;
              let matchedContainer: any = null;
              let topBlock: any = null;
              while (curr && curr !== root) {
                if (hasLockedClass(curr)) {
                  matchedContainer = curr;
                }
                if (curr.parent === root) {
                  topBlock = curr;
                }
                curr = curr.parent;
              }

              if ((matchedContainer || viewHasLockedClass(editor.editing.view.document.selection)) && topBlock) {
                evt.stop();
                data.preventDefault();
                editor.model.change((writer: any) => {
                  const newPara = writer.createElement('paragraph');
                  writer.insert(newPara, writer.createPositionAfter(topBlock));
                  for (const attr of Array.from(editor.model.document.selection.getAttributeKeys())) {
                    writer.removeSelectionAttribute(attr);
                  }
                  writer.setSelection(newPara, 0);
                });
              }
            },
            { priority: 'high' }
          );

          if (onReady) onReady(editor);
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};
