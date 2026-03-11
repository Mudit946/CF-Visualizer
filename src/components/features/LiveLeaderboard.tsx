import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface Participant {
    handle: string;
    submissions: Record<string, {
        status: 'solved' | 'failed' | 'pending' | 'none';
        attempts: number;
        time: number; // seconds from start
    }>;
    totalSolved: number;
    penalty: number;
}

interface LiveLeaderboardProps {
    participants: Participant[];
    problems: { index: string, contestId?: number | string }[];
    compact?: boolean;
}

export function LiveLeaderboard({ participants, problems, compact = false }: LiveLeaderboardProps) {
    const sortedParticipants = [...participants].sort((a, b) => {
        if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
        return a.penalty - b.penalty;
    });

    return (
        <div className="overflow-x-auto rounded-xl border border-cf-border/30 bg-cf-card/20 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-cf-darker/50 border-b border-cf-border/30">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-12">#</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Handle</th>
                        {problems.map(p => (
                            <th key={`${p.contestId}${p.index}`} className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center w-16">
                                {p.index}
                            </th>
                        ))}
                        {!compact && (
                            <>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center w-16">Score</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center w-20">Penalty</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-cf-border/10">
                    {sortedParticipants.map((participant, rank) => (
                        <motion.tr 
                            key={participant.handle}
                            layout
                            className="hover:bg-cf-primary/5 transition-colors group"
                        >
                            <td className="p-4">
                                <span className={cn(
                                    "text-sm font-bold",
                                    rank === 0 ? "text-yellow-500" : rank === 1 ? "text-gray-300" : rank === 2 ? "text-orange-400" : "text-gray-500"
                                )}>
                                    {rank + 1}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-cf-primary transition-colors">
                                        {participant.handle}
                                    </span>
                                </div>
                            </td>
                            {problems.map(p => {
                                const sub = participant.submissions[p.index] || { status: 'none', attempts: 0 };
                                return (
                                    <td key={`${p.contestId}${p.index}`} className="p-2">
                                        <div className={cn(
                                            "h-10 rounded flex flex-col items-center justify-center transition-all",
                                            sub.status === 'solved' ? "bg-green-500/20 border border-green-500/30 text-green-500" :
                                            sub.status === 'failed' ? "bg-red-500/20 border border-red-500/30 text-red-500" :
                                            sub.status === 'pending' ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-500" :
                                            "bg-cf-darker/50 border border-cf-border/10 text-gray-600"
                                        )}>
                                            {sub.status === 'solved' ? (
                                                <>
                                                    <span className="text-[10px] font-bold leading-none">+{sub.attempts > 1 ? sub.attempts - 1 : ''}</span>
                                                    <span className="text-[8px] opacity-70 mt-0.5">{Math.floor(sub.time / 60)}m</span>
                                                </>
                                            ) : sub.status === 'failed' ? (
                                                <span className="text-[10px] font-bold">-{sub.attempts}</span>
                                            ) : (
                                                <span className="text-[10px] font-bold">-</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                            {!compact && (
                                <>
                                    <td className="p-4 text-center font-bold text-white">
                                        {participant.totalSolved}
                                    </td>
                                    <td className="p-4 text-center font-mono text-xs text-gray-400">
                                        {participant.penalty}
                                    </td>
                                </>
                            )}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
