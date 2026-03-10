import { useState } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Shuffle, Search } from 'lucide-react';
import { ProblemCard } from './ProblemCard';

interface RandomProblemProps {
    user: UserData;
    submissions: Submission[];
}

export function RandomProblem({ user, submissions }: RandomProblemProps) {
    const [loading, setLoading] = useState(false);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [minRating, setMinRating] = useState<string>(((user.rating || 1200) - 100).toString());
    const [maxRating, setMaxRating] = useState<string>(((user.rating || 1200) + 300).toString());
    const [tag, setTag] = useState<string>('');

    const generateRandom = async () => {
        try {
            setLoading(true);
            const allProblems = await codeforcesAPI.getProblems();

            const solvedIndices = new Set(
                submissions
                    .filter(s => s.verdict === 'OK')
                    .map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            const minR = parseInt(minRating) || 0;
            const maxR = parseInt(maxRating) || 4000;

            const candidates = allProblems.filter(p => {
                const matchesRating = p.rating ? (p.rating >= minR && p.rating <= maxR) : true;
                const matchesTag = tag ? p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())) : true;
                const isNew = !solvedIndices.has(`${p.contestId}-${p.index}`);
                return matchesRating && matchesTag && isNew;
            });

            if (candidates.length > 0) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                setProblem(candidates[randomIndex]);
            } else {
                setProblem(null);
            }
        } catch (error) {
            console.error('Failed to generate random problem:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cf-accent/30 bg-cf-accent/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-cf-accent flex items-center gap-2">
                    <Shuffle className="w-5 h-5" />
                    Random Problem Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Min Rating</label>
                        <Input
                            type="number"
                            value={minRating}
                            onChange={e => setMinRating(e.target.value)}
                            className="h-9 bg-cf-darker/50"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Max Rating</label>
                        <Input
                            type="number"
                            value={maxRating}
                            onChange={e => setMaxRating(e.target.value)}
                            className="h-9 bg-cf-darker/50"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Tag Filter (Optional)</label>
                    <div className="relative">
                        <Input
                            placeholder="e.g. dp, graphs..."
                            value={tag}
                            onChange={e => setTag(e.target.value)}
                            className="h-9 bg-cf-darker/50 pl-8"
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                </div>
                <Button
                    onClick={generateRandom}
                    disabled={loading}
                    className="w-full bg-cf-accent hover:bg-cf-accent/80 text-white font-bold"
                >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shuffle className="w-4 h-4 mr-2" />}
                    Feeling Lucky
                </Button>

                {problem && (
                    <div className="pt-4 mt-4 border-t border-cf-accent/10">
                        <ProblemCard problem={problem} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Add RefreshCw since it's used in the button
import { RefreshCw } from 'lucide-react';
