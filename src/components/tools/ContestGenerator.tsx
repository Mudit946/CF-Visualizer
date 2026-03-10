import { useState } from 'react';
import { type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Swords } from 'lucide-react';
import { ContestSimulator } from '../features/ContestSimulator';

interface GeneratorProps {
    submissions: Submission[];
}

interface ContestProblem extends Problem {
    originalIndex?: string | number;
}

export function ContestGenerator({ submissions }: GeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [minRating, setMinRating] = useState('1000');
    const [maxRating, setMaxRating] = useState('1500');
    const [probCount, setProbCount] = useState('4');
    const [contest, setContest] = useState<ContestProblem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);

    const generateContest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const min = parseInt(minRating);
            const max = parseInt(maxRating);
            const count = parseInt(probCount);

            if (min > max) throw new Error("Min rating cannot exceed Max rating");
            if (count < 1 || count > 10) throw new Error("Problem count must be 1-10");

            const { problems } = await codeforcesAPI.getProblemset();

            const solvedSet = new Set(
                submissions.filter(s => s.verdict === 'OK').map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            const candidates = problems.filter(p => {
                if (solvedSet.has(`${p.contestId}-${p.index}`)) return false;
                if (!p.rating || p.rating < min || p.rating > max) return false;
                return true;
            });

            if (candidates.length < count) {
                throw new Error("Not enough problems match these criteria");
            }

            candidates.sort((a, b) => (a.rating || 0) - (b.rating || 0));

            const selected: Problem[] = [];
            const step = Math.floor(candidates.length / count);

            for (let i = 0; i < count; i++) {
                const start = i * step;
                const end = i === count - 1 ? candidates.length : (i + 1) * step;
                const bucket = candidates.slice(start, end);
                const randIndex = Math.floor(Math.random() * bucket.length);
                selected.push(bucket[randIndex]);
            }

            selected.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const finalizedContest = selected.map((p, idx) => ({
                ...p,
                originalIndex: p.index,
                index: letters[idx]
            }));

            setContest(finalizedContest);
        } catch (err: any) {
            setError(err.message || 'Failed to generate contest');
        } finally {
            setLoading(false);
        }
    };

    if (isLive) {
        return (
            <ContestSimulator
                problems={contest}
                onFinish={() => setIsLive(false)}
                durationMinutes={parseInt(probCount) * 30}
            />
        );
    }

    return (
        <Card className="border-cf-border/50 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Swords className="w-5 h-5 text-red-400" />
                    Virtual Mashup
                </CardTitle>
                <CardDescription>
                    Generate a custom practice contest of unsolved problems.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
                <form onSubmit={generateContest} className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Min Rating</label>
                            <Input
                                type="number"
                                value={minRating}
                                onChange={e => setMinRating(e.target.value)}
                                min="800" max="3500" step="100"
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium">Max Rating</label>
                            <Input
                                type="number"
                                value={maxRating}
                                onChange={e => setMaxRating(e.target.value)}
                                min="800" max="3500" step="100"
                                className="h-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 font-medium">Number of Problems</label>
                        <Input
                            type="number"
                            value={probCount}
                            onChange={e => setProbCount(e.target.value)}
                            min="1" max="10"
                            className="h-9"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Generating...' : 'Create Mashup'}
                    </Button>
                    {error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
                </form>

                {loading && (
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                )}

                {!loading && contest.length > 0 && (
                    <div className="space-y-4 border-t border-cf-border/50 pt-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-300">Generated Contest</h4>
                            <Button
                                size="sm"
                                className="bg-cf-primary hover:bg-cf-primary/80 font-bold"
                                onClick={() => setIsLive(true)}
                            >
                                Start Simulator
                            </Button>
                        </div>
                        <div className="space-y-2 flex-1">
                            {contest.map(prob => (
                                <div
                                    key={`${prob.contestId}-${prob.index}`}
                                    className="group flex justify-between items-center p-2.5 rounded border border-transparent bg-cf-darker hover:border-cf-border hover:bg-cf-card transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-cf-primary">{prob.index}</span>
                                        <span className="font-medium text-sm text-gray-200 truncate max-w-[150px] md:max-w-[200px]">
                                            {prob.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-mono text-[#ffc658]">
                                        *{prob.rating}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
