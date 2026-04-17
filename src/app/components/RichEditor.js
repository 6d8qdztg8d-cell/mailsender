'use client';
import { useRef, useEffect, useCallback, useState } from 'react';

const BRAND_COLORS = [
  '#111111','#376616','#daff00','#ffffff',
  '#555555','#888888','#ff4a4a','#f59e0b',
  '#3b82f6','#8b5cf6','#ec4899','#0ea5e9',
];

const VARIABLES = ['{Firma}', '{Name}', '{Website}', '{Branche}'];

const IconBold = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z"/></svg>;
const IconItalic = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4h4l-4 16H6z"/></svg>;
const IconUnderline = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v7a6 6 0 0 0 12 0V4h-2v7a4 4 0 0 1-8 0V4H6zm-1 15h14v2H5z"/></svg>;
const IconStrike = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 13h-2V20h2V13zM5 11h14v2H5V11zm4.5-6C8.1 5 7 6.1 7 7.5 7 9 8.5 10 10 10h4c1.5 0 3-1 3-2.5C17 6.1 15.9 5 14.5 5h-5z"/></svg>;
const IconAlignLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>;
const IconAlignCenter = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/></svg>;
const IconAlignRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/></svg>;
const IconList = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="7" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="17" r="1.5"/><path d="M8 6h13v2H8V6zm0 5h13v2H8v-2zm0 5h13v2H8v-2z"/></svg>;
const IconLink = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconUndo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>;
const IconRedo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>;
const IconClear = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l4 10H8L12 2z"/><path d="M5 20h14"/><path d="M18 14l-6 6"/></svg>;

export default function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const isUserEditing = useRef(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRange = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
      updateWordCount();
    }
  }, [value]);

  const updateWordCount = () => {
    if (!editorRef.current) return;
    const words = (editorRef.current.innerText || '').trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const updateFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
    updateFormats();
  }, [onChange]);

  const handleInput = () => {
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
    updateWordCount();
    updateFormats();
  };

  const insertVariable = (label) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, label);
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange.current);
  };

  const openLinkModal = () => {
    saveSelection();
    setLinkUrl('');
    setLinkModal(true);
  };

  const confirmLink = () => {
    restoreSelection();
    editorRef.current?.focus();
    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl;
      document.execCommand('createLink', false, url);
      editorRef.current.querySelectorAll('a').forEach(a => {
        a.target = '_blank';
        a.style.color = '#376616';
        a.style.fontWeight = '600';
      });
    }
    isUserEditing.current = true;
    if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    isUserEditing.current = false;
    setLinkModal(false);
  };

  const Btn = ({ active, onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`re-btn${active ? ' re-btn-active' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="re-wrapper">
      {/* Toolbar */}
      <div className="re-toolbar">
        {/* Formatting */}
        <div className="re-group">
          <Btn active={activeFormats.bold} onClick={() => exec('bold')} title="Fett"><IconBold /></Btn>
          <Btn active={activeFormats.italic} onClick={() => exec('italic')} title="Kursiv"><IconItalic /></Btn>
          <Btn active={activeFormats.underline} onClick={() => exec('underline')} title="Unterstrichen"><IconUnderline /></Btn>
          <Btn onClick={() => exec('strikeThrough')} title="Durchgestrichen"><IconStrike /></Btn>
        </div>

        <div className="re-divider" />

        {/* Size */}
        <select className="re-select" onChange={e => { editorRef.current?.focus(); document.execCommand('fontSize', false, e.target.value); if(editorRef.current && onChange) onChange(editorRef.current.innerHTML); e.target.value='3'; }} title="Schriftgröße">
          <option value="1">12px</option>
          <option value="2">14px</option>
          <option value="3" selected>16px</option>
          <option value="4">18px</option>
          <option value="5">24px</option>
          <option value="6">32px</option>
        </select>

        <div className="re-divider" />

        {/* Alignment */}
        <div className="re-group">
          <Btn active={activeFormats.justifyLeft} onClick={() => exec('justifyLeft')} title="Links"><IconAlignLeft /></Btn>
          <Btn active={activeFormats.justifyCenter} onClick={() => exec('justifyCenter')} title="Zentriert"><IconAlignCenter /></Btn>
          <Btn active={activeFormats.justifyRight} onClick={() => exec('justifyRight')} title="Rechts"><IconAlignRight /></Btn>
        </div>

        <div className="re-divider" />

        {/* Extra */}
        <div className="re-group">
          <Btn onClick={() => exec('insertUnorderedList')} title="Liste"><IconList /></Btn>
          <Btn onClick={openLinkModal} title="Link einfügen"><IconLink /></Btn>
        </div>

        <div className="re-divider" />

        {/* Color */}
        <div className="re-color-wrap">
          <button
            type="button"
            className="re-color-btn"
            title="Textfarbe"
            onClick={() => setShowColorPicker(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6l-1.5 4H7l3.27 2.36L9 17l3-2.16L15 17l-1.27-4.64L17 10h-3.5z"/></svg>
            <span style={{fontSize:10, fontWeight:700}}>A</span>
          </button>
          {showColorPicker && (
            <div className="re-color-palette" onMouseLeave={() => setShowColorPicker(false)}>
              <div className="re-color-grid">
                {BRAND_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className="re-swatch"
                    style={{ background: c, border: c === '#ffffff' ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.1)' }}
                    onClick={() => { exec('foreColor', c); setShowColorPicker(false); }}
                    title={c}
                  />
                ))}
              </div>
              <label className="re-custom-color">
                <span>Eigene Farbe</span>
                <input type="color" defaultValue="#111111" onChange={e => exec('foreColor', e.target.value)} />
              </label>
            </div>
          )}
        </div>

        <div className="re-divider" />

        {/* Undo/Redo/Clear */}
        <div className="re-group">
          <Btn onClick={() => exec('undo')} title="Rückgängig"><IconUndo /></Btn>
          <Btn onClick={() => exec('redo')} title="Wiederholen"><IconRedo /></Btn>
          <Btn onClick={() => exec('removeFormat')} title="Formatierung entfernen"><IconClear /></Btn>
        </div>
      </div>

      {/* Variables row */}
      <div className="re-variables">
        <span className="re-var-label">Platzhalter:</span>
        {VARIABLES.map(v => (
          <button key={v} type="button" className="re-var-chip" onClick={() => insertVariable(v)}>{v}</button>
        ))}
        <span className="re-wordcount">{wordCount} Wörter</span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        className="re-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateFormats}
        onMouseUp={updateFormats}
      />

      {/* Link modal */}
      {linkModal && (
        <div className="re-modal-overlay" onClick={() => setLinkModal(false)}>
          <div className="re-modal" onClick={e => e.stopPropagation()}>
            <p className="re-modal-title">Link einfügen</p>
            <input
              className="form-input"
              type="text"
              placeholder="https://digitalframe.ch"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmLink()}
              autoFocus
            />
            <div className="re-modal-actions">
              <button type="button" className="submit-btn" style={{padding:'0.65rem 1.4rem', fontSize:'0.85rem'}} onClick={confirmLink}>Einfügen</button>
              <button type="button" className="re-btn" style={{padding:'0 16px', height:40}} onClick={() => setLinkModal(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
