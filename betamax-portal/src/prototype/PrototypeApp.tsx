import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Project, FeedbackItem, User, ProjectVersion } from './types';

// --- MOCK DATA GENERATORS ---

const MOCK_USERS: User[] = [
    {
        id: "u1",
        name: "Alex Dev",
        email: "alex@test.com",
        role: "tester",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        stats: { vectorPoints: 4250, rank: "Bug Hunter II", bugsSubmitted: 42, earningsUsd: 1250, accuracy: 94 }
    },
    {
        id: "u2",
        name: "Sarah Admin",
        email: "sarah@betamax.com",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        stats: { vectorPoints: 9999, rank: "Admin", bugsSubmitted: 0, earningsUsd: 0, accuracy: 100 }
    }
];

const INITIAL_PROJECTS: Project[] = [
    {
        id: "p1",
        name: "Neon Wallet",
        description: "Next-gen crypto wallet with biometric auth and social recovery features.",
        versions: [
            { version: "4.2.0-beta", releaseDate: "2023-10-24", isCurrent: true, changelog: ["Added biometric login flow", "Fixed crash on transaction history"] },
            { version: "4.1.5-alpha", releaseDate: "2023-10-10", isCurrent: false, changelog: ["Initial UI setup", "Wallet creation flow"] }
        ],
        status: "Beta",
        platform: "Android 14+",
        payout: 50,
        imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
        features: ["Biometric Login", "P2P Transfer", "Cold Storage Vault"]
    },
    {
        id: "p2",
        name: "Titan OS Kernel",
        description: "Low-level kernel optimization for embedded systems.",
        versions: [
             { version: "0.9.1-alpha", releaseDate: "2023-10-25", isCurrent: true, changelog: ["Memory leak fix in scheduler", "New driver support for ARM64"] }
        ],
        status: "Alpha",
        platform: "Linux / ARM64",
        payout: 120,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        features: ["Memory Management", "Process Scheduling", "Hardware Abstraction"]
    }
];

const INITIAL_FEEDBACK: FeedbackItem[] = [
    { 
        id: "fb-1", 
        type: 'Bug',
        title: "Crash on launch when offline", 
        description: "The app immediately closes if I launch it without wifi.",
        severity: "Critical", 
        status: "Open", 
        projectId: "p1", 
        projectName: "Neon Wallet",
        version: "4.2.0-beta",
        reporterId: "u1",
        reporterName: "Alex Dev",
        timestamp: new Date(Date.now() - 7200000).toISOString()
    }
];

// --- CONTEXTS ---

interface AppContextType {
    user: User | null;
    login: (email: string) => boolean;
    logout: () => void;
    projects: Project[];
    feedback: FeedbackItem[];
    addFeedback: (item: Omit<FeedbackItem, 'id' | 'timestamp' | 'reporterId' | 'reporterName' | 'status'>) => void;
    addVersion: (projectId: string, version: string, changelog: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
    // SECURITY: Default to null (logged out) to prevent unauthorized access.
    // Previous bypass (defaulting to MOCK_USERS[0]) removed to enforce authentication.
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [feedback, setFeedback] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);

    const login = useCallback((email: string) => {
        // SECURITY: Strict email validation against mock users.
        const found = MOCK_USERS.find(u => u.email === email);
        if (found) {
            setUser(found);
            return true;
        } else {
            console.warn(`Security: Login failed for ${email}. Email not found in allowed mock users.`);
            // Intentionally do not set user if not found, keeping them on AuthScreen.
            return false;
        }
    }, []);

    const logout = useCallback(() => setUser(null), []);

    const addFeedback = useCallback((item: Omit<FeedbackItem, 'id' | 'timestamp' | 'reporterId' | 'reporterName' | 'status'>) => {
        if (!user) return;
        const newItem: FeedbackItem = {
            ...item,
            id: `fb-${Date.now()}`,
            timestamp: new Date().toISOString(),
            reporterId: user.id,
            reporterName: user.name,
            status: 'Open'
        };
        setFeedback(prev => [newItem, ...prev]);
    }, [user]);

