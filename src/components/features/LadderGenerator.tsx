import { useState, type ChangeEvent } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Play, RefreshCw, Layers } from 'lucide-react';
import { ProblemCard } from './ProblemCard';

interface LadderGeneratorProps {
    user: UserData;
    submissions: Submission[];
}

export function LadderGenerator({ user, submissions }: LadderGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [ladder, setLadder] = useState<Problem[]>([]);
    const [startRating, setStartRating] = useState<string>((user.rating || 1200).toString());
    const [length, setLength] = useState<number>(5);
    const [tag, setTag] = useState<string>('');

    const generateLadder = async () => {
        try {
            setLoading(true);
            const allProblems = await codeforcesAPI.getProblems();

            const solvedIndices = new Set(
                submissions
                    .filter(s => s.verdict === 'OK')
                    .map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            const baseR = parseInt(startRating) || 800;
            const newLadder: Problem[] = [];

            for (let i = 0; i < length; i++) {
                const targetRating = baseR + (i * 100);
                const candidates = allProblems.filter((p: Problem) =>
                    p.rating === targetRating &&
                    !solvedIndices.has(`${p.contestId}-${p.index}`) &&
                    (tag ? p.tags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase())) : true)
                );

                if (candidates.length > 0) {
                    const randomIndex = Math.floor(Math.random() * candidates.length);
                    newLadder.push(candidates[randomIndex]);
                }
            }

            setLadder(newLadder);
        } catch (error) {
            console.error('Failed to generate ladder:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cf-primary/30 bg-cf-card/50">
            <CardHeader>
                <CardTitle className="text-cf-primary flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Smart Ladder Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold px-1">Start Rating</label>
                        <Input
                            type="number"
                            value={startRating}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setStartRating(e.target.value)}
                            className="h-9 bg-cf-darker/50"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold px-1">Length</label>
                        <Input
                            type="number"
                            value={length}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setLength(parseInt(e.target.value) || 5)}
                            className="h-9 bg-cf-darker/50"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold px-1">Tag (Optional)</label>
                    <Input
                        placeholder="e.g. implementation, math..."
                        value={tag}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTag(e.target.value)}
                        className="h-9 bg-cf-darker/50"
                    />
                </div>
                <Button
                    onClick={generateLadder}
                    disabled={loading}
                    className="w-full bg-cf-primary hover:bg-cf-primary/80 text-white font-bold"
                >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Build Training Ladder
                </Button>

                {ladder.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-cf-border/50">
                        {ladder.map((p, i) => (
                            <div key={`${p.contestId}-${p.index}`} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-cf-darker border border-cf-primary/50 flex items-center justify-center text-[10px] font-bold text-cf-primary">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <ProblemCard problem={p} showEditorial={false} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
