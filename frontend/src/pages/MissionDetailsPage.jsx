import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { 
  ChevronLeft, 
  Rocket, 
  Target, 
  Bug, 
  Users, 
  Activity,
  Play,
  FileText
} from 'lucide-react';
import AnomalyReportForm from '../components/AnomalyReportForm';

export default function MissionDetailsPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const docRef = doc(db, "missions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMission({ id: docSnap.id, ...docSnap.data() });

          // Check enrollment if tester
          if (profile.role === 'tester') {
              // Check if user is already enrolled
               const q = query(
                  collection(db, "enrollments"),
                  where("missionId", "==", id),
                  where("userId", "==", user.uid)
               );
               const enrollmentSnap = await getDocs(q);
               setEnrolled(!enrollmentSnap.empty);
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('mission fetch error', err);
        navigate('/dashboard', { replace: true, state: { error: err.message } });
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [id, navigate, profile, user]);

  const handlePublish = async () => {
    if (!mission) return;
    try {
      await updateDoc(doc(db, "missions", id), {
        status: 'ACTIVE'
      });
      setMission(prev => ({ ...prev, status: 'ACTIVE' }));
    } catch (err) {
      console.error("Error publishing:", err);
    }
  };

  const handleEnroll = async () => {
      if(enrolled) return;
      try {
          await addDoc(collection(db, "enrollments"), {
              missionId: id,
              userId: user.uid,
              userEmail: user.email,
              status: 'ENROLLED',
              joinedAt: serverTimestamp()
          });
          setEnrolled(true);
      } catch (err) {
          console.error("Error enrolling:", err);
      }
  };

  if (loading) return <div className="p-8 text-cyan-500 font-mono">LOADING_MISSION_DATA...</div>;

  const isOwner = profile.role === 'developer' && mission.architectId === user.uid;

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 p-4 md:p-8 font-retro relative overflow-hidden">
      <div className="fixed inset-0 crt-overlay z-50"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs text-cyan-700 hover:text-cyan-400 mb-8 transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Return_to_Console
        </button>

        <div className="grid md:grid-cols-3 gap-8">
           {/* Main Content */}
           <div className="md:col-span-2 space-y-6">
              <div className="cyber-panel p-8 rounded-lg">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">{mission.name}</h1>
                       <div className="flex gap-2">
                          <span className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded text-[10px] text-cyan-400">
                             {mission.platform}
                          </span>
                          <span className={`px-2 py-1 border rounded text-[10px] ${mission.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-400' : 'border-amber-500 text-amber-400'}`}>
                             {mission.status}
                          </span>
                       </div>
                    </div>
                    {isOwner && mission.status !== 'ACTIVE' && (
                       <button 
                         onClick={handlePublish}
                         className="cyber-button flex items-center gap-2"
                       >
                          <Rocket size={16} /> Deploy_Active
                       </button>
                    )}
                    {profile.role === 'tester' && (
                        <button 
                            onClick={handleEnroll}
                            disabled={enrolled}
                            className={`cyber-button flex items-center gap-2 ${enrolled ? 'bg-emerald-500 border-emerald-500 text-black' : ''}`}
                        >
                            {enrolled ? <Activity size={16}/> : <Play size={16}/>}
                            {enrolled ? 'ENROLLED' : 'JOIN_BETA'}
                        </button>
                    )}
                 </div>

                 <div className="space-y-4 text-sm text-slate-300 font-sans">
                    <h3 className="font-mono text-xs text-fuchsia-500 uppercase font-bold">Mission_Briefing</h3>
                    <p className="whitespace-pre-wrap">{mission.description}</p>
                 </div>
              </div>
              
              {/* Enrollment / Testing Area */}
              {enrolled && (
                   <div className="space-y-6">
                     {showReportForm ? (
                       <AnomalyReportForm mission={mission} onClose={() => setShowReportForm(false)} />
                     ) : (
                       <div className="cyber-panel p-8 rounded-lg border-emerald-500/30">
                           <h3 className="font-mono text-sm text-emerald-400 uppercase font-bold mb-4 flex items-center gap-2">
                               <Activity size={16} /> Active Testing Session
                           </h3>
                           <div className="grid grid-cols-2 gap-4">
                               <button 
                                 onClick={() => setShowReportForm(true)}
                                 className="cyber-button-ghost p-4 flex flex-col items-center gap-2 text-xs hover:bg-emerald-950/30 hover:border-emerald-500 hover:text-emerald-400"
                               >
                                   <Bug size={24} /> Report Anomaly
                               </button>
                               <button className="cyber-button-ghost p-4 flex flex-col items-center gap-2 text-xs hover:bg-cyan-950/30 hover:border-cyan-500 hover:text-cyan-400">
                                   <FileText size={24} /> Submit Feedback
                               </button>
                           </div>
                       </div>
                     )}
                   </div>
              )}
           </div>

           {/* Sidebar Stats */}
           <div className="space-y-4">
              <div className="cyber-panel p-6 rounded-lg space-y-4">
                 <h3 className="font-mono text-xs text-cyan-700 uppercase font-bold">Telemetry</h3>
                 
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Target size={14}/> Target Tier</span>
                    <span className="text-fuchsia-400 font-bold">TIER {mission.targetTier}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Bug size={14}/> Bugs Found</span>
                    <span className="text-cyan-400 font-bold">{mission.bugsFound || 0}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Users size={14}/> Scouts</span>
                    <span className="text-emerald-400 font-bold">{mission.scoutCount || 0}</span>
                 </div>
              </div>

              <div className="cyber-panel p-6 rounded-lg">
                  <h3 className="font-mono text-xs text-amber-600 uppercase font-bold mb-2">Reward_Protocol</h3>
                  <div className="text-2xl font-bold text-amber-400 text-glow-amber">
                      {mission.rewardValue} <span className="text-sm">{mission.rewardType === 'Paid' ? 'USD' : 'CR'}</span>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