    const addVersion = useCallback((projectId: string, versionStr: string, changelogStr: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            
            // Set all old versions to not current
            const oldVersions = p.versions.map(v => ({...v, isCurrent: false}));
            
            const newVersion: ProjectVersion = {
                version: versionStr,
                releaseDate: new Date().toISOString().split('T')[0],
                changelog: changelogStr.split('\n').filter(Boolean),
                isCurrent: true
            };
            
            return {
                ...p,
                versions: [newVersion, ...oldVersions]
            };
        }));
    }, []);

    // Optimized: Memoize context value to prevent unnecessary re-renders in consumers
    const value = useMemo(() => ({
        user, login, logout, projects, feedback, addFeedback, addVersion
    }), [user, login, logout, projects, feedback, addFeedback, addVersion]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};

// --- ICONS ---
// Optimized: Memoized to prevent re-renders in lists
const Icon = React.memo(({ name, className = "" }: { name: string; className?: string }) => (
    <span className={`material-symbols-outlined select-none ${className}`} aria-hidden="true">{name}</span>
));

// --- UTILS ---

// Optimized: Helper to request appropriate image size from CDN (Unsplash specific)
const getOptimizedImageUrl = (url: string, width: number) => {
    if (!url) return "";
    try {
        if (url.includes('images.unsplash.com')) {
            const u = new URL(url);
            u.searchParams.set('w', width.toString());
            return u.toString();
        }
    } catch (e) {
        // Fallback to original URL
    }
    return url;
};

// --- SHARED COMPONENTS ---

// Optimized: Static styles moved outside component to prevent recreation
const STATUS_STYLES: Record<string, string> = {
    // Status
    Alpha: "bg-red-500/10 text-red-500 border-red-500/20",
    Beta: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    RC: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Live: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    // Feedback Status
    Open: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "In Review": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Resolved: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    // Severity
    Critical: "bg-red-500 text-white border-red-600",
    High: "bg-orange-500 text-white border-orange-600",
    Medium: "bg-yellow-500 text-black border-yellow-600",
    Low: "bg-blue-500 text-white border-blue-600",
};

// Optimized: Memoized to prevent re-renders in project/feedback lists
const StatusBadge = React.memo(({ status, type = 'status' }: { status: string, type?: 'status' | 'severity' }) => {
    // Fallback style
    const defaultStyle = "bg-gray-800 text-gray-400 border-gray-700";

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${STATUS_STYLES[status] || defaultStyle}`}>
            {status}
        </span>
    );
});

// --- AUTH SCREENS ---

const AuthScreen = () => {
    const { login } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const success = login(email);
        if (!success) {
            setError("Invalid credentials. Access restricted to authorized beta testers.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0))]"></div>
            
            <div className="w-full max-w-sm bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Icon name="bug_report" className="text-white text-2xl" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-white text-center mb-2">Beta Max</h1>
                <p className="text-zinc-500 text-center text-sm mb-8">Professional Beta Testing Platform</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                            <Icon name="error" className="text-red-500 text-lg" />
                            <p className="text-red-500 text-xs font-bold">{error}</p>
                        </div>
                    )}
                    {!isLogin && (
                        <div>
                            <label htmlFor="auth-name" className="block text-xs font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                            <input
                                id="auth-name"
                                type="text"
                                className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="auth-email" className="block text-xs font-bold text-zinc-400 uppercase mb-1">Email Address</label>
                        <input 
                            id="auth-email"
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary transition-colors" 
                            placeholder="name@company.com" 
                        />
                    </div>
                    <div>
                        <label htmlFor="auth-password" className="block text-xs font-bold text-zinc-400 uppercase mb-1">Password</label>
                        <input 
                            id="auth-password"
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary transition-colors" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <button type="submit" className="mt-2 w-full bg-primary hover:bg-primaryDark text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/25">
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-zinc-500 text-xs">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-bold">
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- APP SCREENS ---

// Optimized: Memoized to prevent re-renders when parent re-renders
const ProjectCard = React.memo(({ project }: { project: Project }) => {
    const navigate = useNavigate();
    const currentVer = project.versions.find(v => v.isCurrent);

    return (
        <button
            onClick={() => navigate(`/project/${project.id}`)}
            className="w-full text-left group bg-surface border border-white/5 rounded-xl p-1 hover:border-white/20 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4 p-3">
                {/* Optimized: Load smaller image (100px) for 48px display to save bandwidth */}
                <img
                    src={getOptimizedImageUrl(project.imageUrl, 100)}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                    alt=""
                    loading="lazy"
                />
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={project.status} />
                        <span className="text-[10px] text-zinc-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">v{currentVer?.version}</span>
                    </div>
                </div>
                <Icon name="chevron_right" className="text-zinc-600" />
            </div>
        </button>
    );
});

// Optimized: Memoized to prevent re-renders
const RecentFeedbackItem = React.memo(({ item }: { item: FeedbackItem }) => (
    <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.type === 'Bug' ? 'bg-danger' : 'bg-accent'}`}></span>
                <span className="text-xs font-bold text-zinc-400 uppercase">{item.type}</span>
            </div>
            <StatusBadge status={item.status} />
        </div>
        <h4 className="text-sm font-medium text-white">{item.title}</h4>
        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1">
            <span>{item.projectName} • v{item.version}</span>
            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
    </div>
));

