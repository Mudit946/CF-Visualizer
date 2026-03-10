import { type UserData, type Submission } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Trophy, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DifficultyPathProps {
    user: UserData;
    submissions: Submission[];
}

const MILESTONES = [800, 1000, 1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000];

export function DifficultyPath({ user, submissions }: DifficultyPathProps) {
    const solvedByRating = submissions
        .filter(s => s.verdict === 'OK' && s.problem.rating)
        .reduce((acc, s) => {
            const r = s.problem.rating!;
            acc[r] = (acc[r] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

    const userRating = user.rating || 0;

    return (
        <Card className="border-cf-border/50 bg-cf-card/20 overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Difficulty Training Path
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-8">
                <div className="min-w-[800px] relative pt-10">
                    {/* Progress Line */}
                    <div className="absolute top-14 left-0 right-0 h-1 bg-cf-dark border-t border-cf-border/30" />

                    <div className="flex justify-between relative">
                        {MILESTONES.map((r) => {
                            const solvedCount = solvedByRating[r] || 0;
                            const isLocked = r > (userRating + 400);
                            const isCompleted = solvedCount >= 10;
                            const isInProgress = !isCompleted && !isLocked;

                            return (
                                <div key={r} className="flex flex-col items-center gap-4 group">
                                    <div className="relative">
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 relative ${isCompleted
                                                ? 'bg-cf-primary border-cf-primary shadow-lg shadow-cf-primary/40'
                                                : isInProgress
                                                    ? 'bg-cf-dark border-cf-primary/60'
                                                    : 'bg-cf-darker border-cf-border/50 opacity-50'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <Circle className={`w-5 h-5 ${isInProgress ? 'text-cf-primary' : 'text-gray-600'}`} />
                                            )}
                                        </motion.div>

                                        {/* Badge for solve count */}
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cf-dark border border-cf-border/50 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {solvedCount}/10 solved
                                        </div>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <span className={`text-xs font-bold ${isInProgress ? 'text-white' : 'text-gray-500'}`}>
                                            {r}
                                        </span>
                                        <div className="w-16 h-1 bg-cf-dark rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cf-primary transition-all duration-500"
                                                style={{ width: `${Math.min(100, (solvedCount / 10) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
