export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_REGISTRY: Badge[] = [
    {
        id: 'streak-7',
        name: '🔥 7-Day Streak',
        description: 'Solved at least one problem for 7 consecutive days.',
        icon: 'Flame',
        rarity: 'rare'
    },
    {
        id: 'graph-master',
        name: '🧠 Graph Master',
        description: 'Solved 20 problems with the "graphs" tag.',
        icon: 'GitBranch',
        rarity: 'epic'
    },
    {
        id: 'speed-solver',
        name: '⚡ Speed Solver',
        description: 'Solved 5 problems in a single day.',
        icon: 'Zap',
        rarity: 'common'
    },
    {
        id: 'contest-crusher',
        name: '🏆 Contest Crusher',
        description: 'Participated in 10 contests.',
        icon: 'Trophy',
        rarity: 'epic'
    },
    {
        id: 'upsolve-champion',
        name: '🎯 Upsolve Champion',
        description: 'Upsolved 10 problems that were missed during contests.',
        icon: 'Target',
        rarity: 'legendary'
    }
];
