import { useState, useEffect } from 'react';
import { type Problem } from '../../lib/api';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Timer, StopCircle, Trophy, AlertTriangle } from 'lucide-react';
import { ProblemCard } from './ProblemCard';

interface ContestSimulatorProps {
    problems: Problem[];
    onFinish: () => void;
    durationMinutes?: number;
}

export function ContestSimulator({ problems, onFinish, durationMinutes = 120 }: ContestSimulatorProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleFinish();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleFinish = () => {
        setIsActive(false);
        setFinished(true);
        onFinish();
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-cf-primary bg-cf-dark/80 sticky top-4 z-50 backdrop-blur-xl shadow-2xl shadow-cf-primary/10">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-cf-primary/20 text-cf-primary'}`}>
                            <Timer className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Remaining Time</p>
                            <h2 className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!finished ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                    if (window.confirm("End the contest now?")) handleFinish();
                                }}
                            >
                                <StopCircle className="w-4 h-4" />
                                Finish Early
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 text-cf-primary font-bold bg-cf-primary/10 px-4 py-2 rounded-lg">
                                <Trophy className="w-5 h-5" />
                                Contest Finished
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!finished && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                        <b>Simulation Mode Active:</b> Editorial links and solution statistics are hidden to simulate real contest pressure. Good luck!
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {problems.map((p, idx) => (
                    <div key={`${p.contestId}-${p.index}`} className="relative group">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cf-dark border border-cf-border flex items-center justify-center font-bold text-cf-primary z-10">
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <ProblemCard
                            problem={p}
                            showEditorial={finished}
                            isSimulation={!finished}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
