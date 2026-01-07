import React from 'react';

export default function StatWidget({ label, value, color = 'cyan', icon: Icon }) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    fuchsia: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/20',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
  };

  const glowClass = `text-glow-${color}`;

  return (
    <div className={`border p-4 rounded cyber-panel flex items-center justify-between ${colorMap[color]}`}>
      <div>
        <p className="text-[10px] uppercase opacity-70 mb-1">{label}</p>
        <p className={`text-2xl font-bold tracking-tighter ${glowClass}`}>{value}</p>
      </div>
      {Icon && <Icon size={24} className="opacity-50" />}
    </div>
  );
}
