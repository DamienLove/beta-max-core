import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, 
  ChevronLeft, 
  Layout, 
  Target, 
  Coins, 
  Info,
  Globe,
  Smartphone,
  Gamepad2
} from 'lucide-react';

export default function AppRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Android',
    packageId: '',
    description: '',
    targetTier: '1',
    rewardType: 'Credits',
    rewardValue: '100'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "missions"), {
        ...formData,
        architectId: user.uid,
        status: 'PENDING_RECRUITMENT',
        bugsFound: 0,
        createdAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error registering app:", err);
      alert("System Error: Failed to register mission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 p-4 md:p-8 font-retro relative overflow-hidden">
      <div className="fixed inset-0 crt-scanline z-50 pointer-events-none opacity-20"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs text-cyan-700 hover:text-cyan-400 mb-8 transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back_to_Console
        </button>

        <div className="bg-black/40 border border-fuchsia-900/30 p-8 rounded-lg box-glow">
          <div className="flex items-center gap-4 mb-8 border-b border-fuchsia-900/30 pb-6">
            <div className="w-12 h-12 bg-fuchsia-950/40 border border-fuchsia-500 rounded flex items-center justify-center">
              <Plus size={24} className="text-fuchsia-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Register_New_Mission</h1>
              <p className="text-xs text-fuchsia-700">Initiate a recruitment protocol for your software anomaly hunt.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* App Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                  <Layout size={12} /> App_Name
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
                  placeholder="e.g. PROJECT_NEBULA"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                  <Globe size={12} /> Target_Platform
                </label>
                <select 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                >
                  <option value="Android">Android (APK/AAB)</option>
                  <option value="iOS">iOS (TestFlight)</option>
                  <option value="Web">Web (URL)</option>
                  <option value="PC/Console">PC / Game Build</option>
                </select>
              </div>
            </div>

            {/* Package ID / URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                <Smartphone size={12} /> Package_Identifier / Link
              </label>
              <input 
                required
                type="text" 
                className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500 font-mono"
                placeholder="com.company.app or https://beta.app.com"
                value={formData.packageId}
                onChange={(e) => setFormData({...formData, packageId: e.target.value})}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                <Info size={12} /> Mission_Briefing
              </label>
              <textarea 
                required
                className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500 min-h-[100px]"
                placeholder="Describe the scope of testing. What specific anomalies are you hunting for?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-fuchsia-900/20">
              {/* Target Tier */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                  <Target size={12} /> Required_Scout_Tier
                </label>
                <select 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
                  value={formData.targetTier}
                  onChange={(e) => setFormData({...formData, targetTier: e.target.value})}
                >
                  <option value="1">Tier 1: Rookie (General)</option>
                  <option value="2">Tier 2: Veteran (Detailed)</option>
                  <option value="3">Tier 3: Elite (Crash Logs)</option>
                  <option value="4">Tier 4: Specialist (Security)</option>
                  <option value="5">Tier 5: Vanguard (The Best)</option>
                </select>
              </div>

              {/* Reward Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-fuchsia-700 uppercase flex items-center gap-2">
                  <Coins size={12} /> Reward_Protocol
                </label>
                <select 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
                  value={formData.rewardType}
                  onChange={(e) => setFormData({...formData, rewardType: e.target.value})}
                >
                  <option value="Credits">BM Credits</option>
                  <option value="Paid">USD / Cash</option>
                  <option value="Badge">Special Achievement</option>
                </select>
              </div>

              {/* Reward Value */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-fuchsia-700 uppercase mb-2 block">Value</label>
                <input 
                  type="text" 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
                  placeholder="100"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({...formData, rewardValue: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="cyber-button w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-extrabold py-4 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'COMMITTING_TO_CORE...' : 'DEPLOY_MISSION_RECRUITMENT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
