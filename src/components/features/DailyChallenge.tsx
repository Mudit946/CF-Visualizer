import { useState, useEffect } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ProblemCard } from './ProblemCard';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface DailyChallengeProps {
    user: UserData;
    submissions: Submission[];
}

export function DailyChallenge({ user, submissions }: DailyChallengeProps) {
    const [dailyProblem, setDailyProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDailyProblem = async () => {
        try {
            setLoading(true);
            const allProblems = await codeforcesAPI.getProblems();

            const solvedIndices = new Set(
                submissions
                    .filter(s => s.verdict === 'OK')
                    .map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            const rating = user.rating || 1200;
            const minRating = Math.max(800, rating - 100);
            const maxRating = rating + 200;

            const candidates = allProblems.filter((p: Problem) =>
                p.rating &&
                p.rating >= minRating &&
                p.rating <= maxRating &&
                !solvedIndices.has(`${p.contestId}-${p.index}`)
            );

            if (candidates.length > 0) {
                // Use a semi-deterministic random based on current date
                const today = new Date().toDateString();
                let hash = 0;
                for (let i = 0; i < today.length; i++) {
                    hash = today.charCodeAt(i) + ((hash << 5) - hash);
                }
                const index = Math.abs(hash) % candidates.length;
                setDailyProblem(candidates[index]);
            }
        } catch (error) {
            console.error('Failed to fetch daily problem:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyProblem();
    }, [user.handle]);

    return (
        <Card className="border-cf-primary/30 bg-cf-primary/5">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-cf-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Problem of the Day
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchDailyProblem}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-24 animate-pulse bg-cf-darker rounded-lg" />
                ) : dailyProblem ? (
                    <ProblemCard problem={dailyProblem} />
                ) : (
                    <p className="text-gray-500 text-sm">No challenge available today.</p>
                )}
            </CardContent>
        </Card>
    );
}
