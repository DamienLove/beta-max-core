import React from 'react';
import { 
  Settings, 
  Target, 
  Globe, 
  Smartphone, 
  Gamepad2, 
  Play, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';

export default function MissionCard({ mission, role, onAction }) {
  const getPlatformIcon = (plat) => {
    if (plat === 'Android' || plat === 'iOS') return <Smartphone size={14} />;
    if (plat === 'Web') return <Globe size={14} />;
    return <Gamepad2 size={14} />;
  };

  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20';
    if (status === 'PENDING_RECRUITMENT') return 'border-amber-500/50 text-amber-400 bg-amber-950/20';
    if (status === 'CLOSED') return 'border-red-500/50 text-red-400 bg-red-950/20';
    return 'border-slate-700 text-slate-400';
  };

  return (
    <div className="group relative cyber-panel p-6 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Hover Action Overlay */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {role === 'developer' ? (
          <button 
            onClick={() => onAction('manage', mission)}
            className="p-2 bg-black/60 border border-cyan-500 rounded text-cyan-400 hover:bg-cyan-900/40"
            title="Manage Mission"
          >
            <Settings size={16} />
          </button>
        ) : (
          <button 
            onClick={() => onAction('view', mission)}
            className="p-2 bg-black/60 border border-emerald-500 rounded text-emerald-400 hover:bg-emerald-900/40"
            title="View Details"
          >
            <Play size={16} />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">
            {mission.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-600 mt-1">
            <span className="flex items-center gap-1">
              {getPlatformIcon(mission.platform)} {mission.platform}
            </span>
            <span>//</span>
            <span className="truncate max-w-[150px]">{mission.packageId}</span>
          </div>
        </div>
        <span className={`px-2 py-1 text-[10px] border rounded ${getStatusColor(mission.status)}`}>
          {mission.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-6 font-sans line-clamp-3 flex-1">
        {mission.description}
      </p>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-2 border-t border-cyan-900/30 pt-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-fuchsia-400">
          <Target size={14} />
          <span>TIER_{mission.targetTier}+</span>
        </div>
        <div className="text-right text-cyan-500">
          {mission.rewardValue} {mission.rewardType === 'Paid' ? 'USD' : 'CR'}
        </div>
        
        {role === 'developer' && (
           <div className="col-span-2 mt-2 flex justify-between items-center text-[10px] text-slate-500">
             <span>BUGS_FOUND: {mission.bugsFound || 0}</span>
             <span>SCOUTS: {mission.scoutCount || 0}</span>
           </div>
        )}
        
        {role === 'tester' && (
           <div className="col-span-2 mt-2">
             <button 
               onClick={() => onAction('join', mission)}
               className="w-full py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20 rounded flex items-center justify-center gap-2 uppercase font-bold text-[10px]"
             >
               <UserPlus size={12} /> Init_Enrollment
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
