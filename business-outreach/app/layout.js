import './globals.css';

export const metadata = {
  title: 'Local Business Outreach Tool',
  description: 'Find local businesses and generate personalized outreach emails',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
