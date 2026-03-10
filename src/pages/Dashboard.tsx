import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { type UserData, type RatingChange, type Submission, codeforcesAPI } from '../lib/api';
import { useTraining } from '../context/TrainingContext';

import { Card, CardContent, cn } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Activity, Trophy, Star, Target, BarChart3, Bookmark, Layers,
    Users, Swords, Flame,
    Eye, EyeOff
} from 'lucide-react';

import { RatingChart } from '../components/charts/RatingChart';
import { HeatmapChart } from '../components/charts/HeatmapChart';
import { DifficultyChart } from '../components/charts/DifficultyChart';
import { TagsChart } from '../components/charts/TagsChart';

import { ContestGenerator } from '../components/tools/ContestGenerator';
import { ContestHistory } from '../components/tools/ContestHistory';
import { UpsolvingHelper } from '../components/tools/UpsolvingHelper';
import { CompareUsers } from '../components/tools/CompareUsers';

import { DailyChallenge } from '../components/features/DailyChallenge';
import { RandomProblem } from '../components/features/RandomProblem';
import { TopicTrainer } from '../components/features/TopicTrainer';
import { LadderGenerator } from '../components/features/LadderGenerator';
import { DifficultyPath } from '../components/features/DifficultyPath';
import { RivalTracker } from '../components/social/RivalTracker';
import { FriendActivity } from '../components/social/FriendActivity';
import { PracticeQueue } from '../components/features/PracticeQueue';
import { BookmarksPage } from '../components/features/BookmarksPage';
import { ProblemNotes } from '../components/features/ProblemNotes';

