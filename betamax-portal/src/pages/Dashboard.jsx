import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MissionCard from '../components/MissionCard';
import StatWidget from '../components/StatWidget';
import ExternalBetasPage from './ExternalBetasPage';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // dashboard, my-apps, missions, external, recruitment
  const [missions, setMissions] = useState([]);
  const [, setLoading] = useState(true);

  // Stats Logic (Simplified)
  const [stats, setStats] = useState({
    activeMissions: 0,
    totalBugs: 0,
    credits: profile?.credits || 0
  });

  useEffect(() => {
    if (!profile) return;

    const missionsRef = collection(db, "missions");
    // Query logic
    let q;
    if (profile.role === 'developer') {
      q = query(missionsRef, where("architectId", "==", profile.uid));
    } else {
      q = query(missionsRef, where("status", "==", "ACTIVE"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMissions(data);
      setStats(prev => ({ ...prev, activeMissions: data.length }));
      setLoading(false);
    });

    return unsubscribe;
  }, [profile]);

  const handleMissionAction = (action, mission) => {
    if (action === 'manage' || action === 'view' || action === 'join') {
      navigate(`/mission/${mission.id}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-retro relative">
       <div className="fixed inset-0 crt-overlay z-50"></div>
       <div className="fixed inset-0 crt-flicker z-40"></div>
       
       <Sidebar view={view} setView={setView} />
       
       <main className="flex-1 overflow-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Header */}
             <div className="flex justify-between items-end border-b border-cyan-900/30 pb-4">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tighter uppercase mb-1">
                      {view.replace('-', '_')}
                   </h2>
                   <p className="text-xs text-cyan-600 uppercase tracking-widest">
                      // System_Ready
                   </p>
                </div>
                {profile?.role === 'developer' && (
                  <button 
                    onClick={() => navigate('/register-app')}
                    className="cyber-button flex items-center gap-2 text-xs"
                  >
                     <Plus size={16} /> Init_New_Project
                  </button>
                )}
             </div>

             {/* Content Switching */}
             {view === 'dashboard' && (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatWidget label="Active_Ops" value={stats.activeMissions} color="cyan" />
                    <StatWidget label="Total_Anomalies" value={stats.totalBugs} color="fuchsia" />
                    <StatWidget label="Available_Credits" value={stats.credits} color="amber" />
                 </div>
                 
                 <div className="mt-8">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Recent Activity</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {missions.slice(0, 3).map(m => (
                          <MissionCard 
                             key={m.id} 
                             mission={m} 
                             role={profile.role} 
                             onAction={handleMissionAction} 
                          />
                       ))}
                       {missions.length === 0 && (
                          <div className="col-span-full p-12 border border-cyan-900/30 border-dashed rounded flex flex-col items-center justify-center text-cyan-700">
                             <p className="mb-4">// No data stream found.</p>
                             {profile.role === 'developer' && (
                                <button onClick={() => navigate('/register-app')} className="text-xs underline hover:text-cyan-400">
                                   Start a new project
                                </button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
               </>
             )}

             {(view === 'my-apps' || view === 'missions') && (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {missions.map(m => (
                     <MissionCard 
                        key={m.id} 
                        mission={m} 
                        role={profile.role} 
                        onAction={handleMissionAction} 
                     />
                  ))}
               </div>
             )}

             {/* External Betas Module */}
             {view === 'external' && (
               <ExternalBetasPage />
             )}

          </div>
       </main>
    </div>
  );
}
