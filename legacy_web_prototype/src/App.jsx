import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Monitor, 
  Database, 
  Zap, 
  Cpu, 
  Shield, 
  Search, 
  ChevronRight, 
  AlertTriangle, 
  Wifi, 
  Lock, 
  Code,
  Minimize2,
  Maximize2,
  Power,
  Play
} from 'lucide-react';

/**
 * BETA MAX // SYSTEM CORE v1.0
 * Concept: Retro-Future Beta Testing Platform
 * Architect: Damien Nichols
 */

// --- Mock Data ---

const SYSTEM_USER = {
  handle: "User_Zero",
  rank: "Tape Master",
  credits: 4500,
  accessLevel: 3
};

const MISSIONS = [
  {
    id: "PRJ-01",
    name: "NEBULA_STREAM",
    status: "BETA_ACTIVE",
    bugs: 142,
    payout: 500,
    desc: "Next-gen audio streaming. Hunt for compression artifacts.",
    table: "nebula_issues"
  },
  {
    id: "PRJ-02",
    name: "TITAN_OS",
    status: "ALPHA_UNSTABLE",
    bugs: 12,
    payout: 1500,
    desc: "Experimental Android launcher replacement.",
    table: "titan_core"
  },
  {
    id: "PRJ-03",
    name: "CYBER_DOCK",
    status: "GOLD_MASTER",
    bugs: 0,
    payout: 0,
    desc: "Legacy docking station software.",
    table: "cyber_dock"
  }
];

const MOCK_DB_RESULTS = [
  { id: 101, severity: "CRITICAL", component: "Auth", status: "OPEN", desc: "Token leak on logout" },
  { id: 102, severity: "MINOR", component: "UI", status: "FIXED", desc: "Typo in EULA" },
  { id: 103, severity: "MAJOR", component: "Audio", status: "OPEN", desc: "Bitrate drop on 4G" },
];