export function Dashboard() {
    const { handle } = useParams<{ handle: string }>();
    const { focusMode, setFocusMode } = useTraining();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [ratingHist, setRatingHist] = useState<RatingChange[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [activeTab, setActiveTab] = useState('analytics');

    useEffect(() => {
        async function fetchData() {
            if (!handle) return;
            try {
                setLoading(true);
                setError(null);
                const [userData, ratingData, statusData] = await Promise.all([
                    codeforcesAPI.getUserInfo(handle),
                    codeforcesAPI.getUserRating(handle).catch(() => []),
                    codeforcesAPI.getUserStatus(handle)
                ]);
                setUser(userData[0]);
                setRatingHist(ratingData);
                setSubmissions(statusData);
            } catch (err: any) {
                setError(err.message || 'Failed to load user data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [handle]);

    if (loading) return <DashboardSkeleton />;
    if (error || !user) {
        return (
            <div className="container mx-auto p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-400">Error</h2>
                <p className="text-gray-400">{error || 'User not found'}</p>
            </div>
        );
    }

    const getRankColor = (rank?: string) => {
        if (!rank) return 'text-gray-400';
        const r = rank.toLowerCase();
        if (r.includes('legendary') || r.includes('international grandmaster') || r.includes('grandmaster')) return 'text-[#ff0000]';
        if (r.includes('master')) return 'text-[#ff8c00]';
        if (r.includes('candidate master')) return 'text-[#aa00aa]';
        if (r.includes('expert')) return 'text-[#0000ff]';
        if (r.includes('specialist')) return 'text-[#03a89e]';
        if (r.includes('pupil')) return 'text-[#008000]';
        return 'text-[#808080]';
    };

    const rankColor = getRankColor(user.rank);

    const calculateStreak = () => {
        const solvedDates = new Set(
            submissions
                .filter(s => s.verdict === 'OK')
                .map(s => new Date(s.creationTimeSeconds * 1000).toDateString())
        );
        let currentStreak = 0;
        let today = new Date();
        while (solvedDates.has(today.toDateString())) {
            currentStreak++;
            today.setDate(today.getDate() - 1);
        }
        return currentStreak;
    };

    const currentStreak = calculateStreak();

    const TABS = [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'training', label: 'Training', icon: Target },
        { id: 'contests', label: 'Contests', icon: Swords },
        { id: 'trackers', label: 'Trackers', icon: Layers },
        { id: 'social', label: 'Community', icon: Users },
        { id: 'saved', label: 'Library', icon: Bookmark },
    ] as const;

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card className="overflow-hidden border-cf-border/50 bg-cf-card/30 backdrop-blur-xl">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img
                        src={user.titlePhoto}
                        alt={user.handle}
                        className="w-32 h-32 rounded-xl object-cover border-4 border-cf-darker shadow-2xl"
                    />
                    <div className="flex-1 space-y-4 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                            <div>
                                <h1 className={cn("text-3xl md:text-4xl font-bold tracking-tight", rankColor)}>
                                    {user.handle}
                                </h1>
                                <p className="text-lg text-gray-400 capitalize flex items-center justify-center md:justify-start gap-2 mt-1">
                                    {user.rank || 'Unrated'}
                                    {!focusMode && user.rating && (
                                        <span className="text-sm px-2 py-0.5 rounded-full bg-cf-dark border border-cf-border shadow-inner">
                                            {user.rating}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {currentStreak > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                        <Flame className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold">{currentStreak} day streak</span>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFocusMode(!focusMode)}
                                    className={cn(
                                        "gap-2 border-cf-border/50",
                                        focusMode ? "bg-cf-primary/20 text-cf-primary border-cf-primary/40" : "text-gray-400"
                                    )}
                                >
                                    {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {focusMode ? 'Focus On' : 'Focus Mode'}
                                </Button>
                            </div>
                        </div>

                        {!focusMode && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <Stat icon={<Trophy className="w-4 h-4 text-yellow-500" />} label="Max Rating" value={user.maxRating || '-'} />
                                <Stat icon={<Star className="w-4 h-4 text-cf-primary" />} label="Contributions" value={user.contribution || 0} />
                                <Stat icon={<Activity className="w-4 h-4 text-green-500" />} label="Solved" value={submissions.filter(s => s.verdict === 'OK').length} />
                                <Stat icon={<Users className="w-4 h-4 text-cf-secondary" />} label="Friends" value={user.friendOfCount || 0} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex bg-cf-card/30 p-1 rounded-xl border border-cf-border/50 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-cf-primary text-white shadow-lg shadow-cf-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-cf-card/50"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <RatingChart data={ratingHist} />
                                <HeatmapChart submissions={submissions} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DifficultyChart submissions={submissions} />
                                <TagsChart submissions={submissions} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'training' && (
                        <div className="space-y-6">
                            <DailyChallenge submissions={submissions} user={user} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <RandomProblem submissions={submissions} user={user} />
                                <TopicTrainer submissions={submissions} user={user} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <LadderGenerator submissions={submissions} user={user} />
                                <DifficultyPath submissions={submissions} user={user} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contests' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <ContestGenerator submissions={submissions} />
                            </div>
                            <div className="lg:col-span-1">
                                <ContestHistory ratingHistory={ratingHist} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'trackers' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <UpsolvingHelper submissions={submissions} ratingHistory={ratingHist} />
                            <CompareUsers currentUser={user} />
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <RivalTracker />
                            </div>
                            <div className="lg:col-span-1">
                                <FriendActivity />
                            </div>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1">
                                    <PracticeQueue />
                                </div>
                                <div className="lg:col-span-3">
                                    <BookmarksPage />
                                </div>
                            </div>
                            <ProblemNotes />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function Stat({ icon, label, value }: { icon: ReactNode, label: string, value: string | number }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-cf-darker/50 border border-cf-border/30">
            <div className="p-2 rounded-md bg-cf-dark border border-cf-border/50">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</p>
                <p className="text-lg font-mono font-bold text-white leading-none">{value}</p>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="container mx-auto p-4 space-y-6 animate-pulse">
            <div className="h-48 bg-cf-card/50 rounded-2xl border border-cf-border/50" />
            <div className="h-12 bg-cf-card/30 rounded-xl border border-cf-border/50 w-2/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-cf-card/50 rounded-2xl border border-cf-border/50" />
                <div className="h-80 bg-cf-card/50 rounded-2xl border border-cf-border/50" />
            </div>
        </div>
    );
}
