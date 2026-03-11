import { useMemo } from 'react';
import { type Submission } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Brain, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface WeakTopicAnalyzerProps {
    submissions: Submission[];
}

interface TagStat {
    tag: string;
    total: number;
    solved: number;
    attempts: number;
    avgRating: number;
    successRate: number;
}

export function WeakTopicAnalyzer({ submissions }: WeakTopicAnalyzerProps) {
    const stats = useMemo(() => {
        const tagMap = new Map<string, { solved: Set<string>, attempts: number, totalRating: number, solvedCount: number }>();

        submissions.forEach(sub => {
            const probId = `${sub.problem.contestId}-${sub.problem.index}`;
            sub.problem.tags.forEach(tag => {
                if (!tagMap.has(tag)) {
                    tagMap.set(tag, { solved: new Set(), attempts: 0, totalRating: 0, solvedCount: 0 });
                }
                const current = tagMap.get(tag)!;
                current.attempts++;
                if (sub.verdict === 'OK') {
                    if (!current.solved.has(probId)) {
                        current.solved.add(probId);
                        current.solvedCount++;
                        current.totalRating += sub.problem.rating || 0;
                    }
                }
            });
        });

        return Array.from(tagMap.entries())
            .map(([tag, data]): TagStat => ({
                tag,
                total: data.solvedCount, // unique solved
                solved: data.solvedCount,
                attempts: data.attempts,
                avgRating: data.solvedCount > 0 ? Math.round(data.totalRating / data.solvedCount) : 0,
                successRate: data.attempts > 0 ? (data.solvedCount * 10 / data.attempts) * 10 : 0 // heuristic
            }))
            .filter(s => s.attempts >= 5) // meaningful data
            .sort((a, b) => a.successRate - b.successRate);
    }, [submissions]);

    const weakTopics = stats.slice(0, 4);

    if (weakTopics.length === 0) {
        return (
            <Card className="border-cf-border/50 bg-cf-card/30">
                <CardContent className="flex flex-col items-center justify-center py-10 text-gray-500 italic text-sm">
                    <Brain className="w-8 h-8 mb-2 opacity-20" />
                    Not enough submission data to analyze weak topics.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
                    <TrendingDown className="w-5 h-5" />
                    Weakness Detection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-xs text-gray-400">
                    Based on your submission history, these topics need more focus.
                </p>
                <div className="grid gap-3">
                    {weakTopics.map((stat) => (
                        <div key={stat.tag} className="bg-cf-darker/50 p-3 rounded-xl border border-cf-border/30 group hover:border-red-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-gray-200 capitalize">{stat.tag}</span>
                                <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                                    Score: {Math.round(stat.successRate)}%
                                </span>
                            </div>
                            
                            <div className="w-full bg-cf-dark h-1.5 rounded-full overflow-hidden mb-3">
                                <div 
                                    className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.max(10, stat.successRate)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-[10px] text-gray-500 italic">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-500/50" />
                                    {stat.solved} Solved
                                </div>
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-red-500/50" />
                                    {stat.attempts} Attempts
                                </div>
                                <div>
                                    Avg: {stat.avgRating}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