// --- Styles for Retro Effects ---
const RetroStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;800&display=swap');
    
    .font-retro { font-family: 'JetBrains Mono', monospace; }
    
    .crt-scanline {
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.2) 50%,
        rgba(0,0,0,0.2)
      );
      background-size: 100% 4px;
      animation: scanline 10s linear infinite;
      pointer-events: none;
    }

    .text-glow-cyan { text-shadow: 0 0 10px rgba(34, 211, 238, 0.7); }
    .text-glow-pink { text-shadow: 0 0 10px rgba(232, 121, 249, 0.7); }
    .text-glow-amber { text-shadow: 0 0 10px rgba(251, 191, 36, 0.7); }
    .box-glow { box-shadow: 0 0 15px rgba(34, 211, 238, 0.1), inset 0 0 10px rgba(34, 211, 238, 0.1); }

    @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .cursor-blink { animation: cursor-blink 1s step-end infinite; }
  `}</style>
);

export default function BetaMax() {
  const [view, setView] = useState('visual'); // visual, terminal, query
  const [powerOn, setPowerOn] = useState(true);
  
  // Terminal State
  const [termLines, setTermLines] = useState([
    "BETA MAX [Version 1.0.4]",
    "(c) 2026 Damien Nichols. All rights reserved.",
    "",
    "Authenticating...",
    "User_Zero detected. Access Level 3 granted.",
    "Type 'help' for available commands.",
    ""
  ]);
  const [termInput, setTermInput] = useState('');
  const bottomRef = useRef(null);

  // Query AI State
  const [naturalQuery, setNaturalQuery] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [termLines]);

  // --- Logic ---

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!termInput.trim()) return;

    const cmd = termInput.trim().toLowerCase();
    const newLines = [`> ${termInput}`];

    // Simple Command Parser
    if (cmd === 'help') {
      newLines.push(
        "AVAILABLE COMMANDS:",
        "  list missions    - Show active beta programs",
        "  scan [target]    - Scan repository for anomalies",
        "  connect [id]     - Link Google/Steam identity",
        "  clear            - Clear terminal screen",
        "  gui              - Switch to Visual Interface"
      );
    } else if (cmd === 'list missions') {
      newLines.push("FETCHING MISSION MANIFEST...");
      MISSIONS.forEach(m => {
        newLines.push(`  [${m.status}] ${m.name} // Bugs: ${m.bugs} // Payout: ${m.payout} CR`);
      });
    } else if (cmd.startsWith('scan')) {
      newLines.push(`INITIATING DEEP SCAN ON TARGET...`);
      newLines.push(`[||||||||||    ] 65%`);
      setTimeout(() => setTermLines(prev => [...prev, "SCAN COMPLETE. 3 New Anomalies detected in public sector."]), 1000);
    } else if (cmd === 'clear') {
      setTermLines([]);
      setTermInput('');
      return;
    } else if (cmd === 'gui') {
      setView('visual');
    } else {
      newLines.push(`ERR: Command '${cmd}' not recognized.`);
    }

    setTermLines(prev => [...prev, ...newLines]);
    setTermInput('');
  };

  const handleAIQuery = () => {
    if (!naturalQuery) return;
    
    // Simulate AI Translation
    let mockCode = `SELECT * FROM global_anomalies\nWHERE app_id = 'NEBULA_STREAM'\nAND severity >= 'MAJOR'\nORDER BY report_date DESC;`;
    
    // Basic Keyword matching for demo
    if (naturalQuery.toLowerCase().includes('titan')) {
      mockCode = `SELECT * FROM titan_core\nWHERE status = 'OPEN'\nAND type != 'FEATURE_REQUEST';`;
    }

    setGeneratedCode('');
    // Typewriter effect for code
    let i = 0;
    const interval = setInterval(() => {
      setGeneratedCode(mockCode.slice(0, i));
      i++;
      if (i > mockCode.length) {
        clearInterval(interval);
        setQueryResult(MOCK_DB_RESULTS);
      }
    }, 20);
  };

  if (!powerOn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-retro relative overflow-hidden">
        <RetroStyles />
        <button 
          onClick={() => setPowerOn(true)}
          className="text-gray-800 hover:text-cyan-500 transition-colors flex flex-col items-center gap-4 group"
        >
          <Power size={64} className="group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
          <span className="tracking-widest text-sm">INITIALIZE SYSTEM</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 font-retro relative selection:bg-fuchsia-900 selection:text-white overflow-hidden">
      <RetroStyles />
      
      {/* CRT Overlay Effects */}
      <div className="fixed inset-0 crt-scanline z-50 pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>

      {/* Main Container */}
      <div className="flex h-screen flex-col md:flex-row">
        
        {/* Sidebar / Nav */}
        <div className="w-full md:w-64 border-r border-cyan-900/30 bg-black/40 flex flex-col backdrop-blur-sm z-10">
          <div className="p-6 border-b border-cyan-900/30">
            <h1 className="text-2xl font-bold tracking-tighter text-glow-cyan italic flex items-center gap-2">
              <span className="text-fuchsia-500">BETA</span> MAX
            </h1>
            <p className="text-[10px] text-cyan-700 mt-1 uppercase tracking-widest">System Core v1.0.4</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setView('visual')}
              className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3 ${view === 'visual' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 box-glow' : 'border-transparent text-cyan-700 hover:text-cyan-400'}`}
            >
              <Monitor size={18} /> VISUAL_MODE
            </button>
            <button 
              onClick={() => setView('terminal')}
              className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3 ${view === 'terminal' ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-300 box-glow' : 'border-transparent text-cyan-700 hover:text-fuchsia-400'}`}
            >
              <TerminalIcon size={18} /> TERMINAL_CLI
            </button>
            <button 
              onClick={() => setView('query')}
              className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3 ${view === 'query' ? 'bg-amber-950/40 border-amber-500 text-amber-300 box-glow' : 'border-transparent text-cyan-700 hover:text-amber-400'}`}
            >
              <Database size={18} /> QUERY_CORE
            </button>
          </nav>

          <div className="p-4 border-t border-cyan-900/30">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-cyan-900/50 rounded flex items-center justify-center border border-cyan-700">
                 {SYSTEM_USER.handle[0]}
               </div>
               <div>
                 <p className="text-xs font-bold text-white">{SYSTEM_USER.handle}</p>
                 <p className="text-[10px] text-fuchsia-400">{SYSTEM_USER.credits} CREDITS</p>
               </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8">
          
          {/* VISUAL DASHBOARD */}
          {view === 'visual' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-end border-b border-cyan-900/30 pb-4">
                 <h2 className="text-xl text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                   <Monitor className="text-fuchsia-500" /> Mission Control
                 </h2>
                 <span className="text-xs text-cyan-700 font-mono">STATUS: ONLINE</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { label: "Active Ops", val: "3", color: "text-cyan-400" },
                   { label: "System Load", val: "14%", color: "text-emerald-400" },
                   { label: "Net Earnings", val: "4.5k", color: "text-amber-400" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-black/40 border border-cyan-900/30 p-4 rounded hover:border-cyan-500/50 transition-colors">
                      <p className="text-[10px] text-cyan-700 uppercase">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color} text-glow-${stat.color.split('-')[1]}`}>{stat.val}</p>
                   </div>
                 ))}
              </div>

              {/* Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                 {MISSIONS.map((m) => (
                   <div key={m.id} className="relative group bg-slate-900/50 border border-slate-800 p-6 rounded-lg overflow-hidden hover:border-fuchsia-500/50 transition-all cursor-pointer">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play size={20} className="text-fuchsia-500 fill-fuchsia-500" />
                      </div>
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">{m.name}</h3>
                            <p className="text-[10px] font-mono text-cyan-600">{m.id} // {m.table}</p>
                         </div>
                         <span className={`px-2 py-1 text-[10px] border rounded ${m.status.includes('ALPHA') ? 'border-red-900 text-red-500' : 'border-emerald-900 text-emerald-500'}`}>
                           {m.status}
                         </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 font-sans">{m.desc}</p>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono">
                         <span className="text-amber-500">PAYOUT: {m.payout} CR</span>
                         <span className="text-cyan-600">{m.bugs} ANOMALIES</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* TERMINAL MODE */}
          {view === 'terminal' && (
            <div className="h-full flex flex-col bg-black border border-fuchsia-900/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(232,121,249,0.1)]">
              <div className="bg-fuchsia-950/20 px-4 py-2 border-b border-fuchsia-900/30 flex justify-between items-center">
                 <span className="text-xs text-fuchsia-500 font-bold flex items-center gap-2">
                   <TerminalIcon size={12} /> BASH_V4.0 // ROOT
                 </span>
                 <div className="flex gap-2">
                    <Minimize2 size={12} className="text-fuchsia-700" />
                    <Maximize2 size={12} className="text-fuchsia-700" />
                 </div>
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto" onClick={() => document.getElementById('term-input').focus()}>
                 {termLines.map((line, i) => (
                   <div key={i} className="mb-1 text-fuchsia-100/80 whitespace-pre-wrap">{line}</div>
                 ))}
                 <div ref={bottomRef} />
              </div>
              <form onSubmit={handleTerminalSubmit} className="p-2 bg-fuchsia-950/10 border-t border-fuchsia-900/30 flex gap-2">
                 <span className="text-fuchsia-500 font-bold">{`>`}</span>
                 <input 
                   id="term-input"
                   type="text" 
                   value={termInput}
                   onChange={(e) => setTermInput(e.target.value)}
                   className="flex-1 bg-transparent border-none outline-none text-fuchsia-100 placeholder-fuchsia-900"
                   placeholder="Enter command..."
                   autoFocus
                   autoComplete="off"
                 />
              </form>
            </div>
          )}

          {/* QUERY CORE (AI Learning) */}
          {view === 'query' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-amber-950/10 border border-amber-900/30 p-6 rounded-xl">
                 <h2 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                   <Zap size={20} /> Query Core
                 </h2>
                 <p className="text-sm text-amber-200/60 mb-6">
                   Describe your target data in plain English. The AI will construct the BMQL (Beta Max Query Language) syntax for you. Learn the syntax to become a Level 5 Operator.
                 </p>
                 
                 <div className="flex gap-4 mb-6">
                   <div className="flex-1">
                     <label className="text-[10px] font-bold text-amber-600 uppercase mb-2 block">Natural Language Input</label>
                     <input 
                       type="text" 
                       value={naturalQuery}
                       onChange={(e) => setNaturalQuery(e.target.value)}
                       placeholder="e.g., Show me all critical bugs in Nebula Stream..."
                       className="w-full bg-black border border-amber-900/50 rounded p-4 text-amber-100 focus:border-amber-500 outline-none transition-all placeholder-amber-900"
                     />
                   </div>
                   <button 
                     onClick={handleAIQuery}
                     className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-6 rounded shadow-[0_0_15px_rgba(251,191,36,0.3)] mt-6 transition-all active:scale-95"
                   >
                     TRANSLATE
                   </button>
                 </div>

                 {/* Code Output Area */}
                 <div className="bg-black border border-amber-900/50 rounded-lg p-4 font-mono text-sm min-h-[100px] relative overflow-hidden group">
                    <div className="absolute top-2 right-2 text-[10px] text-amber-900 font-bold border border-amber-900/30 px-2 rounded">
                      BMQL SYNTAX
                    </div>
                    {generatedCode ? (
                       <span className="text-amber-300 whitespace-pre-wrap">{generatedCode}<span className="cursor-blink inline-block w-2 h-4 bg-amber-500 ml-1 align-middle"></span></span>
                    ) : (
                       <span className="text-amber-900/50 italic">// Code generation pending...</span>
                    )}
                 </div>
              </div>

              {/* Results Table */}
              {queryResult && (
                <div className="border border-cyan-900/30 rounded-lg overflow-hidden animate-in fade-in">
                   <div className="bg-cyan-950/20 px-4 py-2 border-b border-cyan-900/30 flex justify-between">
                      <span className="text-xs text-cyan-500 font-bold">QUERY RESULTS</span>
                      <span className="text-xs text-cyan-800">3 RECORDS FOUND</span>
                   </div>
                   <table className="w-full text-left text-sm">
                      <thead className="bg-cyan-950/10 text-cyan-600 font-mono text-xs">
                         <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">SEVERITY</th>
                            <th className="p-3">COMPONENT</th>
                            <th className="p-3">STATUS</th>
                            <th className="p-3">DESC</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-900/20 text-cyan-100">
                         {queryResult.map((row) => (
                           <tr key={row.id} className="hover:bg-cyan-500/10 transition-colors font-mono text-xs">
                              <td className="p-3 text-cyan-600">#{row.id}</td>
                              <td className={`p-3 font-bold ${row.severity === 'CRITICAL' ? 'text-red-500' : 'text-cyan-400'}`}>{row.severity}</td>
                              <td className="p-3">{row.component}</td>
                              <td className="p-3">{row.status}</td>
                              <td className="p-3 text-cyan-200/70">{row.desc}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}