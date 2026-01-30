import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug, Trophy, Zap, Terminal as TerminalIcon, User, LogOut, Plus, ChevronRight, 
  Search, Globe, Gamepad2, Home, Target, Send, ArrowLeft, Eye, Clock, Star,
  Sparkles, Shield, Award, TrendingUp, Activity, AlertTriangle, Check, X,
  Play, Pause, RotateCcw, Volume2, VolumeX
} from 'lucide-react';

// ============== UTILS ==============

// Security: Client-side hashing for prototype credentials
const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ============== MOCK DATA ==============

const MOCK_USERS = [
  {
    id: "u1",
    name: "Neo_Runner",
    email: "neo@betamax.io",
    passwordHash: "937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244", // test1234
    role: "scout",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    stats: { vectorPoints: 4250, rank: "Bug Hunter II", bugsSubmitted: 42, accuracy: 94, gamesWon: 12 },
    tier: "gold"
  },
  {
    id: "u2",
    name: "CyberSarah",
    email: "sarah@betamax.io",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // admin1234
    role: "architect",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    stats: { vectorPoints: 8500, rank: "Code Architect", bugsSubmitted: 0, accuracy: 100, gamesWon: 5 },
    tier: "platinum"
  }
];

const INITIAL_PROJECTS = [
  {
    id: "p1",
    name: "Neon Wallet",
    description: "Next-gen crypto wallet with biometric auth, social recovery, and cross-chain swaps.",
    versions: [
      { version: "4.2.0-beta", releaseDate: "2024-01-15", isCurrent: true, changelog: ["Biometric login flow", "Fixed crash on transaction history", "New dark theme"] },
      { version: "4.1.5-alpha", releaseDate: "2024-01-01", isCurrent: false, changelog: ["Initial UI setup", "Wallet creation flow"] }
    ],
    status: "Beta",
    platform: "Android 14+",
    payout: 50,
    imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
    features: ["Biometric Login", "P2P Transfer", "Cold Storage Vault", "NFT Gallery"],
    enrolledUsers: 128,
    isOfficial: true
  },
  {
    id: "p2",
    name: "Titan OS Kernel",
    description: "Low-level kernel optimization for embedded systems with ARM64 support.",
    versions: [
      { version: "0.9.1-alpha", releaseDate: "2024-01-20", isCurrent: true, changelog: ["Memory leak fix in scheduler", "New driver support for ARM64"] }
    ],
    status: "Alpha",
    platform: "Linux / ARM64",
    payout: 120,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    features: ["Memory Management", "Process Scheduling", "Hardware Abstraction"],
    enrolledUsers: 45,
    isOfficial: true
  },
  {
    id: "p3",
    name: "Synthwave Player",
    description: "Retro-futuristic music player with AI-powered playlist generation.",
    versions: [
      { version: "2.0.0-rc", releaseDate: "2024-01-18", isCurrent: true, changelog: ["AI playlist generation", "Equalizer presets", "Offline mode"] }
    ],
    status: "RC",
    platform: "iOS / Android",
    payout: 35,
    imageUrl: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=800&q=80",
    features: ["AI Playlists", "Offline Mode", "Social Sharing", "Visualizer"],
    enrolledUsers: 312,
    isOfficial: true
  }
];

const EXTERNAL_BETAS = [
  {
    id: "ext1",
    name: "TestFlight - Apple",
    platform: "iOS",
    url: "https://testflight.apple.com",
    description: "Official Apple beta testing platform",
    addedBy: "u1",
    votes: 45
  },
  {
    id: "ext2", 
    name: "Play Store Beta",
    platform: "Android",
    url: "https://play.google.com/apps/testing",
    description: "Google Play beta program access",
    addedBy: "u2",
    votes: 38
  }
];

