import { Heart, Stethoscope, Leaf, Users } from 'lucide-react';

interface VolunteerTagProps {
  skill: 'Medical' | 'Food' | 'Rescue' | 'Transport';
}

const iconMap = {
  Medical: Stethoscope,
  Food: Leaf,
  Rescue: Users,
  Transport: Users
};

export function VolunteerTag({ skill }: VolunteerTagProps) {
  const Icon = iconMap[skill] || Heart;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded" style={{
      backgroundColor: 'var(--green-100)',
      color: 'var(--green-800)'
    }}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-sm font-medium">{skill}</span>
    </div>
  );
}
