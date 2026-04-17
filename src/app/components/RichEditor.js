'use client';
import { useRef, useEffect, useCallback, useState } from 'react';

const BRAND_COLORS = [
  { color: '#111111', label: 'Schwarz' },
  { color: '#376616', label: 'DF Grün' },
  { color: '#daff00', label: 'DF Lime' },
  { color: '#ffffff', label: 'Weiss' },
  { color: '#555555', label: 'Grau' },
  { color: '#888888', label: 'Hellgrau' },
  { color: '#ff4a4a', label: 'Rot' },
  { color: '#f59e0b', label: 'Orange' },
  { color: '#3b82f6', label: 'Blau' },
  { color: '#8b5cf6', label: 'Violett' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#0ea5e9', label: 'Hellblau' },
];

const VARIABLES = [
  { label: '{Firma}', value: '<span style="background:#daff00;color:#111;padding:0 4px;border-radius:3px;font-weight:600">{Firma}</span>' },
  { label: '{Name}', value: '<span style="background:#daff00;color:#111;padding:0 4px;border-radius:3px;font-weight:600">{Name}</span>' },
  { label: '{Website}', value: '<span style="background:#daff00;color:#111;padding:0 4px;border-radius:3px;font-weight:600">{Website}</span>' },
  { label: '{Branche}', value: '<span style="background:#daff00;color:#111;padding:0 4px;border-radius:3px;font-weight:600">{Branche}</span>' },
];

export default function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const isUserEditing = useRef(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({});
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRange = useRef(null);

  useEffect(() => {
    if (editorRef.current && !isUserEditing.current) {
      editorRef.current.innerHTML = value || '';
      updateWordCount();
    }
  }, [value]);

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
    }
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const exec = useCallback((command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    isUserEditing.current = true;
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
    isUserEditing.current = false;
  }, [onChange]);

  const handleInput = () => {
    isUserEditing.current = true;
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    updateWordCount();
    updateActiveFormats();
    isUserEditing.current = false;
  };

  const handleKeyUp = () => updateActiveFormats();
  const handleMouseUp = () => updateActiveFormats();

  const insertVariable = (html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html + '&nbsp;');
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedRange.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const insertLink = () => {
    saveSelection();
    setLinkModal(true);
    setLinkUrl('');
  };

  const confirmLink = () => {
    restoreSelection();
    editorRef.current?.focus();
    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl;
      document.execCommand('createLink', false, url);
      const links = editorRef.current.querySelectorAll('a');
      links.forEach(a => {
        a.setAttribute('target', '_blank');
        a.style.color = '#376616';
      });
    }
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
    setLinkModal(false);
  };

  const applyHeading = (tag) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
  };

  const btn = (active) => `toolbar-btn${active ? ' toolbar-btn-active' : ''}`;

  return (
    <div className="rich-editor-wrapper">
      {/* Row 1: Text formatting */}
      <div className="rich-toolbar">
        <div className="toolbar-group">
          <button type="button" className={btn(activeFormats.bold)} onClick={() => exec('bold')} title="Fett (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button type="button" className={btn(activeFormats.italic)} onClick={() => exec('italic')} title="Kursiv (Ctrl+I)">
            <em>I</em>
          </button>
          <button type="button" className={btn(activeFormats.underline)} onClick={() => exec('underline')} title="Unterstrichen (Ctrl+U)">
            <u>U</u>
          </button>
          <button type="button" className="toolbar-btn" onClick={() => exec('strikeThrough')} title="Durchgestrichen">
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <select className="toolbar-select" onChange={e => applyHeading(e.target.value)} defaultValue="p" title="Format">
            <option value="p">Normal</option>
            <option value="h1">Titel H1</option>
            <option value="h2">Titel H2</option>
            <option value="h3">Titel H3</option>
          </select>
          <select className="toolbar-select" onChange={e => exec('fontSize', e.target.value)} defaultValue="3" title="Schriftgröße">
            <option value="1">12px</option>
            <option value="2">14px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
          </select>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button" className={btn(activeFormats.justifyLeft)} onClick={() => exec('justifyLeft')} title="Links">
            ⬛◻◻
          </button>
          <button type="button" className={btn(activeFormats.justifyCenter)} onClick={() => exec('justifyCenter')} title="Zentriert">
            ◻⬛◻
          </button>
          <button type="button" className={btn(activeFormats.justifyRight)} onClick={() => exec('justifyRight')} title="Rechts">
            ◻◻⬛
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => exec('insertUnorderedList')} title="Liste">☰</button>
          <button type="button" className="toolbar-btn" onClick={insertLink} title="Link einfügen">🔗</button>
          <button type="button" className="toolbar-btn" onClick={() => exec('undo')} title="Rückgängig">↩</button>
          <button type="button" className="toolbar-btn" onClick={() => exec('redo')} title="Wiederholen">↪</button>
          <button type="button" className="toolbar-btn" onClick={() => exec('removeFormat')} title="Formatierung entfernen" style={{color:'#ff4a4a'}}>✕</button>
        </div>
      </div>

      {/* Row 2: Colors */}
      <div className="rich-toolbar" style={{ borderTop: '1px solid #ddd', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginRight: '4px', textTransform: 'uppercase' }}>Farbe:</span>
        <div className="color-swatches" style={{ flexWrap: 'wrap' }}>
          {BRAND_COLORS.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              className="color-swatch"
              style={{
                backgroundColor: color,
                border: color === '#ffffff' ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.1)',
                width: 22,
                height: 22,
              }}
              onClick={() => exec('foreColor', color)}
              title={label}
            />
          ))}
        </div>
        <div className="toolbar-divider" />
        <div className="color-picker-wrap" title="Eigene Farbe">
          <span className="color-label" style={{ fontSize: 12 }}>A+</span>
          <input type="color" className="color-picker-input" onChange={e => exec('foreColor', e.target.value)} defaultValue="#111111" />
        </div>
      </div>

      {/* Row 3: Variables */}
      <div className="rich-toolbar" style={{ borderTop: '1px solid #ddd', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', marginRight: '4px', textTransform: 'uppercase' }}>Variablen:</span>
        {VARIABLES.map(({ label, value: html }) => (
          <button
            key={label}
            type="button"
            className="variable-btn"
            onClick={() => insertVariable(html)}
            title={`${label} einfügen`}
          >
            {label}
          </button>
        ))}
        <span style={{ fontSize: '11px', color: '#aaa', marginLeft: 'auto' }}>
          {wordCount} Wörter
        </span>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
      />

      {/* Link Modal */}
      {linkModal && (
        <div className="link-modal-overlay" onClick={() => setLinkModal(false)}>
          <div className="link-modal" onClick={e => e.stopPropagation()}>
            <p style={{ fontWeight: 700, marginBottom: '12px' }}>Link einfügen</p>
            <input
              className="form-input"
              type="text"
              placeholder="https://digitalframe.ch"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmLink()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="button" className="submit-btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={confirmLink}>
                Einfügen
              </button>
              <button type="button" className="toolbar-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={() => setLinkModal(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