const INITIAL_ANOMALIES = [
  { 
    id: "a1", 
    type: 'Bug',
    title: "Crash on launch when offline", 
    description: "The app immediately closes if launched without wifi connection. Reproducible 100% of the time.",
    severity: "Critical", 
    status: "Open", 
    projectId: "p1", 
    projectName: "Neon Wallet",
    version: "4.2.0-beta",
    reporterId: "u1",
    reporterName: "Neo_Runner",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    pointsAwarded: 150
  },
  { 
    id: "a2", 
    type: 'Bug',
    title: "Memory leak in dashboard", 
    description: "Dashboard component leaks memory after 10 minutes of use. RAM usage grows from 200MB to 800MB.",
    severity: "High", 
    status: "In Review", 
    projectId: "p2", 
    projectName: "Titan OS Kernel",
    version: "0.9.1-alpha",
    reporterId: "u1",
    reporterName: "Neo_Runner",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    pointsAwarded: 100
  }
];

// ============== CONTEXT ==============

const AppContext = createContext(undefined);

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [externalBetas, setExternalBetas] = useState(EXTERNAL_BETAS);
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    // Sound effects would be played here
  }, [soundEnabled]);

  const login = useCallback(async (email, password) => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const hash = await hashPassword(password);
      if (found.passwordHash === hash) {
        setUser(found);
        playSound('login');
        return { success: true };
      }
    }
    return { success: false, error: "Access denied. Invalid credentials." };
  }, [playSound]);

  const logout = useCallback(() => {
    setUser(null);
    playSound('logout');
  }, [playSound]);

  const addAnomaly = useCallback((item) => {
    if (!user) return;
    const points = item.severity === 'Critical' ? 150 : item.severity === 'High' ? 100 : item.severity === 'Medium' ? 50 : 25;
    const newItem = {
      ...item,
      id: `a-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reporterId: user.id,
      reporterName: user.name,
      status: 'Open',
      pointsAwarded: points
    };
    setAnomalies(prev => [newItem, ...prev]);
    // Update user points
    setUser(prev => prev ? {
      ...prev,
      stats: { ...prev.stats, vectorPoints: prev.stats.vectorPoints + points, bugsSubmitted: prev.stats.bugsSubmitted + 1 }
    } : null);
    playSound('submit');
    return newItem;
  }, [user, playSound]);

  const addExternalBeta = useCallback((beta) => {
    if (!user) return;
    const newBeta = {
      ...beta,
      id: `ext-${Date.now()}`,
      addedBy: user.id,
      votes: 0
    };
    setExternalBetas(prev => [newBeta, ...prev]);
    playSound('add');
    return newBeta;
  }, [user, playSound]);

  const spendPoints = useCallback((amount) => {
    if (!user || user.stats.vectorPoints < amount) return false;
    setUser(prev => prev ? {
      ...prev,
      stats: { ...prev.stats, vectorPoints: prev.stats.vectorPoints - amount }
    } : null);
    return true;
  }, [user]);

  const value = useMemo(() => ({
    user, login, logout, projects, externalBetas, anomalies, 
    addAnomaly, addExternalBeta, spendPoints, soundEnabled, setSoundEnabled
  }), [user, login, logout, projects, externalBetas, anomalies, addAnomaly, addExternalBeta, spendPoints, soundEnabled]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ============== COMPONENTS ==============

const Icon = React.memo(({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none ${className}`} aria-hidden="true">{name}</span>
));

const GlitchText = ({ children, className = "" }) => (
  <span className={`relative inline-block animate-glitch ${className}`}>
    {children}
  </span>
);

const CyberBorder = ({ children, className = "", color = "cyan" }) => (
  <div className={`relative ${className}`}>
    <div className={`absolute -inset-px bg-gradient-to-r ${color === 'cyan' ? 'from-cyan-500/50 to-cyan-500/0' : 'from-fuchsia-500/50 to-fuchsia-500/0'} blur-sm`} />
    <div className="relative bg-surface/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
      {children}
    </div>
  </div>
);

