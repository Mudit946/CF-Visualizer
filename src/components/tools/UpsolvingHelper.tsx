import { useState } from 'react';
import { type Submission, type RatingChange, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp, ExternalLink } from 'lucide-react';

interface UpsolvingProps {
    submissions: Submission[];
    ratingHistory: RatingChange[];
}

export function UpsolvingHelper({ submissions, ratingHistory }: UpsolvingProps) {
    const [loading, setLoading] = useState(false);
    const [upsolveList, setUpsolveList] = useState<Problem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Get un-solved problems from participated contests
    const getUpsolvingTargets = async () => {
        setLoading(true);
        setError(null);
        try {
            // Participated contests based on rating history (could also use submissions participantType)
            const participatedContestIds = new Set(ratingHistory.map(r => r.contestId));

            const { problems } = await codeforcesAPI.getProblemset();

            // Problems user has already solved
            const solvedSet = new Set(
                submissions.filter(s => s.verdict === 'OK').map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            // Problems from participated contests
            const contestProblems = problems.filter(p => p.contestId && participatedContestIds.has(p.contestId));

            // Filter out solved ones
            const unsolved = contestProblems.filter(p => !solvedSet.has(`${p.contestId}-${p.index}`));

            // Sort them such that we recommend the "easiest" missed problems first (by index A, B, C...)
            unsolved.sort((a, b) => {
                // Fallback to index comparison (A < B) or rating
                if (a.rating && b.rating) return a.rating - b.rating;
                return a.index.localeCompare(b.index);
            });

            // Show top 6 to upsolve
            setUpsolveList(unsolved.slice(0, 6));
            setHasGenerated(true);
        } catch (err: any) {
            setError(err.message || "Failed to load upsolving targets.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cf-border/50 flex flex-col h-full bg-gradient-to-b from-cf-dark to-cf-darker">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Upsolving Helper
                </CardTitle>
                <CardDescription>
                    Identify unsolved problems from contests you've participated in.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
                {!hasGenerated && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-gray-400 text-sm mb-4">
                            Upsolving is the best way to improve. Let's find what you missed.
                        </p>
                        <Button onClick={getUpsolvingTargets} variant="default" className="w-full md:w-auto">
                            Find Missed Problems
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3 pt-2">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                {hasGenerated && !loading && upsolveList.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-400">
                        You have upsolved completely for all your rated contests! Great job! 🎉
                    </div>
                )}

                {hasGenerated && !loading && upsolveList.length > 0 && (
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Recommended Next Targets</h4>
                        {upsolveList.map(prob => (
                            <a
                                key={`${prob.contestId}-${prob.index}`}
                                href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex flex-col p-3 rounded-md bg-cf-card/50 border border-transparent hover:border-cf-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-white group-hover:text-cf-primary transition-colors text-sm">
                                        {prob.index}. {prob.name}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-xs text-gray-500">Contest #{prob.contestId}</div>
                                    {prob.rating && <span className="text-xs font-bold text-[#ffc658]">*{prob.rating}</span>}
                                </div>
                            </a>
                        ))}
                        <Button onClick={getUpsolvingTargets} variant="outline" size="sm" className="w-full mt-2">
                            Refresh
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
