import { useLocalStorage } from './useLocalStorage';

export interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string | null;
    totalSolved: number;
}

export function useGamification() {
    const [state, setState] = useLocalStorage<GamificationState>('cf-gamification', {
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: null,
        totalSolved: 0
    });

    const xpForNextLevel = state.level * 500;

    const addXP = (amount: number) => {
        setState(prev => {
            let newXP = prev.xp + amount;
            let newLevel = prev.level;
            while (newXP >= newLevel * 500) {
                newXP -= newLevel * 500;
                newLevel++;
            }
            return { ...prev, xp: newXP, level: newLevel };
        });
    };

    const updateStreak = () => {
        const today = new Date().toDateString();
        if (state.lastActiveDate === today) return;

        setState(prev => {
            const lastDate = prev.lastActiveDate ? new Date(prev.lastActiveDate) : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            let newStreak = prev.streak;
            if (!lastDate || lastDate.toDateString() === yesterday.toDateString()) {
                newStreak++;
            } else {
                newStreak = 1;
            }
            
            return { ...prev, streak: newStreak, lastActiveDate: today };
        });
    };

    const recordSolve = (difficulty: number) => {
        const xpEarned = Math.max(10, Math.floor(difficulty / 100));
        addXP(xpEarned);
        setState(prev => ({ ...prev, totalSolved: prev.totalSolved + 1 }));
        updateStreak();
    };

    return {
        ...state,
        xpForNextLevel,
        addXP,
        recordSolve,
        updateStreak
    };
}
