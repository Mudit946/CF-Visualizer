import { useTraining } from '../../context/TrainingContext';
import { Card, CardContent } from '../ui/card';
import { BADGE_REGISTRY } from '../../lib/badgeRegistry';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles, Flame, Zap, Target, GitBranch } from 'lucide-react';

const iconMap: Record<string, any> = {
    Trophy,
    Star,
    Sparkles,
    Flame,
    Zap,
    Target,
    GitBranch
};

export function GamifiedStats() {
    const { xp, level, badges, streak, xpForNextLevel } = useTraining();

    const progress = (xp / xpForNextLevel) * 100;

    return (
        <Card className="border-cf-primary/30 bg-cf-primary/5 overflow-hidden">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-cf-primary/20 flex items-center justify-center border-2 border-cf-primary shadow-lg shadow-cf-primary/20">
                                <span className="text-xl font-bold text-cf-primary">{level}</span>
                            </div>
                            <motion.div
                                className="absolute -top-1 -right-1"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
                            </motion.div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-cf-primary">Level</p>
                            <h3 className="text-lg font-bold text-white leading-tight">Mastery Rank</h3>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        {streak > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                <Flame className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold">{streak} Day Streak</span>
                            </div>
                        )}
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Total XP</p>
                        <p className="text-lg font-mono font-bold text-white leading-tight">{xp.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Progress to Level {level + 1}</span>
                        <span className="text-cf-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-cf-darker rounded-full overflow-hidden border border-cf-border/30">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cf-primary to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                        <span>{xp} XP</span>
                        <span>{xpForNextLevel} XP</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-cf-border/30">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                            Achievements
                        </h4>
                        <span className="text-[10px] text-gray-500">{badges.length} Unlocked</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {badges.length > 0 ? (
                            badges.map(badgeId => {
                                const badge = BADGE_REGISTRY.find(b => b.id === badgeId);
                                if (!badge) return null;
                                const Icon = iconMap[badge.icon] || Trophy;
                                return (
                                    <motion.div
                                        key={badgeId}
                                        whileHover={{ scale: 1.1 }}
                                        className="group relative"
                                    >
                                        <div className={`p-2 rounded-lg bg-cf-dark border transition-all duration-300 ${badge.rarity === 'legendary' ? 'border-yellow-500/50 bg-yellow-500/5' :
                                                badge.rarity === 'epic' ? 'border-purple-500/50 bg-purple-500/5' :
                                                    badge.rarity === 'rare' ? 'border-blue-500/50 bg-blue-500/5' :
                                                        'border-gray-500/30'
                                            }`}>
                                            <Icon className={`w-4 h-4 ${badge.rarity === 'legendary' ? 'text-yellow-500' :
                                                    badge.rarity === 'epic' ? 'text-purple-500' :
                                                        badge.rarity === 'rare' ? 'text-blue-500' :
                                                            'text-gray-400'
                                                }`} />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-cf-darker border border-cf-border rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            <p className="text-[10px] font-bold text-white">{badge.name}</p>
                                            <p className="text-[8px] text-gray-400 mt-0.5">{badge.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="w-full py-4 text-center border-2 border-dashed border-cf-border/30 rounded-lg">
                                <p className="text-[10px] text-gray-500">No achievements yet. Keep training!</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
