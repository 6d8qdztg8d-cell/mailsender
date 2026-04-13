import './globals.css';

export const metadata = {
  title: 'DigitalFrame | Email Dispatch',
  description: 'Internes Tool für DigitalFrame Emails',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
