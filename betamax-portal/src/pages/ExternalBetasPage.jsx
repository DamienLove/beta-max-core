import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  Globe, 
  ExternalLink, 
  Plus, 
  Search,
  Smartphone,
  AlertTriangle,
  Github
} from 'lucide-react';

export default function ExternalBetasPage() {
  const { user } = useAuth();
  const [betas, setBetas] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    issuesUrl: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch COMMUNITY missions
    const q = query(
      collection(db, "missions"), 
      where("type", "==", "COMMUNITY"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBetas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleAddBeta = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic extraction logic
      let packageId = "unknown.package";
      let name = "Unknown App";
      let platform = "Web";
      let description = "Community detected beta signal.";

      if (formData.url.includes("play.google.com")) {
        platform = "Android";
        const idMatch = formData.url.match(/id=([a-zA-Z0-9_.]+)/);
        if (idMatch) packageId = idMatch[1];
        name = packageId.split('.').pop() || "Android App"; 
        // Simulated "Scan" result
        description = "Public access beta detected on Google Play. Testing parameters unknown. Scout discretion advised.";
      } else if (formData.url.includes("testflight.apple.com")) {
        platform = "iOS";
        name = "iOS Beta";
        description = "TestFlight signal intercepted.";
      }

      await addDoc(collection(db, "missions"), {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        packageId,
        platform,
        storeUrl: formData.url,
        externalIssuesUrl: formData.issuesUrl,
        description,
        type: 'COMMUNITY', // Key differentiator
        status: 'ACTIVE',
        targetTier: '1', // Open to all by default
        rewardType: 'Credits',
        rewardValue: '10', // Small bounty for community finding
        architectId: user.uid, // "Scouted by"
        addedByEmail: user.email,
        bugsFound: 0,
        createdAt: serverTimestamp()
      });

      setFormData({ url: '', issuesUrl: '' });
      setShowAdd(false);
    } catch (err) {
      console.error("Error adding beta:", err);
      alert("Failed to track signal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       
       {/* Actions */}
       <div className="flex justify-between items-center">
         <div className="bg-cyan-950/20 px-4 py-2 border border-cyan-900/30 rounded flex items-center gap-2 text-cyan-500 text-xs font-mono">
            <Search size={14} />
            SCANNING_EXTERNAL_FREQUENCIES...
         </div>
         <button 
           onClick={() => setShowAdd(!showAdd)}
           className="cyber-button text-xs flex items-center gap-2"
         >
           <Plus size={14} /> Add_Signal
         </button>
       </div>

       {/* Add Form */}
       {showAdd && (
         <div className="cyber-panel p-6 rounded-lg animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-white uppercase mb-4">Track New Beta Program</h3>
            <form onSubmit={handleAddBeta} className="space-y-4">
               <div className="flex gap-4">
                 <input 
                   required
                   type="url" 
                   placeholder="Paste Google Play or TestFlight URL..."
                   className="flex-1 cyber-input"
                   value={formData.url}
                   onChange={e => setFormData({...formData, url: e.target.value})}
                 />
               </div>
               <div className="flex gap-4">
                 <input 
                   type="url" 
                   placeholder="External Issue Tracker (e.g. GitHub Issues URL) - Optional"
                   className="flex-1 cyber-input border-dashed"
                   value={formData.issuesUrl}
                   onChange={e => setFormData({...formData, issuesUrl: e.target.value})}
                 />
                 <button disabled={loading} type="submit" className="cyber-button px-8">
                   {loading ? 'SCANNING...' : 'TRACK'}
                 </button>
               </div>
            </form>
            <p className="text-[10px] text-cyan-700 mt-2 font-mono">
               // System will automatically extract package identifiers from standard URLs.
            </p>
         </div>
       )}

       {/* Grid */}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {betas.map(beta => (
            <div key={beta.id} className="cyber-panel p-4 rounded hover:border-cyan-400 group relative">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-cyan-900/20 rounded flex items-center justify-center text-cyan-500">
                        {beta.platform === 'Android' ? <Smartphone size={16} /> : <Globe size={16} />}
                     </div>
                     <div>
                        <h4 className="font-bold text-white text-sm">{beta.name}</h4>
                        <p className="text-[10px] text-cyan-600 font-mono">{beta.packageId}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    {beta.externalIssuesUrl && (
                      <a 
                        href={beta.externalIssuesUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-fuchsia-900/30 rounded text-fuchsia-500"
                        title="Issue Tracker"
                      >
                        <Github size={14} />
                      </a>
                    )}
                    <a 
                      href={beta.storeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-cyan-900/30 rounded text-cyan-500"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
               </div>
               
               <div className="mt-4 pt-2 border-t border-cyan-900/20 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>SOURCE: {beta.platform.toUpperCase()}</span>
                  <span>SCOUT: {beta.addedByEmail ? beta.addedByEmail.split('@')[0] : 'UNKNOWN'}</span>
               </div>
            </div>
          ))}

          {betas.length === 0 && (
             <div className="col-span-full text-center p-12 text-slate-600 font-mono text-sm border border-dashed border-slate-800 rounded">
                // No community signals detected. Add a URL to begin tracking.
             </div>
          )}
       </div>
    </div>
  );
}
