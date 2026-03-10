import { useState, useMemo } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ExternalLink, Target } from 'lucide-react';

interface RecommenderProps {
    user: UserData;
    submissions: Submission[];
}

export function ProblemRecommender({ user, submissions }: RecommenderProps) {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Problem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const weakTags = useMemo(() => {
        // Basic weak topic heuristic: tags where success rate is low, or solved count is low compared to others.
        // For simplicity, we just look at tags they've tried but failed often, or tags they haven't done much.
        const tagAttempts = new Map<string, { ok: number, wrong: number }>();

        submissions.forEach(sub => {
            sub.problem.tags.forEach(tag => {
                if (!tagAttempts.has(tag)) tagAttempts.set(tag, { ok: 0, wrong: 0 });
                const stats = tagAttempts.get(tag)!;
                if (sub.verdict === 'OK') stats.ok++;
                else stats.wrong++;
            });
        });

        const weaknesses = Array.from(tagAttempts.entries())
            .filter(([tag, stats]) => {
                // Ignore trivial tags
                if (tag === 'implementation' || tag === 'math' || tag === 'brute force') return false;

                const total = stats.ok + stats.wrong;
                const successRate = stats.ok / total;
                // high attempts but low success OR low total OK (under 10)
                return (total > 5 && successRate < 0.3) || (stats.ok > 0 && stats.ok < 5);
            })
            .map(([tag]) => tag);

        return weaknesses.slice(0, 3); // top 3 weak
    }, [submissions]);

    const generateRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch problems matching weak tags
            const targetRating = (user.rating || 1200) + 100; // Push them slightly
            const { problems } = await codeforcesAPI.getProblemset();

            const solvedSet = new Set(
                submissions.filter(s => s.verdict === 'OK').map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            // Filter: Not solved, rating within target range, contains weak tags
            const candidates = problems.filter(p => {
                if (solvedSet.has(`${p.contestId}-${p.index}`)) return false;
                if (!p.rating || Math.abs(p.rating - targetRating) > 200) return false;

                if (weakTags.length > 0) {
                    const hasWeakTag = weakTags.some(wt => p.tags.includes(wt));
                    if (!hasWeakTag) return false;
                }

                return true;
            });

            // Pick 5 random from candidates
            const shuffled = candidates.sort(() => 0.5 - Math.random());
            setRecommendations(shuffled.slice(0, 5));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cf-border/50 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Practice Recommendations
                </CardTitle>
                <CardDescription>
                    Suggestions based on your rating ({user.rating || 1200}) and weak topics:
                    {weakTags.length > 0 ? (
                        <span className="text-cf-primary ml-1">{weakTags.join(', ')}</span>
                    ) : (
                        <span className="text-gray-500 ml-1">None detected yet</span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
                {!loading && recommendations.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
                        <p className="text-gray-400 text-sm mb-2 text-center">
                            Generate personalized problems focused on improving your weak areas.
                        </p>
                        <Button onClick={generateRecommendations} className="w-full md:w-auto">
                            Generate Practice Set
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3 pt-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                {!loading && recommendations.length > 0 && (
                    <div className="space-y-3 pt-2">
                        {recommendations.map(prob => (
                            <a
                                key={`${prob.contestId}-${prob.index}`}
                                href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex flex-col p-3 rounded-lg border border-cf-border/50 bg-cf-dark hover:border-cf-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-white group-hover:text-cf-primary transition-colors">
                                        {prob.index}. {prob.name}
                                    </span>
                                    <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {prob.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-cf-darker border border-cf-border text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-[#ffc658]">
                                        *{prob.rating}
                                    </span>
                                </div>
                            </a>
                        ))}
                        <div className="pt-2">
                            <Button onClick={generateRecommendations} variant="outline" className="w-full">
                                Refresh Suggestions
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
