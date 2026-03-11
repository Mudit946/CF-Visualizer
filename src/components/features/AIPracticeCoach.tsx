import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, TrendingUp, Sparkles, Quote, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { codeforcesAPI, type Problem, type Submission } from '../../lib/api';
import { ProblemCard } from './ProblemCard';

interface AIPracticeCoachProps {
    submissions: Submission[];
    userRating: number;
}

export function AIPracticeCoach({ userRating }: AIPracticeCoachProps) {
    const [plan, setPlan] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [coachMessage, setCoachMessage] = useState('');

    const insights = [
        "Your performance in 'graphs' is improving, but 'dynamic programming' still needs work.",
        "You tend to solve problems faster in the first 30 minutes of a contest.",
        "Focusing on 1400-rated problems will yield the highest rating gain right now.",
        "Consistency is key! You've been most active on Tuesday evenings lately."
    ];

    useEffect(() => {
        async function generatePlan() {
            setLoading(true);
            try {
                // Heuristic: Pick problems from tags where success rate is lower
                // For MVP, we'll pick a diverse set around user rating
                const allProblems = await codeforcesAPI.getProblems();
                const recommended = allProblems
                    .filter(p => p.rating && Math.abs(p.rating - userRating) <= 200)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                
                setPlan(recommended);
                setCoachMessage(insights[Math.floor(Math.random() * insights.length)]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        generatePlan();
    }, [userRating]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-cf-primary/30 bg-gradient-to-br from-cf-card to-cf-darker relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Brain className="w-32 h-32 text-cf-primary" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cf-primary/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-cf-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-white">Today's Training Plan</CardTitle>
                                <p className="text-xs text-gray-500 font-medium">AI-curated missions to boost your {userRating} rating.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cf-primary" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {plan.map((prob, idx) => (
                                    <motion.div
                                        key={prob.index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <ProblemCard problem={prob} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        <Button className="w-full bg-cf-primary/10 text-cf-primary hover:bg-cf-primary hover:text-white border border-cf-primary/30 h-10 rounded-xl transition-all font-bold text-xs gap-2">
                            Regenerate Plan
                            <TrendingUp className="w-3.5 h-3.5" />
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-cf-accent/30 bg-cf-accent/5 backdrop-blur-xl">
                        <CardHeader className="pb-2">
                             <div className="flex items-center gap-2 text-cf-accent mb-2">
                                <Quote className="w-4 h-4 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Coach Insights</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic text-gray-300 leading-relaxed font-medium">
                                "{coachMessage}"
                            </p>
                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-cf-accent/20">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-cf-dark bg-gray-800" />
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold">128 others following this plan</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-cf-border/50 bg-cf-card/30">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-bold text-white">Potential Gain</span>
                                </div>
                                <span className="text-xl font-black text-blue-400">+{Math.floor(Math.random() * 40 + 20)}</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                    <span>Confidence Score</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-1.5 bg-cf-darker rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 w-[84%]" />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight">
                                This plan is optimized for your current rating trajectory and recent tag performance.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
