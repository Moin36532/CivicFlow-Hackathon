import { Shield } from 'lucide-react';

interface SafetyShieldProps {
  score: number;
}

export function SafetyShield({ score }: SafetyShieldProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
      <Shield className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="text-xs opacity-90">Safety Score</span>
        <span className="font-bold">{score}/100</span>
      </div>
    </div>
  );
}
