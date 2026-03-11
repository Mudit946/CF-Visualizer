import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Swords, Timer, Zap, Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { type Problem } from '../../lib/api';
import { motion } from 'framer-motion';

interface PracticeBattleProps {
    p1: string;
    p2: string;
    problem: Problem;
    duration: number; // minutes
    onEnd: () => void;
}

export function PracticeBattle({ p1, p2, problem, duration, onEnd }: PracticeBattleProps) {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [status] = useState<{ p1: 'none'|'solved'|'failed', p2: 'none'|'solved'|'failed' }>({
        p1: 'none',
        p2: 'none'
    });

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else {
            onEnd();
        }
    }, [timeLeft, onEnd]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4 px-6 bg-cf-darker/50 rounded-2xl border border-cf-border/30 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cf-primary via-white to-red-500 opacity-30" />
                
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 rounded-full bg-cf-primary/20 flex items-center justify-center border-2 border-cf-primary shadow-lg shadow-cf-primary/20">
                        <span className="text-xl font-black text-white">{p1[0].toUpperCase()}</span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white tracking-tight">{p1}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Challenger</p>
                    </div>
                    {status.p1 === 'solved' && (
                        <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold font-mono">SOLVED</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter">VS</div>
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Swords className="w-6 h-6 text-cf-primary drop-shadow-[0_0_8px_rgba(var(--cf-primary-rgb),0.5)]" />
                        </motion.div>
                    </div>
                    
                    <div className="flex flex-col items-center bg-cf-dark p-3 rounded-2xl border border-cf-border/50 min-w-[120px]">
                         <Timer className="w-4 h-4 text-gray-500 mb-1" />
                         <span className={cn(
                             "text-2xl font-mono font-black",
                             timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"
                         )}>
                             {formatTime(timeLeft)}
                         </span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-1 text-right">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 shadow-lg shadow-red-500/20">
                        <span className="text-xl font-black text-white">{p2[0].toUpperCase()}</span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white tracking-tight">{p2}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Defender</p>
                    </div>
                    {status.p2 === 'solved' && (
                        <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold font-mono">SOLVED</span>
                        </div>
                    )}
                </div>
            </div>

            <Card className="border-cf-primary/30 bg-cf-card/30 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-cf-primary/10 border-b border-cf-primary/20 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-cf-primary font-black uppercase tracking-[0.2em] mb-1">Target Mission</p>
                            <CardTitle className="text-3xl font-black text-white tracking-tighter">
                                {problem.index}. {problem.name}
                            </CardTitle>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-mono text-[#ffc658] font-bold">*{problem.rating}</div>
                            <div className="flex gap-1.5 mt-1">
                                {problem.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-cf-darker border border-cf-border/30 text-gray-400 font-bold uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-cf-primary fill-current" />
                                    BATTLE RULES
                                </h4>
                                <ul className="space-y-3">
                                    {[
                                        'First to get an [OK] verdict wins the duel.',
                                        'Incorrect submissions carry a speed penalty.',
                                        'Both participants see live status updates.',
                                        'Contest lasts until anyone solves or time expires.'
                                    ].map((rule, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-cf-primary" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="p-4 bg-cf-darker rounded-xl border border-cf-border/30 space-y-3">
                                <div className="flex items-center gap-2 text-cf-primary">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Warning</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Closing this page will forfeit your current battle. Ensure you have submitted your solution officially on Codeforces before the timer hits zero.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <a 
                                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-cf-primary to-blue-600 hover:from-cf-primary/90 hover:to-blue-600/90 transition-all group relative overflow-hidden shadow-2xl shadow-cf-primary/20"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform" />
                                <Trophy className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                                <div className="text-center pb-2">
                                    <span className="block text-2xl font-black text-white tracking-tighter">SOLVE PROBLEM</span>
                                    <span className="text-xs text-white/70 font-bold uppercase tracking-widest">Opens in New Tab</span>
                                </div>
                                <div className="h-1 w-24 bg-white/30 rounded-full" />
                            </a>
                            
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={onEnd} className="flex-1 h-12 rounded-xl text-gray-400 font-bold border-cf-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30">
                                    Abort Battle
                                </Button>
                                <Button className="flex-1 h-12 rounded-xl bg-cf-dark text-white font-bold border border-cf-border/50 hover:border-cf-primary/50">
                                    Check Status
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
