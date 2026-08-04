import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindCraft Study - Interactive Mind Maps for Learning',
  description: 'Intuitive drag-and-drop mind map editor for students and educators. Create, style, auto-layout, export PNG/PDF, and share learning mind maps.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0f19] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
