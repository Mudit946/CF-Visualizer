import { useState, useEffect, useMemo } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ProblemCard } from './ProblemCard';
import { Calendar, RefreshCw, CheckCircle2, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface DailyChallengeProps {
    user: UserData;
    submissions: Submission[];
}

export function DailyChallenge({ user, submissions }: DailyChallengeProps) {
    const [dailyProblems, setDailyProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDailyChallenge = async () => {
        try {
            setLoading(true);
            const allProblems = await codeforcesAPI.getProblems();

            const rating = user.rating || 1200;
            const minRating = Math.max(800, rating - 200);
            const maxRating = rating + 200;

            const candidates = allProblems.filter((p: Problem) =>
                p.rating &&
                p.rating >= minRating &&
                p.rating <= maxRating
            );

            if (candidates.length > 0) {
                // Determine number of problems based on rating
                // 1200: 4, 2000: 5
                const goalCount = rating < 1600 ? 4 : 5;
                
                // Use a semi-deterministic random based on current date
                const today = new Date().toDateString();
                let hash = 0;
                for (let i = 0; i < today.length; i++) {
                    hash = today.charCodeAt(i) + ((hash << 5) - hash);
                }
                
                const selected: Problem[] = [];
                const tempCandidates = [...candidates];
                for (let i = 0; i < goalCount && tempCandidates.length > 0; i++) {
                    const index = Math.abs(hash + i) % tempCandidates.length;
                    selected.push(tempCandidates.splice(index, 1)[0]);
                }
                setDailyProblems(selected);
            }
        } catch (error) {
            console.error('Failed to fetch daily challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyChallenge();
    }, [user.handle]);

    const solvedIndices = useMemo(() => new Set(
        submissions
            .filter(s => s.verdict === 'OK')
            .map(s => `${s.problem.contestId}-${s.problem.index}`)
    ), [submissions]);

    const solvedCount = dailyProblems.filter(p => solvedIndices.has(`${p.contestId}-${p.index}`)).length;
    const progress = dailyProblems.length > 0 ? (solvedCount / dailyProblems.length) * 100 : 0;
    const isCompleted = dailyProblems.length > 0 && solvedCount === dailyProblems.length;

    return (
        <Card className={cn(
            "border-cf-primary/30 transition-all duration-500",
            isCompleted ? "bg-green-500/10 border-green-500/40" : "bg-cf-primary/5"
        )}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className={cn("flex items-center gap-2", isCompleted ? "text-green-400" : "text-cf-primary")}>
                        {isCompleted ? <Trophy className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        Daily Training Goal
                    </CardTitle>
                    <p className="text-[10px] text-gray-500 font-mono">
                        Target: {user.rating ? `${user.rating - 200}-${user.rating + 200}` : '800-1400'} Difficulty
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchDailyChallenge}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs font-bold">
                        <span className={isCompleted ? "text-green-400" : "text-gray-400"}>
                            {isCompleted ? 'GOAL ACHIEVED' : `PROGRESS: ${solvedCount} / ${dailyProblems.length}`}
                        </span>
                        <span className="text-cf-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-cf-dark h-2 rounded-full overflow-hidden border border-cf-border/30">
                        <div 
                            className={cn("h-full transition-all duration-1000", isCompleted ? "bg-green-500" : "bg-cf-primary")}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-24 animate-pulse bg-cf-darker rounded-lg" />
                        ))
                    ) : dailyProblems.map((p) => {
                        const isSolved = solvedIndices.has(`${p.contestId}-${p.index}`);
                        return (
                            <div key={`${p.contestId}-${p.index}`} className="relative group">
                                <ProblemCard problem={p} className={cn(
                                    "h-full border transition-all",
                                    isSolved ? "border-green-500/50 bg-green-500/5 opacity-60" : "hover:border-cf-primary/50"
                                )} />
                                {isSolved && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        SOLVED
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
