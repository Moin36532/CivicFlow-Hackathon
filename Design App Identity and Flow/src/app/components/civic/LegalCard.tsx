import { ReactNode } from 'react';

interface LegalCardProps {
  children: ReactNode;
}

export function LegalCard({ children }: LegalCardProps) {
  return (
    <div className="legal-text bg-white dark:bg-slate-900 dark:border-slate-700 rounded-lg p-6 border shadow-sm relative overflow-hidden" style={{
      borderColor: 'var(--gray-300)',
      // Note: we might want to adjust the gradient opacity for dark mode, but this is a complex inline style.
      // Simpler to rely on the class for bg color and keep the subtle texture if possible, or override.
    }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-6xl font-bold rotate-[-30deg]">
        DRAFT
      </div>
      {children}
    </div>
  );
}
