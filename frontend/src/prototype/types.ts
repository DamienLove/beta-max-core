export interface User {
    id: string;
    name: string;
    email: string;
    role: 'tester' | 'admin' | 'developer';
    avatar: string;
    stats: UserStats;
}

export interface UserStats {
    vectorPoints: number;
    rank: string;
    bugsSubmitted: number;
    earningsUsd: number;
    accuracy: number;
}

export interface ProjectVersion {
    version: string;
    releaseDate: string;
    changelog: string[];
    isCurrent: boolean;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    versions: ProjectVersion[];
    status: 'Alpha' | 'Beta' | 'RC' | 'Live';
    platform: string;
    payout: number; // Base payout for bugs
    imageUrl: string;
    features: string[]; // Testing scope
}

export interface FeedbackItem {
    id: string;
    type: 'Bug' | 'Suggestion';
    title: string;
    description: string;
    severity?: 'Low' | 'Medium' | 'High' | 'Critical'; // Only for bugs
    projectId: string;
    projectName: string;
    version: string; // The version being tested
    reporterId: string;
    reporterName: string;
    status: 'Open' | 'In Review' | 'Resolved' | 'Rejected';
    timestamp: string;
    attachments?: string[]; // URLs to images
}