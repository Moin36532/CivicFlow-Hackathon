interface SeverityBadgeProps {
  score: number;
}

export function SeverityBadge({ score }: SeverityBadgeProps) {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded" style={{
      backgroundColor: 'var(--red-100)',
      color: 'var(--red-700)'
    }}>
      <span className="font-medium">{score}/10</span>
    </div>
  );
}
