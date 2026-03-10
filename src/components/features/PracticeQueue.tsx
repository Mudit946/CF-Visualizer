import { useTraining } from '../../context/TrainingContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { ListPlus, Play, CheckCircle, Trash2, LayoutList } from 'lucide-react';
import { ProblemCard } from '../features/ProblemCard';

export function PracticeQueue() {
    const { queue, removeFromQueue, isCompleted, toggleComplete } = useTraining();

    const pending = queue.filter(p => !isCompleted(p.contestId!, p.index));
    const completed = queue.filter(p => isCompleted(p.contestId!, p.index));

    return (
        <div className="space-y-6">
            <Card className="border-cf-border/50 bg-cf-card/30 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutList className="w-5 h-5 text-cf-primary" />
                        Practice Queue
                    </CardTitle>
                    <CardDescription>
                        Manage your active training list and track completion progress.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {queue.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-500 opacity-50 border-2 border-dashed border-cf-border/30 rounded-xl">
                            <ListPlus className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium">Your queue is empty</p>
                            <p className="text-xs">Add problems to start your training session</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {pending.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cf-primary">
                                        <Play className="w-3 h-3 fill-current" />
                                        In Progress ({pending.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {pending.map(prob => (
                                            <div key={`${prob.contestId}-${prob.index}`} className="relative group">
                                                <ProblemCard problem={prob} />
                                                <div className="absolute top-4 right-16 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 rounded-md border-green-500/30 text-green-500 hover:bg-green-500/10"
                                                        onClick={() => toggleComplete(prob.contestId!, prob.index)}
                                                    >
                                                        Done
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {completed.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500">
                                        <CheckCircle className="w-3 h-3" />
                                        Completed ({completed.length})
                                    </h4>
                                    <div className="space-y-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                        {completed.map(prob => (
                                            <div key={`${prob.contestId}-${prob.index}`} className="relative group">
                                                <ProblemCard problem={prob} />
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                                                        onClick={() => removeFromQueue(prob.contestId!, prob.index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