const StatCard = ({ icon: IconComp, label, value, color = "cyan", trend }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className="cyber-panel rounded-xl p-5 stat-card"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${color === 'cyan' ? 'bg-cyan-500/10' : color === 'fuchsia' ? 'bg-fuchsia-500/10' : 'bg-amber-500/10'}`}>
        <IconComp className={`w-5 h-5 ${color === 'cyan' ? 'text-cyan-400' : color === 'fuchsia' ? 'text-fuchsia-400' : 'text-amber-400'}`} />
      </div>
      {trend && (
        <span className={`text-xs flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className="w-3 h-3" />
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold font-display ${color === 'cyan' ? 'text-cyan-400' : color === 'fuchsia' ? 'text-fuchsia-400' : 'text-amber-400'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Alpha: "badge-red",
    Beta: "badge-cyan",
    RC: "badge-amber",
    Live: "badge-green",
    Open: "badge-green",
    "In Review": "badge-fuchsia",
    Resolved: "badge-cyan",
    Rejected: "badge-red",
    Critical: "bg-red-500 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-500 text-black",
    Low: "bg-blue-500 text-white"
  };
  return <span className={`badge ${styles[status] || 'badge-cyan'}`}>{status}</span>;
};

// ============== AUTH SCREEN ==============

const AuthScreen = () => {
  const { login } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden grid-bg">
      <div className="crt-overlay" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${100 + Math.random() * 200}px`,
            }}
            animate={{
              y: ['-100%', '100vh'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md cyber-panel rounded-2xl p-8 relative z-10"
      >
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative mb-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-xl flex items-center justify-center"
              animate={{ 
                boxShadow: ['0 0 20px rgba(6, 182, 212, 0.5)', '0 0 40px rgba(232, 121, 249, 0.5)', '0 0 20px rgba(6, 182, 212, 0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bug className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-display font-black tracking-wider">
            <span className="text-fuchsia-400">BETA</span>
            <span className="text-cyan-400">MAX</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">System Access Protocol</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Identity_ID
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input w-full"
              placeholder="neo@betamax.io"
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Access_Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input w-full"
              placeholder="••••••••••"
              data-testid="password-input"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="cyber-button w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="login-submit-btn"
          >
            {loading ? (
              <motion.div 
                className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {isLogin ? "Initialize_Session" : "Create_Identity"}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            Demo: <span className="text-cyan-400 font-mono">neo@betamax.io</span> or <span className="text-fuchsia-400 font-mono">sarah@betamax.io</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ============== SIDEBAR ==============

const Sidebar = ({ currentView }) => {
  const navigate = useNavigate();
  const { user, logout, soundEnabled, setSoundEnabled } = useApp();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'missions', icon: Target, label: 'Missions', path: '/missions' },
    { id: 'external', icon: Globe, label: 'External Betas', path: '/external' },
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal', path: '/terminal' },
    { id: 'arcade', icon: Gamepad2, label: 'Arcade', path: '/arcade' },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-surface/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-lg flex items-center justify-center animate-pulse-glow">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-black tracking-wider">
              <span className="text-fuchsia-400">BETA</span>
              <span className="text-cyan-400">MAX</span>
            </h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest">v3.0.0</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="cyber-panel rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="w-10 h-10 rounded-lg object-cover border border-cyan-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-cyan-400 font-mono">{user?.stats.rank}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Vector Points</span>
            <span className="text-amber-400 font-bold font-mono">{user?.stats.vectorPoints.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            whileTap={{ scale: 0.9 }}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={logout}
            whileTap={{ scale: 0.9 }}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

// ============== DASHBOARD ==============

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, projects, anomalies } = useApp();
  
  const myAnomalies = useMemo(() => anomalies.filter(a => a.reporterId === user?.id), [anomalies, user?.id]);
  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wider mb-1">
            THE_DECK
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="text-cyan-400">{user?.name}</span>
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/report')}
          className="cyber-button flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="report-anomaly-btn"
        >
          <Bug className="w-4 h-4" />
          Report_Anomaly
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={Zap} label="Vector_Points" value={user?.stats.vectorPoints || 0} color="amber" trend={12} />
        <StatCard icon={Bug} label="Anomalies_Logged" value={myAnomalies.length} color="fuchsia" trend={8} />
        <StatCard icon={Trophy} label="Accuracy_Rate" value={`${user?.stats.accuracy || 0}%`} color="cyan" />
        <StatCard icon={Gamepad2} label="Games_Won" value={user?.stats.gamesWon || 0} color="fuchsia" />
      </motion.div>

      {/* Active Missions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active_Missions</h2>
          <Link to="/missions" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/mission/${project.id}`)}
              className="cyber-panel rounded-xl overflow-hidden cursor-pointer group"
              data-testid={`project-card-${project.id}`}
            >
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={project.status} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{project.platform}</span>
                  <span className="text-xs text-amber-400 font-mono">${project.payout}/bug</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recent Anomalies */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent_Anomaly_Logs</h2>
        {myAnomalies.length === 0 ? (
          <div className="cyber-panel rounded-xl p-8 text-center">
            <Bug className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No anomalies logged yet</p>
            <p className="text-xs text-slate-500">Start hunting bugs to earn Vector Points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAnomalies.slice(0, 3).map((anomaly) => (
              <motion.div
                key={anomaly.id}
                whileHover={{ x: 4 }}
                className="cyber-panel rounded-xl p-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  anomaly.severity === 'Critical' ? 'bg-red-500/20' : 
                  anomaly.severity === 'High' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Bug className={`w-5 h-5 ${
                    anomaly.severity === 'Critical' ? 'text-red-400' : 
                    anomaly.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{anomaly.title}</p>
                  <p className="text-xs text-slate-500">{anomaly.projectName} • v{anomaly.version}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={anomaly.status} />
                  <p className="text-xs text-amber-400 mt-1">+{anomaly.pointsAwarded} VP</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
};

// ============== MISSIONS PAGE ==============

const MissionsPage = () => {
  const navigate = useNavigate();
  const { projects } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                           p.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || p.status.toLowerCase() === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, filter, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wider mb-1">MISSIONS</h1>
          <p className="text-sm text-slate-500">Browse and join beta testing missions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search missions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input w-full pl-10"
            data-testid="mission-search"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'alpha', 'beta', 'rc'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                filter === f 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/mission/${project.id}`)}
            className="cyber-panel rounded-xl overflow-hidden cursor-pointer group"
            data-testid={`mission-card-${project.id}`}
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={project.imageUrl} 
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <StatusBadge status={project.status} />
                {project.isOfficial && <span className="badge badge-cyan"><Shield className="w-3 h-3 mr-1" /> Official</span>}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors">{project.name}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.features.slice(0, 3).map(f => (
                  <span key={f} className="text-[10px] px-2 py-1 bg-white/5 rounded text-slate-400">{f}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <User className="w-4 h-4" />
                  {project.enrolledUsers} scouts
                </div>
                <span className="text-amber-400 font-bold font-mono">${project.payout}/bug</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============== MISSION DETAIL ==============

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, anomalies } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  const projectAnomalies = useMemo(() => anomalies.filter(a => a.projectId === id), [anomalies, id]);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Mission not found</p>
        <button onClick={() => navigate('/missions')} className="cyber-button mt-4">Back to Missions</button>
      </div>
    );
  }

  const currentVersion = project.versions.find(v => v.isCurrent);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64">
        <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-6 left-6 w-10 h-10 bg-black/50 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="absolute bottom-6 left-8 right-8">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={project.status} />
            {project.isOfficial && <span className="badge badge-cyan"><Shield className="w-3 h-3 mr-1" /> Official</span>}
          </div>
          <h1 className="text-4xl font-display font-black text-white mb-2">{project.name}</h1>
          <p className="text-slate-400 flex items-center gap-4">
            <span className="text-cyan-400 font-mono">v{currentVersion?.version}</span>
            <span>{project.platform}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-white/5 z-20">
        <div className="flex gap-1 px-8 py-2">
          {['overview', 'changelog', 'anomalies'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="cyber-panel rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-slate-300 leading-relaxed">{project.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Testing Scope</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {project.features.map(f => (
                    <div key={f} className="cyber-panel rounded-lg p-4 flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cyber-panel rounded-xl p-6 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Bounty Program</h3>
                    <p className="text-slate-300">Earn up to <span className="text-white font-bold">${project.payout}</span> per verified anomaly</p>
                  </div>
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
              </div>

              <motion.button
                onClick={() => navigate('/report', { state: { projectId: project.id } })}
                className="cyber-button w-full py-4 text-base"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                data-testid="submit-anomaly-btn"
              >
                <Bug className="w-5 h-5 mr-2 inline" />
                Submit_Anomaly_Report
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'changelog' && (
            <motion.div
              key="changelog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {project.versions.map((ver, i) => (
                <div key={ver.version} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-background bg-cyan-500" />
                  {i < project.versions.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-white/10" />
                  )}
                  <div className="cyber-panel rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-mono font-bold text-white">{ver.version}</span>
                      {ver.isCurrent && <span className="badge badge-cyan">Current</span>}
                      <span className="text-xs text-slate-500 ml-auto">{ver.releaseDate}</span>
                    </div>
                    <ul className="space-y-2">
                      {ver.changelog.map((log, j) => (
                        <li key={j} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-cyan-500 mt-1">•</span>
                          {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'anomalies' && (
            <motion.div
              key="anomalies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {projectAnomalies.length === 0 ? (
                <div className="cyber-panel rounded-xl p-12 text-center">
                  <Bug className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No anomalies reported yet</p>
                  <p className="text-xs text-slate-500">Be the first to find a bug!</p>
                </div>
              ) : (
                projectAnomalies.map(a => (
                  <div key={a.id} className="cyber-panel rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        a.severity === 'Critical' ? 'bg-red-500/20' : 
                        a.severity === 'High' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                      }`}>
                        <Bug className={`w-5 h-5 ${
                          a.severity === 'Critical' ? 'text-red-400' : 
                          a.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={a.severity} />
                          <StatusBadge status={a.status} />
                        </div>
                        <h4 className="text-white font-medium mb-1">{a.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2">{a.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>by {a.reporterName}</span>
                          <span>v{a.version}</span>
                          <span>{new Date(a.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============== REPORT ANOMALY ==============

const ReportAnomaly = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, addAnomaly } = useApp();

  const [projectId, setProjectId] = useState(location.state?.projectId || projects[0]?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const currentVersion = project?.versions.find(v => v.isCurrent);
  const isValid = title.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !project) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    addAnomaly({
      type: 'Bug',
      title,
      description,
      severity,
      projectId: project.id,
      projectName: project.name,
      version: currentVersion?.version || '1.0.0'
    });

    navigate(-1);
  };

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-display font-black text-white">Report_Anomaly</h1>
            <p className="text-sm text-slate-500">Submit a bug report to earn Vector Points</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="anomaly-report-form">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="cyber-input w-full"
                data-testid="project-select"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Version</label>
              <input
                type="text"
                value={currentVersion?.version || ''}
                readOnly
                className="cyber-input w-full bg-surface/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-3 rounded-lg text-xs font-bold uppercase transition-all ${
                    severity === s 
                      ? s === 'Critical' ? 'bg-red-500 text-white' :
                        s === 'High' ? 'bg-orange-500 text-white' :
                        s === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                      : 'bg-surface text-slate-400 hover:bg-white/5'
                  }`}
                  data-testid={`severity-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the anomaly"
              className="cyber-input w-full"
              data-testid="anomaly-title"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, expected vs actual behavior..."
              rows={6}
              className="cyber-input w-full resize-none"
              data-testid="anomaly-description"
            />
          </div>

          <div className="cyber-panel rounded-xl p-4 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm text-white">Potential Reward</p>
                <p className="text-xs text-slate-400">
                  {severity === 'Critical' ? '150' : severity === 'High' ? '100' : severity === 'Medium' ? '50' : '25'} Vector Points
                </p>
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!isValid || submitting}
            className="cyber-button w-full py-4"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            data-testid="submit-report-btn"
          >
            {submitting ? (
              <motion.div 
                className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2 inline" />
                Submit_Report
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ============== EXTERNAL BETAS ==============

const ExternalBetasPage = () => {
  const { externalBetas, addExternalBeta, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newBeta, setNewBeta] = useState({ name: '', platform: '', url: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBeta.name && newBeta.url) {
      addExternalBeta(newBeta);
      setNewBeta({ name: '', platform: '', url: '', description: '' });
      setShowForm(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wider mb-1">EXTERNAL_BETAS</h1>
          <p className="text-sm text-slate-500">Community-submitted beta testing opportunities</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="cyber-button flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-external-beta-btn"
        >
          <Plus className="w-4 h-4" />
          Add_Beta
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="cyber-panel rounded-xl p-6 space-y-4"
            data-testid="add-beta-form"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="App Name"
                value={newBeta.name}
                onChange={(e) => setNewBeta({ ...newBeta, name: e.target.value })}
                className="cyber-input"
                data-testid="beta-name-input"
              />
              <input
                type="text"
                placeholder="Platform (iOS, Android, Web...)"
                value={newBeta.platform}
                onChange={(e) => setNewBeta({ ...newBeta, platform: e.target.value })}
                className="cyber-input"
              />
            </div>
            <input
              type="url"
              placeholder="Beta URL"
              value={newBeta.url}
              onChange={(e) => setNewBeta({ ...newBeta, url: e.target.value })}
              className="cyber-input w-full"
              data-testid="beta-url-input"
            />
            <textarea
              placeholder="Description"
              value={newBeta.description}
              onChange={(e) => setNewBeta({ ...newBeta, description: e.target.value })}
              className="cyber-input w-full"
              rows={3}
            />
            <div className="flex gap-3">
              <button type="submit" className="cyber-button" data-testid="submit-beta-btn">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="cyber-button-ghost px-4 py-2">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {externalBetas.map((beta, i) => (
          <motion.a
            key={beta.id}
            href={beta.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -4 }}
            className="cyber-panel rounded-xl p-5 block group"
            data-testid={`external-beta-${beta.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              <span className="badge badge-cyan">{beta.platform}</span>
            </div>
            <h3 className="text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors">{beta.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{beta.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{beta.votes} votes</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

// ============== TERMINAL ==============

const TerminalPage = () => {
  const { user, projects, anomalies } = useApp();
  const [history, setHistory] = useState([
    { type: 'system', text: 'BETA MAX TERMINAL v3.0.0' },
    { type: 'system', text: 'Type "help" for available commands.' },
    { type: 'system', text: '─────────────────────────────────────' }
  ]);
  const [input, setInput] = useState('');
  const terminalRef = React.useRef(null);

  const commands = {
    help: () => [
      '┌─────────────────────────────────────┐',
      '│ AVAILABLE COMMANDS                  │',
      '├─────────────────────────────────────┤',
      '│ status    - Show system status      │',
      '│ missions  - List active missions    │',
      '│ stats     - Display your stats      │',
      '│ anomalies - List your anomalies     │',
      '│ whoami    - Current user info       │',
      '│ clear     - Clear terminal          │',
      '│ ascii     - Show ASCII art          │',
      '│ matrix    - Matrix rain effect      │',
      '└─────────────────────────────────────┘'
    ],
    status: () => [
      '┌─ SYSTEM STATUS ──────────────────────',
      `│ User: ${user?.name}`,
      `│ Role: ${user?.role}`,
      `│ Tier: ${user?.tier}`,
      '│ Connection: SECURE',
      '│ Uptime: 99.97%',
      '└───────────────────────────────────────'
    ],
    missions: () => [
      '┌─ ACTIVE MISSIONS ─────────────────────',
      ...projects.map(p => `│ [${p.status.toUpperCase().padEnd(5)}] ${p.name} (${p.platform})`),
      `└─ Total: ${projects.length} missions`
    ],
    stats: () => [
      '┌─ YOUR STATISTICS ─────────────────────',
      `│ Vector Points: ${user?.stats.vectorPoints}`,
      `│ Rank: ${user?.stats.rank}`,
      `│ Bugs Submitted: ${user?.stats.bugsSubmitted}`,
      `│ Accuracy: ${user?.stats.accuracy}%`,
      `│ Games Won: ${user?.stats.gamesWon}`,
      '└───────────────────────────────────────'
    ],
    anomalies: () => {
      const userAnomalies = anomalies.filter(a => a.reporterId === user?.id);
      if (userAnomalies.length === 0) return ['No anomalies found.'];
      return [
        '┌─ YOUR ANOMALIES ──────────────────────',
        ...userAnomalies.map(a => `│ [${a.severity.padEnd(8)}] ${a.title.substring(0, 30)}`),
        `└─ Total: ${userAnomalies.length} anomalies`
      ];
    },
    whoami: () => [`${user?.name} <${user?.email}> [${user?.role}]`],
    clear: () => 'CLEAR',
    ascii: () => [
      '    ██████╗ ███████╗████████╗ █████╗ ',
      '    ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗',
      '    ██████╔╝█████╗     ██║   ███████║',
      '    ██╔══██╗██╔══╝     ██║   ██╔══██║',
      '    ██████╔╝███████╗   ██║   ██║  ██║',
      '    ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝',
      '    ███╗   ███╗ █████╗ ██╗  ██╗',
      '    ████╗ ████║██╔══██╗╚██╗██╔╝',
      '    ██╔████╔██║███████║ ╚███╔╝ ',
      '    ██║╚██╔╝██║██╔══██║ ██╔██╗ ',
      '    ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗',
      '    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝'
    ],
    matrix: () => ['Initiating Matrix protocol...', '01001000 01100101 01101100 01101100 01101111']
  };

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const output = commands[trimmed];

    setHistory(prev => [...prev, { type: 'input', text: `> ${cmd}` }]);

    if (output) {
      const result = output();
      if (result === 'CLEAR') {
        setHistory([{ type: 'system', text: 'Terminal cleared.' }]);
      } else {
        setHistory(prev => [...prev, ...result.map(t => ({ type: 'output', text: t }))]);
      }
    } else if (trimmed) {
      setHistory(prev => [...prev, { type: 'error', text: `Command not found: ${cmd}` }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-black text-white tracking-wider mb-1">THE_TERMINAL</h1>
        <p className="text-sm text-slate-500">Power user command interface</p>
      </div>

      <div className="flex-1 cyber-panel rounded-xl overflow-hidden flex flex-col" data-testid="terminal-container">
        {/* Terminal Header */}
        <div className="bg-surface px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-500 ml-4 font-mono">betamax@terminal:~$</span>
        </div>

        {/* Terminal Body */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-auto font-mono text-sm bg-black/50"
        >
          {history.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-1 ${
                line.type === 'input' ? 'text-cyan-400' :
                line.type === 'error' ? 'text-red-400' :
                line.type === 'system' ? 'text-fuchsia-400' :
                'text-green-400'
              }`}
            >
              {line.text}
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 flex items-center gap-2">
          <span className="text-cyan-400 font-mono">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-green-400 font-mono outline-none"
            placeholder="Enter command..."
            autoFocus
            data-testid="terminal-input"
          />
        </form>
      </div>
    </div>
  );
};

// ============== ARCADE (POINTS GAME) ==============

const ArcadePage = () => {
  const { user, spendPoints } = useApp();
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState('');
  const [highScore, setHighScore] = useState(3);

  const ENTRY_COST = 50;
  const WIN_REWARD = 200;
  const MAX_ATTEMPTS = 5;

  const startGame = () => {
    if (user.stats.vectorPoints < ENTRY_COST) {
      setHint('Insufficient Vector Points!');
      return;
    }
    
    if (spendPoints(ENTRY_COST)) {
      setTargetNumber(Math.floor(Math.random() * 100) + 1);
      setGameState('playing');
      setAttempts(0);
      setGuess('');
      setHint('Guess a number between 1 and 100');
    }
  };

  const makeGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setHint('Enter a valid number (1-100)');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (num === targetNumber) {
      setGameState('won');
      setHint(`You won ${WIN_REWARD} Vector Points!`);
      if (newAttempts < highScore) setHighScore(newAttempts);
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setGameState('lost');
      setHint(`Game Over! The number was ${targetNumber}`);
    } else {
      setHint(num < targetNumber ? '↑ Higher!' : '↓ Lower!');
    }
    setGuess('');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wider mb-1">ARCADE</h1>
          <p className="text-sm text-slate-500">Spend Vector Points to play and win more!</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Your Balance</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">{user?.stats.vectorPoints} VP</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Number Guess Game */}
        <motion.div 
          className="cyber-panel rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <Gamepad2 className="w-16 h-16 text-fuchsia-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-white mb-2">Number_Hunter</h2>
            <p className="text-sm text-slate-400">Guess the secret number to win!</p>
          </div>

          <div className="cyber-panel rounded-lg p-6 mb-6 text-center">
            {gameState === 'idle' && (
              <>
                <p className="text-slate-400 mb-4">Entry: {ENTRY_COST} VP | Win: {WIN_REWARD} VP</p>
                <p className="text-xs text-slate-500 mb-4">Best Score: {highScore} attempts</p>
              </>
            )}
            {gameState === 'playing' && (
              <>
                <p className="text-6xl font-display font-bold text-cyan-400 mb-4">?</p>
                <p className="text-sm text-slate-400">Attempts: {attempts}/{MAX_ATTEMPTS}</p>
              </>
            )}
            {gameState === 'won' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-2xl font-bold text-green-400">YOU WIN!</p>
              </motion.div>
            )}
            {gameState === 'lost' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-2xl font-bold text-red-400">GAME OVER</p>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {hint && (
              <motion.p
                key={hint}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`text-center mb-4 font-mono ${
                  gameState === 'won' ? 'text-green-400' :
                  gameState === 'lost' ? 'text-red-400' : 'text-cyan-400'
                }`}
              >
                {hint}
              </motion.p>
            )}
          </AnimatePresence>

          {gameState === 'playing' ? (
            <div className="flex gap-3">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
                placeholder="Your guess..."
                className="cyber-input flex-1"
                min="1"
                max="100"
                data-testid="game-guess-input"
              />
              <motion.button
                onClick={makeGuess}
                className="cyber-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="submit-guess-btn"
              >
                Guess
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={startGame}
              className="cyber-button fuchsia w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="start-game-btn"
            >
              <Play className="w-4 h-4 mr-2 inline" />
              {gameState === 'idle' ? 'Start Game' : 'Play Again'} ({ENTRY_COST} VP)
            </motion.button>
          )}
        </motion.div>

        {/* Leaderboard / Stats */}
        <motion.div 
          className="cyber-panel rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-display font-bold text-white">Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'CyberSarah', points: 8500, badge: '🥇' },
              { rank: 2, name: 'Neo_Runner', points: 4250, badge: '🥈' },
              { rank: 3, name: 'ByteHunter', points: 3800, badge: '🥉' },
              { rank: 4, name: 'GlitchMaster', points: 2100, badge: '' },
              { rank: 5, name: 'VectorX', points: 1500, badge: '' },
            ].map((player) => (
              <motion.div
                key={player.rank}
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  player.name === user?.name ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5'
                }`}
              >
                <span className="text-lg w-8 text-center">{player.badge || player.rank}</span>
                <span className="flex-1 text-white font-medium">{player.name}</span>
                <span className="text-amber-400 font-mono">{player.points.toLocaleString()} VP</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Arcade Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-fuchsia-400">{user?.stats.gamesWon}</p>
                <p className="text-xs text-slate-500">Games Won</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{highScore}</p>
                <p className="text-xs text-slate-500">Best Score</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============== MAIN LAYOUT ==============

const MainLayout = ({ children, currentView }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="crt-overlay" />
      <Sidebar currentView={currentView} />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ============== APP ROUTER ==============

const AppContent = () => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <AuthScreen />;
  }

  const getView = (path) => {
    if (path === '/') return 'dashboard';
    if (path.startsWith('/mission')) return 'missions';
    if (path === '/missions') return 'missions';
    if (path === '/external') return 'external';
    if (path === '/terminal') return 'terminal';
    if (path === '/arcade') return 'arcade';
    if (path === '/report') return 'dashboard';
    return 'dashboard';
  };

  return (
    <MainLayout currentView={getView(location.pathname)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/mission/:id" element={<MissionDetail />} />
        <Route path="/report" element={<ReportAnomaly />} />
        <Route path="/external" element={<ExternalBetasPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="/arcade" element={<ArcadePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainLayout>
  );
};

// ============== EXPORT ==============

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
