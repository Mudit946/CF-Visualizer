import { useState } from 'react';
import { type UserData, type Submission, type Problem, codeforcesAPI } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ProblemCard } from './ProblemCard';
import { BookMarked, ChevronRight, Hash } from 'lucide-react';

interface TopicTrainerProps {
    user: UserData;
    submissions: Submission[];
}

const TOPICS = [
    'dp', 'graphs', 'greedy', 'math', 'data structures', 'binary search', 'trees', 'strings', 'number theory', 'geometry'
];

export function TopicTrainer({ user, submissions }: TopicTrainerProps) {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTopicProblems = async (topic: string) => {
        try {
            setLoading(true);
            setSelectedTopic(topic);
            const allProblems = await codeforcesAPI.getProblems();

            const solvedIndices = new Set(
                submissions
                    .filter(s => s.verdict === 'OK')
                    .map(s => `${s.problem.contestId}-${s.problem.index}`)
            );

            const rating = user.rating || 1200;

            const matching = allProblems.filter(p =>
                p.tags.includes(topic) &&
                !solvedIndices.has(`${p.contestId}-${p.index}`) &&
                p.rating! >= rating - 100 &&
                p.rating! <= rating + 400
            );

            // Sort by rating and take top 5
            const sorted = matching.sort((a, b) => (a.rating || 0) - (b.rating || 0)).slice(0, 5);
            setProblems(sorted);
        } catch (error) {
            console.error('Failed to fetch topic problems:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-cf-primary/20 bg-cf-card/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-cf-primary" />
                    Topic Trainer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => fetchTopicProblems(topic)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${selectedTopic === topic
                                ? 'bg-cf-primary border-cf-primary text-white shadow-lg shadow-cf-primary/20'
                                : 'bg-cf-dark border-cf-border/50 text-gray-400 hover:border-cf-primary/50'
                                }`}
                        >
                            <Hash className="w-3 h-3 inline mr-1 opacity-50" />
                            {topic}
                        </button>
                    ))}
                </div>

                {selectedTopic && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2 capitalize">
                                {selectedTopic} Path
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            </h4>
                            <span className="text-[10px] text-gray-500 font-mono">Suggested for your rating</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-cf-darker/50 rounded-xl animate-pulse" />
                                ))
                            ) : problems.length > 0 ? (
                                problems.map(p => (
                                    <ProblemCard key={`${p.contestId}-${p.index}`} problem={p} showEditorial={false} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs text-center py-4">No problems found for this topic in your rating range.</p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
