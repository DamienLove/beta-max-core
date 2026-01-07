import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Shield, Code, ChevronRight, Zap, Target, Star } from 'lucide-react';
import TestEngine from '../components/TestEngine';

export default function OnboardingPage() {
  const { user, setProfile } = useAuth();
  const [step, setStep] = useState(1); // 1: Role, 2: Qualification/Setup
  const [role, setRole] = useState(null); // 'tester' | 'developer'
  
  // Tester specific state
  const [testerSkill, setTesterSkill] = useState({});
  
  // Developer specific state
  const [devDetails, setDevDetails] = useState({ accountName: '', appCount: 1 });

  const completeOnboarding = async (data) => {
    const profile = {
      uid: user.uid,
      email: user.email,
      role: role,
      ...data,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", user.uid), profile);
    setProfile(profile);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 p-4 flex items-center justify-center font-retro overflow-hidden">
      <div className="fixed inset-0 crt-scanline z-50 pointer-events-none opacity-20"></div>
      
      <div className="max-w-2xl w-full bg-black/60 border border-cyan-900/30 p-8 rounded-lg backdrop-blur-md relative z-10 box-glow">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-glow-cyan italic mb-2">CHOOSE_YOUR_PATH</h2>
              <p className="text-xs text-cyan-700 uppercase tracking-widest">Assign your designation in the Beta Max Core</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => handleRoleSelect('tester')}
                className="group p-6 bg-slate-900/50 border border-cyan-900/20 rounded-lg hover:border-cyan-500 hover:bg-cyan-950/20 transition-all text-left"
              >
                <div className="w-12 h-12 bg-cyan-900/30 rounded flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield size={24} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">THE_SCOUT</h3>
                <p className="text-sm text-cyan-700">Beta Tester. Hunt for anomalies, test boundaries, and earn credits. Your feedback is the line between gold and garbage.</p>
              </button>

              <button 
                onClick={() => handleRoleSelect('developer')}
                className="group p-6 bg-slate-900/50 border border-fuchsia-900/20 rounded-lg hover:border-fuchsia-500 hover:bg-fuchsia-950/20 transition-all text-left"
              >
                <div className="w-12 h-12 bg-fuchsia-900/30 rounded flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Code size={24} className="text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">THE_ARCHITECT</h3>
                <p className="text-sm text-fuchsia-700">Developer. Deploy your creations, manage your scout teams, and refine your code through high-fidelity intel.</p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && role === 'tester' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {!testerSkill.tier ? (
               // Phase 1: The Test
               <>
                 <div className="flex items-center gap-4 mb-8">
                   <Shield className="text-cyan-500" />
                   <div>
                     <h2 className="text-2xl font-bold text-white uppercase">Scout Qualification</h2>
                     <p className="text-xs text-cyan-700">Calibrating your skill tier based on initial telemetry...</p>
                   </div>
                 </div>
                 
                 <TestEngine onComplete={(results) => setTesterSkill(prev => ({...prev, ...results}))} />
               </>
             ) : (
               // Phase 2: Details & Confirm
               <>
                 <div className="text-center mb-8 animate-in zoom-in">
                   <h2 className="text-3xl font-bold text-white">TIER {testerSkill.tier} ASSIGNED</h2>
                   <p className="text-cyan-500 text-sm">Score: {testerSkill.score}/{testerSkill.total}</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-cyan-700 uppercase mb-2 block">Primary Specialization</label>
                      <select className="w-full cyber-input text-xs" onChange={(e) => setTesterSkill(s => ({...s, spec: e.target.value}))}>
                        <option>Mobile App Testing</option>
                        <option>Game Mechanics</option>
                        <option>UI/UX Fidelity</option>
                        <option>Security Auditing</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-cyan-700 uppercase mb-2 block">Years of Experience</label>
                      <select className="w-full cyber-input text-xs" onChange={(e) => setTesterSkill(s => ({...s, experience: e.target.value}))}>
                        <option>None (Rookie)</option>
                        <option>1-2 Years</option>
                        <option>3-5 Years</option>
                        <option>5+ Years</option>
                      </select>
                    </div>
                 </div>

                 <button 
                   onClick={() => completeOnboarding({ skillData: testerSkill })}
                   className="cyber-button w-full mt-8 flex items-center justify-center gap-2"
                 >
                   Finalize Registration <ChevronRight size={18} />
                 </button>
               </>
             )}
          </div>
        )}

        {step === 2 && role === 'developer' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex items-center gap-4 mb-8">
               <Code className="text-fuchsia-500" />
               <div>
                 <h2 className="text-2xl font-bold text-white uppercase">Architect Protocols</h2>
                 <p className="text-xs text-fuchsia-700">Linking your development infrastructure to the core...</p>
               </div>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-fuchsia-700 uppercase mb-2 block">Developer Account / Studio Name</label>
                  <input 
                    type="text" 
                    className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500" 
                    placeholder="e.g. Cyberdyne Systems"
                    value={devDetails.accountName}
                    onChange={(e) => setDevDetails(s => ({...s, accountName: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-fuchsia-700 uppercase mb-2 block">Expected Active Beta Programs</label>
                  <input 
                    type="number" 
                    className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500" 
                    placeholder="1"
                    min="1"
                    value={devDetails.appCount}
                    onChange={(e) => setDevDetails(s => ({...s, appCount: e.target.value}))}
                  />
                </div>
                <div className="p-4 bg-fuchsia-950/10 border border-fuchsia-900/30 rounded">
                  <p className="text-xs text-fuchsia-300 flex items-center gap-2">
                    <Star size={14} className="text-amber-500" /> Vanguard Scouts (Tier 5) are available for your projects if you offer CR payouts.
                  </p>
                </div>
             </div>

             <button 
               onClick={() => completeOnboarding({ devDetails })}
               className="cyber-button w-full mt-8 flex items-center justify-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-400"
             >
               Initialize Dev Console <ChevronRight size={18} />
             </button>
          </div>
        )}

      </div>
    </div>
  );
}