// Optimized: Memoized to prevent re-renders in ProjectDetail list
const ProjectFeedbackItem = React.memo(({ item }: { item: FeedbackItem }) => (
    <div className="bg-surface border border-white/5 rounded-xl p-4 transition-all">
        <div className="flex items-start justify-between mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.type === 'Bug' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{item.type}</span>
            <span className="text-[10px] text-zinc-600 font-mono">v{item.version}</span>
        </div>
        <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
        <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-700 overflow-hidden">
                    {/* Ideally user avatar */}
                </div>
                <span className="text-[10px] text-zinc-400">{item.reporterName}</span>
            </div>
            <StatusBadge status={item.status} />
        </div>
    </div>
));

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, projects, feedback } = useApp();

    // Optimized: Memoize derived array to avoid recalculation on every render
    const myFeedback = useMemo(() => feedback.filter(f => f.reporterId === user?.id), [feedback, user?.id]);

    return (
        <div className="flex flex-col min-h-screen pb-24 font-sans bg-background">
            <header className="px-6 py-6 flex justify-between items-center bg-surface/30 backdrop-blur-sm sticky top-0 z-20 border-b border-white/5">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 text-xs">Welcome back, {user?.name.split(' ')[0]}</p>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full border border-white/10 overflow-hidden cursor-pointer bg-surfaceHighlight hover:border-primary/50 transition-colors"
                    aria-label="Go to profile"
                >
                    <img src={user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                </button>
            </header>

            <main className="px-6 py-6 flex flex-col gap-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                         <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Icon name="bug_report" className="text-xl" />
                            <span className="text-xs font-bold uppercase">Reports</span>
                         </div>
                         <span className="text-3xl font-bold text-white">{myFeedback.length}</span>
                    </div>
                    <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                         <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Icon name="payments" className="text-xl" />
                            <span className="text-xs font-bold uppercase">Earnings</span>
                         </div>
                         <span className="text-3xl font-bold text-success">${user?.stats.earningsUsd}</span>
                    </div>
                </div>

                {/* Active Projects */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Assigned Projects</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {projects.map(p => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Your Recent Feedback</h2>
                    <div className="flex flex-col gap-3">
                        {myFeedback.length === 0 ? (
                            <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-white/5 rounded-xl">
                                No feedback submitted yet.
                            </div>
                        ) : myFeedback.slice(0, 5).map(item => (
                            <RecentFeedbackItem key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

const ProjectDetail = () => {
    const { id } = useParams(); // Should be from route
    const navigate = useNavigate();
    const { projects, user, feedback, addVersion } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'changelog' | 'feedback'>('overview');
    
    // Find project based on ID from URL or mock
    // Optimization: Memoize derived project data to prevent recalculation on tab switches
    const project = useMemo(() => projects.find(p => p.id === (id || 'p1')) || projects[0], [projects, id]);
    const projectFeedback = useMemo(() => feedback.filter(f => f.projectId === project.id), [feedback, project.id]);
    const currentVersion = useMemo(() => project.versions.find(v => v.isCurrent), [project]);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="relative h-48 bg-zinc-900">
                <img src={project.imageUrl} className="w-full h-full object-cover opacity-40" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        aria-label="Go back"
                    >
                        <Icon name="arrow_back" />
                    </button>
                    {user?.role === 'admin' && <button className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold border border-primary/30">Admin Mode</button>}
                </div>
                <div className="absolute bottom-4 left-6">
                    <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="font-mono text-primary font-bold">v{currentVersion?.version}</span>
                        <span>•</span>
                        <span>{project.platform}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 px-6 sticky top-0 bg-background/95 backdrop-blur z-20">
                {['overview', 'changelog', 'feedback'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-4 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="px-6 py-6 animate-fade-in">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="bg-surface border border-white/5 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Description</h3>
                            <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Testing Scope</h3>
                            <div className="space-y-2">
                                {project.features.map(f => (
                                    <div key={f} className="flex items-center gap-3 p-3 bg-surface border border-white/5 rounded-lg">
                                        <Icon name="check_circle" className="text-emerald-500 text-sm" />
                                        <span className="text-sm text-zinc-200">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-primary font-bold uppercase">Bounty Program</p>
                                <p className="text-sm text-zinc-300 mt-1">Earn up to <span className="text-white font-bold">${project.payout}</span> per verified bug.</p>
                            </div>
                            <Icon name="monetization_on" className="text-3xl text-primary" />
                        </div>
                    </div>
                )}

                {activeTab === 'changelog' && (
                    <div className="space-y-8 relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/5"></div>
                        {project.versions.map((ver, idx) => (
                            <div key={ver.version} className="relative pl-10">
                                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${ver.isCurrent ? 'bg-primary' : 'bg-zinc-700'}`}>
                                    {ver.isCurrent && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`text-lg font-bold font-mono ${ver.isCurrent ? 'text-white' : 'text-zinc-500'}`}>{ver.version}</h3>
                                    {ver.isCurrent && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase font-bold">Current</span>}
                                    <span className="text-xs text-zinc-600 ml-auto">{ver.releaseDate}</span>
                                </div>
                                <ul className="space-y-1">
                                    {ver.changelog.map((log, i) => (
                                        <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                                            <span className="text-zinc-600 mt-1.5">•</span>
                                            {log}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase">Community Reports</h3>
                            <span className="text-xs text-zinc-600">{projectFeedback.length} item{projectFeedback.length !== 1 ? 's' : ''}</span>
                        </div>
                        {projectFeedback.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-white/5 rounded-xl bg-surface/30">
                                <Icon name="inbox" className="text-4xl mb-2 opacity-20" />
                                <p className="text-sm font-medium">No community reports yet.</p>
                                <p className="text-xs opacity-60 mt-1">Be the first to spot a bug!</p>
                            </div>
                        ) : projectFeedback.map(item => (
                            <ProjectFeedbackItem key={item.id} item={item} />
                        ))}
                        
                        <button
                            onClick={() => navigate('/feedback/new', { state: { projectId: project.id } })}
                            className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:scale-105 transition-transform z-30"
                            aria-label="Add feedback"
                        >
                            <Icon name="add" className="text-2xl" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Optimized: Memoized to prevent re-renders when other form state changes
const ProjectSelect = React.memo(({
    projects,
    value,
    onChange
}: {
    projects: Project[],
    value: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
    <div>
        <label htmlFor="project-select" className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Project</label>
        <select
            id="project-select"
            value={value}
            onChange={onChange}
            className="w-full bg-surface border border-white/10 rounded-lg text-white text-sm p-3 focus:border-primary"
        >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
    </div>
));

// Optimized: Memoized to prevent re-renders when other form state changes
const VersionSelect = React.memo(({
    versions,
    value,
    onChange
}: {
    versions: ProjectVersion[],
    value: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
    <div>
        <label htmlFor="version-select" className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Version</label>
        <select
            id="version-select"
            value={value}
            onChange={onChange}
            className="w-full bg-surface border border-white/10 rounded-lg text-white text-sm p-3 focus:border-primary"
        >
            {versions.map(v => (
                <option key={v.version} value={v.version}>{v.version} {v.isCurrent ? '(Current)' : ''}</option>
            ))}
        </select>
    </div>
));

// Optimized: Memoized to prevent re-renders when other form state changes (e.g. typing in inputs)
const TypeSelector = React.memo(({ type, onChange }: { type: 'Bug' | 'Suggestion', onChange: (t: 'Bug' | 'Suggestion') => void }) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
        <button
            type="button"
            onClick={() => onChange('Bug')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'Bug' ? 'bg-danger/10 border-danger text-danger' : 'bg-surface border-white/5 text-zinc-500 hover:bg-surfaceHighlight'}`}
        >
            <Icon name="bug_report" className="text-2xl" />
            <span className="text-xs font-bold uppercase">Bug Report</span>
        </button>
        <button
            type="button"
            onClick={() => onChange('Suggestion')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'Suggestion' ? 'bg-accent/10 border-accent text-accent' : 'bg-surface border-white/5 text-zinc-500 hover:bg-surfaceHighlight'}`}
        >
            <Icon name="lightbulb" className="text-2xl" />
            <span className="text-xs font-bold uppercase">Suggestion</span>
        </button>
    </div>
));

// Optimized: Memoized to prevent re-renders when other form state changes
const SeveritySelector = React.memo(({ severity, onChange }: { severity: 'Low' | 'Medium' | 'High' | 'Critical', onChange: (s: 'Low' | 'Medium' | 'High' | 'Critical') => void }) => (
    <div>
        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Severity</label>
        <div className="flex justify-between gap-2">
            {['Low', 'Medium', 'High', 'Critical'].map(lvl => (
                <button
                    key={lvl}
                    type="button"
                    onClick={() => onChange(lvl as any)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${severity === lvl ? 'border-transparent text-white ' + (lvl === 'Critical' ? 'bg-danger' : lvl === 'High' ? 'bg-orange-500' : lvl === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500') : 'bg-surface border-white/10 text-zinc-500'}`}
                >
                    {lvl}
                </button>
            ))}
        </div>
    </div>
));

// Optimized: Memoized attachment uploader to prevent re-renders on text input
const AttachmentUploader = React.memo(({
    hasAttachment,
    onToggle
}: {
    hasAttachment: boolean;
    onToggle: () => void;
}) => (
    <div>
        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Attachments (Optional)</label>
        <button
            type="button"
            onClick={onToggle}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none group ${hasAttachment ? 'border-primary/50 bg-primary/5 text-primary' : 'border-white/10 text-zinc-500 hover:border-white/20 hover:bg-white/5'}`}
            aria-label={hasAttachment ? "Remove attachment debug_log.txt" : "Upload attachment"}
        >
            <Icon name={hasAttachment ? "check_circle" : "cloud_upload"} className={`text-3xl mb-2 transition-colors ${hasAttachment ? 'text-primary' : 'group-hover:text-primary'}`} />
            <span className="text-xs font-medium">{hasAttachment ? "debug_log.txt attached" : "Click to upload image or log file"}</span>
            {hasAttachment && <span className="text-[10px] opacity-70 mt-1">Click to remove</span>}
        </button>
    </div>
));

const FeedbackForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projects, addFeedback } = useApp();
    
    // Initial state setup based on location state (entry point)
    const preSelectedProjectId = location.state?.projectId || projects[0].id;
    const [projectId, setProjectId] = useState(preSelectedProjectId);
    const [type, setType] = useState<'Bug' | 'Suggestion'>('Bug');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
    const [version, setVersion] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]); // Mock logic

    const isValid = title.trim().length > 0 && description.trim().length > 0;

    // Optimized: Stable handler for attachment toggle
    const toggleAttachment = useCallback(() => {
        setAttachments(prev => prev.length ? [] : ['debug_log.txt']);
    }, []);

    // Optimized: Stable handlers for selectors to prevent re-renders in child components
    const handleProjectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setProjectId(e.target.value);
    }, []);

    const handleVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setVersion(e.target.value);
    }, []);

    const project = projects.find(p => p.id === projectId) || projects[0];
    
    useEffect(() => {
        // Set default version to current version of selected project
        const current = project.versions.find(v => v.isCurrent);
        if (current) setVersion(current.version);
    }, [project]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        addFeedback({
            type,
            title,
            description,
            severity: type === 'Bug' ? severity : undefined,
            projectId: project.id,
            projectName: project.name,
            version,
            attachments
        });
        navigate(-1);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-12">
            <header className="px-6 py-4 bg-surface border-b border-white/5 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-zinc-400 text-sm hover:text-white transition-colors">Cancel</button>
                <h1 className="text-white font-bold text-sm uppercase tracking-wider">Submit Feedback</h1>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="text-primary font-bold text-sm hover:text-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-primary"
                >
                    Post
                </button>
            </header>

            <main className="px-6 py-6 max-w-lg mx-auto w-full">
                {/* Type Selection */}
                <TypeSelector type={type} onChange={setType} />

                <div className="space-y-6">
                    {/* Project & Version */}
                    <div className="grid grid-cols-2 gap-4">
                        <ProjectSelect projects={projects} value={projectId} onChange={handleProjectChange} />
                        <VersionSelect versions={project.versions} value={version} onChange={handleVersionChange} />
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title-input" className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Title</label>
                        <input 
                            id="title-input"
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={type === 'Bug' ? "e.g. App crashes on login" : "e.g. Add dark mode toggle"}
                            className="w-full bg-surface border border-white/10 rounded-lg text-white text-sm p-3 placeholder-zinc-600 focus:border-primary" 
                        />
                    </div>

                    {/* Severity (Bug Only) */}
                    {type === 'Bug' && <SeveritySelector severity={severity} onChange={setSeverity} />}

                    {/* Description */}
                    <div>
                        <label htmlFor="description-input" className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Description / Steps</label>
                        <textarea 
                            id="description-input"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed explanation..."
                            className="w-full bg-surface border border-white/10 rounded-lg text-white text-sm p-3 placeholder-zinc-600 focus:border-primary font-mono"
                        />
                    </div>

                    {/* Mock Attachments */}
                    <AttachmentUploader
                        hasAttachment={attachments.length > 0}
                        onToggle={toggleAttachment}
                    />
                </div>
            </main>
        </div>
    );
};

const Profile = () => {
    const { user, logout } = useApp();
    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 px-6 pt-12">
            <div className="flex flex-col items-center mb-10">
                <div className="w-28 h-28 rounded-full border-4 border-surfaceHighlight p-1 mb-4 relative shadow-2xl">
                    <img src={user?.avatar} className="w-full h-full object-cover rounded-full" alt="User" />
                    <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-4 border-background flex items-center justify-center">
                        <Icon name="verified" className="text-sm" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-zinc-400 text-sm font-mono mt-1">{user?.role} • {user?.stats.rank}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface border border-white/5 rounded-xl p-5 text-center">
                    <span className="block text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Lifetime Earnings</span>
                    <span className="text-2xl font-mono font-bold text-white">${user?.stats.earningsUsd}</span>
                </div>
                <div className="bg-surface border border-white/5 rounded-xl p-5 text-center">
                    <span className="block text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Accuracy Score</span>
                    <span className="text-2xl font-mono font-bold text-success">{user?.stats.accuracy}%</span>
                </div>
            </div>

            <div className="space-y-3">
                 <button className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5 hover:border-white/20 hover:bg-surfaceHighlight transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Icon name="settings" className="text-lg" />
                        </div>
                        <span className="text-sm font-medium text-white">Account Settings</span>
                    </div>
                    <Icon name="chevron_right" className="text-zinc-600" />
                </button>
                <button onClick={logout} className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 group transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <Icon name="logout" className="text-lg" />
                        </div>
                        <span className="text-sm font-medium text-red-500 group-hover:text-red-400">Sign Out</span>
                    </div>
                </button>
            </div>
            
            <div className="mt-auto text-center py-6">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Beta Max Platform v3.0</p>
            </div>
        </div>
    );
};

interface NavItemProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
    <button
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-16 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
        <Icon name={icon} className={`text-2xl transition-transform duration-200 group-hover:scale-110 ${isActive ? 'font-bold scale-110' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
);

const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Hide bottom nav on specific pages
    if (['/feedback/new'].includes(location.pathname)) {
        return <>{children}</>;
    }

    const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <>
            {children}
            <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
                <nav className="pointer-events-auto bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center px-6 py-3 max-w-md mx-auto">
                    <NavItem
                        path="/"
                        icon="dashboard"
                        label="Home"
                        isActive={isActive('/')}
                        onClick={() => navigate('/')}
                    />
                    
                    <button 
                        onClick={() => navigate('/feedback/new')} 
                        className="relative -top-8 bg-primary hover:bg-primaryDark text-white w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(59,130,246,0.4)] border-4 border-background flex items-center justify-center transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label="Add feedback"
                    >
                        <Icon name="add" className="text-3xl" />
                    </button>

                    <NavItem
                        path="/profile"
                        icon="person"
                        label="Profile"
                        isActive={isActive('/profile')}
                        onClick={() => navigate('/profile')}
                    />
                </nav>
            </div>
        </>
    );
};

// --- ROOT COMPONENT ---

const AppContent = () => {
    const { user } = useApp();

    if (!user) {
        return <AuthScreen />;
    }

    return (
        <NavigationWrapper>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/feedback/new" element={<FeedbackForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </NavigationWrapper>
    );
};

const PrototypeApp = () => {
    return (
        <AppProvider>
            <div className="max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden bg-background">
                <AppContent />
            </div>
        </AppProvider>
    );
};

export default PrototypeApp;
