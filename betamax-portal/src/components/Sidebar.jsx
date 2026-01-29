import React from 'react';
import { 
  Monitor, 
  Shield, 
  Code, 
  LogOut, 
  Database,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar({ view, setView }) {
  const { profile } = useAuth();
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.betamax.core";

  const handleLogout = () => {
    signOut(auth);
  };

  const NavItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setView(id)}
      className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3 mb-2
        ${view === id 
          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
          : 'border-transparent text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/20'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="w-full md:w-64 border-r border-cyan-900/30 bg-black/60 flex flex-col backdrop-blur-md z-40 h-full">
      {/* Brand Header */}
      <div className="p-6 border-b border-cyan-900/30">
        <h1 className="text-2xl font-bold tracking-tighter text-glow-cyan italic flex items-center gap-2">
          <span className="text-fuchsia-500">BETA</span> MAX
        </h1>
        <p className="text-[10px] text-cyan-700 mt-1 uppercase tracking-widest">
          {profile?.role === 'developer' ? 'Architect Console' : 'Scout Terminal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavItem id="dashboard" label="DASHBOARD" icon={Monitor} />
        
        {profile?.role === 'developer' && (
          <>
            <NavItem id="my-apps" label="MY_PROJECTS" icon={Code} />
            <NavItem id="recruitment" label="RECRUITMENT" icon={Shield} />
          </>
        )}

        {profile?.role === 'tester' && (
          <>
            <NavItem id="missions" label="ACTIVE_OPS" icon={Shield} />
            <NavItem id="external" label="EXT_PROTOCOLS" icon={Globe} />
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-cyan-900/30 space-y-4 bg-black/20">
         <a
           href={playStoreUrl}
           target="_blank"
           rel="noreferrer"
           className="flex items-center gap-2 text-[10px] text-cyan-500 hover:text-cyan-300 uppercase tracking-widest w-full px-2 py-2 hover:bg-cyan-950/30 rounded transition-colors"
         >
           <Smartphone size={12} /> Get_Android_App
         </a>
         <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded flex items-center justify-center border uppercase font-bold
             ${profile?.role === 'developer' ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-400' : 'bg-cyan-900/30 border-cyan-500 text-cyan-400'}`}>
             {profile?.email?.[0]}
           </div>
           <div className="overflow-hidden">
             <p className="text-xs font-bold text-white truncate">{profile?.email?.split('@')[0]}</p>
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${profile?.role === 'developer' ? 'bg-fuchsia-500' : 'bg-cyan-500'} animate-pulse`}></div>
               <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ONLINE</p>
             </div>
           </div>
         </div>
         <button 
           onClick={handleLogout}
           className="flex items-center gap-2 text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest w-full px-2 py-2 hover:bg-red-950/20 rounded transition-colors"
         >
           <LogOut size={12} /> Terminate_Link
         </button>
      </div>
    </div>
  );
}
