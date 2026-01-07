import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { 
  Bug, 
  AlertTriangle, 
  FileText, 
  Camera, 
  Send,
  X,
  ExternalLink
} from 'lucide-react';

export default function AnomalyReportForm({ mission, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('MINOR');
  const [showGithubExport, setShowGithubExport] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    steps: '',
    expected: '',
    actual: '',
    logs: ''
  });

  const generateGithubMarkdown = () => {
    return `
**Anomaly:** ${formData.title}
**Severity:** ${severity}
**Reporter:** ${user.email}

### Steps to Reproduce
${formData.steps}

### Expected Result
${formData.expected}

### Actual Result
${formData.actual}

### Logs
\`\`\`
${formData.logs}
\`\`\`
    `.trim();
  };

  const handleGithubRedirect = () => {
     if (!mission.externalIssuesUrl) return;
     
     const body = encodeURIComponent(generateGithubMarkdown());
     const title = encodeURIComponent(`[${severity}] ${formData.title}`);
     // Github new issue URL format: https://github.com/user/repo/issues/new?title=...&body=...
     // We assume externalIssuesUrl is the base repo URL or issues URL
     let baseUrl = mission.externalIssuesUrl.replace(/\/issues\/?$/, '');
     window.open(`${baseUrl}/issues/new?title=${title}&body=${body}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Anomaly Record
      await addDoc(collection(db, "anomalies"), {
        missionId: mission.id,
        missionName: mission.name,
        architectId: mission.architectId,
        reporterId: user.uid,
        reporterEmail: user.email,
        severity,
        status: 'OPEN',
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Increment Bug Counter on Mission
      const missionRef = doc(db, "missions", mission.id);
      await updateDoc(missionRef, {
        bugsFound: increment(1)
      });
      
      if (mission.externalIssuesUrl) {
         setShowGithubExport(true);
         setLoading(false); // Stop loading but keep form open for export
         return; 
      }

      onClose(true); // Success
    } catch (err) {
      console.error("Error reporting anomaly:", err);
      alert("Transmission Failed: " + err.message);
    } finally {
      if (!mission.externalIssuesUrl) setLoading(false);
    }
  };

  if (showGithubExport) {
     return (
        <div className="cyber-panel p-6 rounded-lg border-fuchsia-500/30 bg-black/80 animate-in fade-in zoom-in-95 text-center">
           <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500">
              <Send size={24} className="text-green-500" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">ANOMALY LOGGED</h3>
           <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
              The anomaly has been recorded in the Archives. This mission has an external issue tracker.
           </p>
           
           <button 
             onClick={handleGithubRedirect}
             className="cyber-button w-full mb-3 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-600"
           >
              Export to GitHub <ExternalLink size={16} />
           </button>
           
           <button 
             onClick={() => onClose(true)}
             className="text-xs text-cyan-500 hover:text-cyan-400 underline"
           >
              Close and Return
           </button>
        </div>
     );
  }

  return (
    <div className="cyber-panel p-6 rounded-lg border-fuchsia-500/30 relative bg-black/80 animate-in fade-in zoom-in-95">
      <button 
        onClick={() => onClose(false)} 
        className="absolute top-4 right-4 text-slate-500 hover:text-white"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fuchsia-900/30">
        <div className="w-10 h-10 bg-fuchsia-950/40 border border-fuchsia-500 rounded flex items-center justify-center">
          <Bug size={20} className="text-fuchsia-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Report Anomaly</h3>
          <p className="text-[10px] text-fuchsia-600 font-mono">SECURE CHANNEL // ENCRYPTED</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Severity Selector */}
        <div className="flex gap-2 mb-4">
          {['MINOR', 'MAJOR', 'CRITICAL'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverity(level)}
              className={`flex-1 py-2 text-[10px] font-bold border transition-all uppercase tracking-widest
                ${severity === level 
                  ? level === 'CRITICAL' 
                    ? 'bg-red-950/50 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                    : level === 'MAJOR' 
                      ? 'bg-amber-950/50 border-amber-500 text-amber-500' 
                      : 'bg-cyan-950/50 border-cyan-500 text-cyan-500'
                  : 'border-slate-800 text-slate-600 hover:border-slate-600'
                }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Anomaly Title</label>
          <input 
            required
            className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500"
            placeholder="e.g. Crash on Login Screen"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Steps to Reproduce</label>
            <textarea 
              required
              className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500 min-h-[100px] text-xs font-mono"
              placeholder="1. Open App..."
              value={formData.steps}
              onChange={e => setFormData({...formData, steps: e.target.value})}
            />
          </div>
          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Expected Result</label>
                <input 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500 text-xs"
                  placeholder="User should log in..."
                  value={formData.expected}
                  onChange={e => setFormData({...formData, expected: e.target.value})}
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Actual Result</label>
                <input 
                  className="w-full cyber-input border-fuchsia-900/30 focus:border-fuchsia-500 text-xs"
                  placeholder="App freezes..."
                  value={formData.actual}
                  onChange={e => setFormData({...formData, actual: e.target.value})}
                />
             </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
            <FileText size={12} /> System Logs / Stack Trace (Optional)
          </label>
          <textarea 
            className="w-full bg-black border border-fuchsia-900/30 text-fuchsia-500 p-2 text-[10px] font-mono rounded h-24 focus:border-fuchsia-500 outline-none"
            placeholder="// Paste crash logs here..."
            value={formData.logs}
            onChange={e => setFormData({...formData, logs: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="cyber-button w-full bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-400 text-white flex items-center justify-center gap-2"
        >
          {loading ? 'TRANSMITTING...' : <>TRANSMIT_ANOMALY <Send size={16} /></>}
        </button>

      </form>
    </div>
  );
}
