'use client';
import { useRef, useCallback } from 'react';

const COLORS = ['#111111', '#376616', '#daff00', '#ff4a4a', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#555555', '#888888'];

export default function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);

  const exec = useCallback((command, val = null) => {
    document.execCommand(command, false, val);
    // Trigger onChange after command
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleColorChange = (e) => {
    exec('foreColor', e.target.value);
  };

  const handleFontSize = (e) => {
    exec('fontSize', e.target.value);
  };

  return (
    <div className="rich-editor-wrapper">
      {/* Toolbar */}
      <div className="rich-toolbar">
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => exec('bold')} title="Fett">
            <strong>B</strong>
          </button>
          <button type="button" className="toolbar-btn" onClick={() => exec('italic')} title="Kursiv">
            <em>I</em>
          </button>
          <button type="button" className="toolbar-btn" onClick={() => exec('underline')} title="Unterstrichen">
            <u>U</u>
          </button>
          <button type="button" className="toolbar-btn" onClick={() => exec('strikeThrough')} title="Durchgestrichen">
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <select className="toolbar-select" onChange={handleFontSize} defaultValue="3" title="Schriftgröße">
            <option value="1">Klein</option>
            <option value="3">Normal</option>
            <option value="4">Mittel</option>
            <option value="5">Groß</option>
            <option value="6">Sehr Groß</option>
          </select>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <div className="color-picker-wrap">
            <span className="color-label">A</span>
            <input type="color" className="color-picker-input" onChange={handleColorChange} defaultValue="#111111" title="Schriftfarbe" />
          </div>
          <div className="color-swatches">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className="color-swatch"
                style={{ backgroundColor: c }}
                onClick={() => exec('foreColor', c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => exec('insertUnorderedList')} title="Liste">
            ☰
          </button>
          <button type="button" className="toolbar-btn" onClick={() => exec('removeFormat')} title="Formatierung entfernen">
            ✕
          </button>
        </div>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="rich-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
