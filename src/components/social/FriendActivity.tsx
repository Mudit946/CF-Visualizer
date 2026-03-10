import { useState, useEffect } from 'react';
import { type Submission, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Activity, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function FriendActivity() {
    const [rivals] = useLocalStorage<string[]>('rival-handles', []);
    const [activities, setActivities] = useState<(Submission & { userHandle: string })[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rivals.length > 0) {
            fetchActivities();
        }
    }, [rivals]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const allSubs = await Promise.all(
                rivals.map(async (handle) => {
                    const subs = await codeforcesAPI.getUserStatus(handle, 1, 5);
                    return subs.map(s => ({ ...s, userHandle: handle }));
                })
            );

            const unified = allSubs.flat().sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
            setActivities(unified.slice(0, 15));
        } catch (err) {
            console.error("Failed to fetch activities:", err);
        } finally {
            setLoading(false);
        }
    };

    if (rivals.length === 0) return null;

    return (
        <Card className="border-cf-border/50 bg-cf-card/30 backdrop-blur-xl h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cf-accent" />
                        Live Feed
                    </div>
                    {loading && <div className="w-4 h-4 rounded-full border-2 border-cf-accent border-t-transparent animate-spin" />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((sub, idx) => (
                        <div key={`${sub.id}-${idx}`} className="flex items-start gap-3 group">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${sub.verdict === 'OK' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <span className="text-xs font-bold text-white truncate">{sub.userHandle}</span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(sub.creationTimeSeconds * 1000), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5 group-hover:text-gray-300 transition-colors">
                                    {sub.verdict === 'OK' ? 'Solved' : 'Attempted'} <span className="text-cf-accent font-medium">{sub.problem.name}</span>
                                </p>
                            </div>
                            <a
                                href={`https://codeforces.com/contest/${sub.problem.contestId}/submission/${sub.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-cf-accent/10 rounded overflow-hidden"
                            >
                                <ExternalLink className="w-3 h-3 text-cf-accent" />
                            </a>
                        </div>
                    ))}

                    {activities.length === 0 && !loading && (
                        <p className="text-center text-xs text-gray-500 py-8">No recent activity detected</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
