import { useState } from 'react';
import { type UserData, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Search, Info } from 'lucide-react';

interface CompareProps {
    currentUser: UserData;
}

export function CompareUsers({ currentUser }: CompareProps) {
    const [handle, setHandle] = useState('');
    const [targetUser, setTargetUser] = useState<UserData | null>(null);
    // Removed targetContests
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const userData = await codeforcesAPI.getUserInfo(handle);
            setTargetUser(userData[0]);
        } catch (err: any) {
            setError(err.message || 'User not found');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <Card className="border-cf-border/50 h-full flex flex-col bg-gradient-to-br from-cf-dark to-cf-darker">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" />
                    Compare Profiles
                </CardTitle>
                <CardDescription>
                    Search for another user to compare statistics.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
                <form onSubmit={handleCompare} className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="Enter handle..."
                            className="pl-9 h-10 bg-cf-darker/50"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="h-10">
                        Compare
                    </Button>
                </form>

                {loading && (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                {!loading && targetUser && (
                    <div className="flex-1 border border-cf-border/50 rounded-lg overflow-hidden bg-cf-card/30">
                        <div className="grid grid-cols-3 bg-cf-darker border-b border-cf-border/50 p-3 text-center text-sm font-semibold text-gray-400">
                            <div className="truncate px-1" style={{ color: getRankColor(currentUser.rank) }}>{currentUser.handle}</div>
                            <div className="text-gray-500 text-xs flex items-center justify-center uppercase tracking-wider">Metric</div>
                            <div className="truncate px-1" style={{ color: getRankColor(targetUser.rank) }}>{targetUser.handle}</div>
                        </div>

                        <ComparisonRow
                            label="Rating"
                            val1={currentUser.rating || 0}
                            val2={targetUser.rating || 0}
                        />
                        <ComparisonRow
                            label="Max Rating"
                            val1={currentUser.maxRating || 0}
                            val2={targetUser.maxRating || 0}
                        />
                        <ComparisonRow
                            label="Contribution"
                            val1={currentUser.contribution || 0}
                            val2={targetUser.contribution || 0}
                        />
                        <ComparisonRow
                            label="Followers"
                            val1={currentUser.friendOfCount || 0}
                            val2={targetUser.friendOfCount || 0}
                        />
                    </div>
                )}

                {!loading && !targetUser && (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center">
                        Compare your current rating, max rating, and contribution with friends or rivals.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ComparisonRow({ label, val1, val2 }: { label: string, val1: number, val2: number }) {
    const isV1Winner = val1 > val2;
    const isV2Winner = val2 > val1;

    return (
        <div className="grid grid-cols-3 border-b border-cf-border/20 last:border-0 p-3 text-center text-sm items-center hover:bg-cf-card/50 transition-colors">
            <div className={`font-bold ${isV1Winner ? 'text-[#39d353]' : 'text-gray-300'}`}>
                {val1}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase">{label}</div>
            <div className={`font-bold ${isV2Winner ? 'text-[#39d353]' : 'text-gray-300'}`}>
                {val2}
            </div>
        </div>
    );
}
