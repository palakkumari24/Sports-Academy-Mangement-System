import './globals.css';

export const metadata = {
  title: "Dumka Sports Academy | Coach's Desk",
  description: 'Digital desk for academy coaches: track players, practice attendance, match scores, and trial readiness.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

