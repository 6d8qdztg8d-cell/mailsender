'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const DEFAULT_SUBJECT = 'Potenzial für Ihre Website';
const DEFAULT_MESSAGE = `<p>Guten Tag Herr/Frau</p><br><p>Ich bin auf Ihr Unternehmen gestossen und habe mir Ihre Website kurz angeschaut.</p><br><p>Dabei ist mir aufgefallen, dass Ihre Website eine gute Grundlage bietet, mit gezielten Anpassungen jedoch noch klarer, moderner und kundenfreundlicher wirken könnte – insbesondere für Interessenten, die Sie erstmals online finden.</p><br><p>Bei digitalframe.ch gestalten wir Websites, die <strong style="color: #376616;">BEWEGEN</strong>.</p><p>Wir verbinden modernes Webdesign, saubere technische Umsetzung und klare Inhalte zu einem Online Auftritt, der überzeugt – und dafür sorgt, dass aus Besuchern neue Kunden werden.</p><br><p>Gerne gebe ich Ihnen eine kurze, unverbindliche Einschätzung, wo konkret Optimierungspotenzial besteht.</p><br><p>Falls das für Sie interessant klingt, freue ich mich über Ihre Rückmeldung.</p>`;

const DEFAULT_FOOTER = `Freundliche Grüsse

Raul Goncalves
Business Developer
digitalframe.ch
076 297 49 26`;

export default function Home() {
  const [recipient, setRecipient] = useState('');
  
  // Settings / Templates
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE);
  const [footerTemplate, setFooterTemplate] = useState(DEFAULT_FOOTER);
  
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSubject = localStorage.getItem('df_subject');
    const savedMsg = localStorage.getItem('df_message');
    const savedFooter = localStorage.getItem('df_footer');
    
    if (savedSubject) setSubject(savedSubject);
    if (savedMsg) setMessageTemplate(savedMsg);
    if (savedFooter) setFooterTemplate(savedFooter);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('df_subject', subject);
    localStorage.setItem('df_message', messageTemplate);
    localStorage.setItem('df_footer', footerTemplate);
    setShowSettings(false);
    setStatus({ type: 'success', text: 'Einstellungen gespeichert!' });
    setTimeout(() => setStatus({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient) return;
    
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          subject,
          message: messageTemplate,
          footer: footerTemplate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', text: 'E-Mail erfolgreich versendet!' });
        setRecipient('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Fehler beim Senden der E-Mail.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Netzwerkfehler. Bitte versuche es später.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Editor modules (Toolbar options)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <main className="container">
      <div className="header">
        <div className="brand-tag">DIGITALFRAME</div>
        <h1 className="title">
          E-Mails<br/>
          die <span className="title-highlight">bewegen.</span>
        </h1>
        <p className="subtitle">
          Versende personalisierte Akquise-Mails direkt aus diesem Tool. Text und Design sind bereits auf <b>digitalframe.ch</b> abgestimmt.
        </p>
      </div>

      <div className="main-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="recipient">Empfänger E-Mail Adresse</label>
            <input
              type="email"
              id="recipient"
              className="form-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="ziel@unternehmen.ch"
              required
              style={{ fontSize: '1.2rem', padding: '1.2rem' }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                VERARBEITEN...
              </>
            ) : (
              <>
                SENDEN ➔
              </>
            )}
          </button>
        </form>

        {status.text && (
          <div className={`status-message status-${status.type}`}>
            {status.text}
          </div>
        )}
      </div>

      <button className="toggle-settings" onClick={() => setShowSettings(!showSettings)} type="button">
        {showSettings ? '▲ Einstellungen schließen' : '▼ Einstellungen & Vorlagen bearbeiten'}
      </button>

      <div className={`settings-panel ${showSettings ? 'active' : ''}`}>
        <div className="form-group">
          <label className="form-label">E-Mail Betreff</label>
          <input
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Hauptnachricht (Editor)</label>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactQuill 
              theme="snow" 
              value={messageTemplate} 
              onChange={setMessageTemplate} 
              modules={modules}
              style={{ height: '300px', marginBottom: '40px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Signatur / Footer</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '120px' }}
            value={footerTemplate}
            onChange={(e) => setFooterTemplate(e.target.value)}
          />
        </div>

        <button className="submit-btn" onClick={saveSettings} style={{ background: 'var(--text-primary)', color: 'white', padding: '0.8rem 1.5rem' }}>
          Vorlagen Speichern
        </button>
      </div>
    </main>
  );
}
