'use client';
import { useState, useEffect } from 'react';
import RichEditor from './components/RichEditor';

const DEFAULT_SUBJECT = 'Potenzial für Ihre Website';
const DEFAULT_MESSAGE = `<p>Guten Tag Herr/Frau</p><br><p>Ich bin auf Ihr Unternehmen gestossen und habe mir Ihre Website kurz angeschaut.</p><br><p>Dabei ist mir aufgefallen, dass Ihre Website eine gute Grundlage bietet, mit gezielten Anpassungen jedoch noch klarer, moderner und kundenfreundlicher wirken könnte – insbesondere für Interessenten, die Sie erstmals online finden.</p><br><p>Bei digitalframe.ch gestalten wir Websites, die <strong style="color: #376616;">BEWEGEN</strong>.</p><p>Wir verbinden modernes Webdesign, saubere technische Umsetzung und klare Inhalte zu einem Online Auftritt, der überzeugt – und dafür sorgt, dass aus Besuchern neue Kunden werden.</p><br><p>Gerne gebe ich Ihnen eine kurze, unverbindliche Einschätzung, wo konkret Optimierungspotenzial besteht.</p><br><p>Falls das für Sie interessant klingt, freue ich mich über Ihre Rückmeldung.</p>`;
const DEFAULT_FOOTER = `Freundliche Grüsse\n\nRaul Goncalves\nBusiness Developer\ndigitalframe.ch\n076 297 49 26`;

export default function Home() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('df_subject');
    const m = localStorage.getItem('df_message');
    const f = localStorage.getItem('df_footer');
    if (s) setSubject(s);
    if (m) setMessage(m);
    if (f) setFooter(f);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('df_subject', subject);
    localStorage.setItem('df_message', message);
    localStorage.setItem('df_footer', footer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetDefaults = () => {
    setSubject(DEFAULT_SUBJECT);
    setMessage(DEFAULT_MESSAGE);
    setFooter(DEFAULT_FOOTER);
    localStorage.removeItem('df_subject');
    localStorage.removeItem('df_message');
    localStorage.removeItem('df_footer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient) return;
    setIsLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, subject, message, footer }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: `✓ E-Mail an ${recipient} versendet!` });
        setRecipient('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Fehler beim Senden.' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      {/* Header */}
      <div className="header">
        <div className="brand-tag">DIGITALFRAME</div>
        <h1 className="title">E-Mails<br/>die <span className="title-highlight">bewegen.</span></h1>
        <p className="subtitle">
          Versende personalisierte Akquise-Mails direkt aus diesem Tool. Text und Design sind bereits auf <b>digitalframe.ch</b> abgestimmt.
        </p>
      </div>

      {/* Send Panel */}
      <div className="main-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="recipient">Empfänger E-Mail</label>
            <input
              type="email"
              id="recipient"
              className="form-input"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="kontakt@unternehmen.ch"
              required
              style={{ fontSize: '1.1rem', padding: '1rem 1.2rem' }}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <><div className="spinner" />VERARBEITEN...</> : <>SENDEN ➔</>}
          </button>
        </form>
        {status.text && (
          <div className={`status-message status-${status.type}`}>{status.text}</div>
        )}
      </div>

      {/* Settings Toggle */}
      <button
        className="toggle-settings"
        onClick={() => setShowSettings(v => !v)}
        type="button"
      >
        <span className="toggle-icon">{showSettings ? '▲' : '▼'}</span>
        Einstellungen & Vorlagen
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          {/* Section: Betreff */}
          <div className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-icon">✉</span>
              <span>Betreff</span>
            </div>
            <input
              type="text"
              className="form-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="E-Mail Betreff..."
            />
          </div>

          {/* Section: Nachricht */}
          <div className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-icon">✍</span>
              <span>Hauptnachricht</span>
            </div>
            <RichEditor value={message} onChange={setMessage} />
          </div>

          {/* Section: Signatur */}
          <div className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-icon">✒</span>
              <span>Signatur</span>
            </div>
            <p className="settings-hint">Zeile 1: Abschlussgruss · Zeile 2: Name · Zeile 3: Titel · weitere Zeilen: Kontakt</p>
            <textarea
              className="form-input"
              style={{ minHeight: '130px', resize: 'vertical', lineHeight: 1.7 }}
              value={footer}
              onChange={e => setFooter(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button type="button" className="submit-btn" onClick={saveSettings}>
              {saved ? '✓ Gespeichert!' : 'SPEICHERN'}
            </button>
            <button type="button" className="reset-btn" onClick={resetDefaults}>
              Zurücksetzen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
