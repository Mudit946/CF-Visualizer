import { useState, useEffect } from 'react';
import { type UserInfo, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Users, UserMinus, UserPlus, TrendingUp, Award, Target, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function RivalTracker() {
    const [rivals, setRivals] = useLocalStorage<string[]>('rival-handles', []);
    const [rivalData, setRivalData] = useState<UserInfo[]>([]);
    const [newRival, setNewRival] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rivals.length > 0) {
            fetchRivals();
        } else {
            setRivalData([]);
        }
    }, [rivals]);

    const fetchRivals = async () => {
        try {
            const data = await codeforcesAPI.getUserInfo(rivals);
            setRivalData(data);
        } catch (err) {
            console.error("Failed to fetch rivals:", err);
        }
    };

    const addRival = async (e: React.FormEvent) => {
        e.preventDefault();
        const handle = newRival.trim();
        if (!handle) return;
        if (rivals.includes(handle)) {
            setError("Rival already tracked");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await codeforcesAPI.getUserInfo([handle]);
            setRivals([...rivals, handle]);
            setNewRival('');
        } catch (err) {
            setError("User not found");
        } finally {
            setLoading(false);
        }
    };

    const removeRival = (handle: string) => {
        setRivals(rivals.filter(h => h !== handle));
    };

    return (
        <div className="space-y-6">
            <Card className="border-cf-border/50 bg-cf-card/30 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-cf-secondary" />
                        Rival Tracker
                    </CardTitle>
                    <CardDescription>
                        Track and compare your progress with rivals or friends.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addRival} className="flex gap-2">
                        <Input
                            placeholder="Enter handle..."
                            value={newRival}
                            onChange={(e) => setNewRival(e.target.value)}
                            className="bg-cf-dark border-cf-border/50 focus:border-cf-secondary/50"
                        />
                        <Button type="submit" disabled={loading} className="bg-cf-secondary hover:bg-cf-secondary/80">
                            {loading ? '...' : <UserPlus className="w-4 h-4" />}
                        </Button>
                    </form>
                    {error && <p className="text-red-400 text-[10px] mt-2 ml-1">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        {rivalData.map((user) => (
                            <Card key={user.handle} className="bg-cf-darker/50 border-cf-border/30 group hover:border-cf-secondary/40 transition-all duration-300">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-cf-secondary/20 overflow-hidden bg-cf-card">
                                                <img src={user.titlePhoto} alt={user.handle} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm group-hover:text-cf-secondary transition-colors truncate max-w-[100px]">
                                                    {user.handle}
                                                </h4>
                                                <p className="text-[10px] text-cf-secondary font-medium uppercase tracking-wider">
                                                    {user.rank || 'Unrated'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => removeRival(user.handle)}
                                        >
                                            <UserMinus className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-cf-border/20">
                                        <div className="text-center">
                                            <p className="text-[9px] text-gray-500 uppercase">Rating</p>
                                            <p className="font-mono font-bold text-white">{user.rating || '-'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] text-gray-500 uppercase">Max</p>
                                            <p className="font-mono text-xs text-gray-400">+{user.maxRating || '-'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] text-gray-500 uppercase">Contests</p>
                                            <p className="font-mono font-bold text-cf-secondary">42</p> {/* Placeholder for contest count */}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="w-full h-7 text-[10px] border-cf-border/50 hover:bg-cf-secondary/10 hover:text-cf-secondary group/btn" asChild>
                                            <a href={`/dashboard?handle=${user.handle}`}>
                                                View Info
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {rivals.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 opacity-50 border-2 border-dashed border-cf-border/30 rounded-xl">
                                <Target className="w-12 h-12 mb-3" />
                                <p className="text-sm font-medium">No rivals tracked yet</p>
                                <p className="text-xs">Add handles to compare progression</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
