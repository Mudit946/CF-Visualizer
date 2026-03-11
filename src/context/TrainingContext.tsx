import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGamification } from '../hooks/useGamification';
import type { Problem } from '../lib/api';

interface TrainingContextType {
    focusMode: boolean;
    setFocusMode: (val: boolean) => void;
    bookmarks: Problem[];
    addBookmark: (prob: Problem) => void;
    removeBookmark: (contestId: number | undefined, index: string) => void;
    isBookmarked: (contestId: number | undefined, index: string) => boolean;
    queue: Problem[];
    addToQueue: (prob: Problem) => void;
    removeFromQueue: (contestId: number | undefined, index: string) => void;
    isInQueue: (contestId: number | undefined, index: string) => boolean;
    notes: Record<string, string>; // key: "contestId-index"
    saveNote: (contestId: number | undefined, index: string, note: string) => void;
    getNote: (contestId: number | undefined, index: string) => string;
    completedProblems: string[]; // array of "contestId-index"
    toggleComplete: (contestId: number | undefined, index: string) => void;
    isCompleted: (contestId: number | undefined, index: string) => boolean;
    xp: number;
    level: number;
    streak: number;
    xpForNextLevel: number;
    badges: string[]; // array of badge IDs
    awardXP: (amount: number) => void;
    unlockBadge: (badgeId: string) => void;
    recordSolve: (difficulty: number) => void;
    updateStreak: () => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
    const [focusMode, setFocusMode] = useLocalStorage('focus-mode', false);
    const [bookmarks, setBookmarks] = useLocalStorage<Problem[]>('bookmarks', []);
    const [queue, setQueue] = useLocalStorage<Problem[]>('practice-queue', []);
    const [notes, setNotes] = useLocalStorage<Record<string, string>>('problem-notes', {});
    const [completedProblems, setCompletedProblems] = useLocalStorage<string[]>('completed-problems', []);
    const [badges, setBadges] = useLocalStorage<string[]>('user-badges', []);

    const { 
        xp, level, streak, xpForNextLevel, 
        addXP: awardXP, 
        recordSolve, 
        updateStreak 
    } = useGamification();

    const addBookmark = (prob: Problem) => {
        if (!isBookmarked(prob.contestId!, prob.index)) {
            setBookmarks([...bookmarks, prob]);
        }
    };

    const removeBookmark = (contestId: number | undefined, index: string) => {
        setBookmarks(bookmarks.filter(p => !(p.contestId === contestId && p.index === index)));
    };

    const isBookmarked = (contestId: number | undefined, index: string) => {
        return bookmarks.some(p => p.contestId === contestId && p.index === index);
    };

    const addToQueue = (prob: Problem) => {
        if (!isInQueue(prob.contestId, prob.index)) {
            setQueue([...queue, prob]);
        }
    };

    const removeFromQueue = (contestId: number | undefined, index: string) => {
        setQueue(queue.filter(p => !(p.contestId === contestId && p.index === index)));
    };

    const isInQueue = (contestId: number | undefined, index: string) => {
        return queue.some(p => p.contestId === contestId && p.index === index);
    };

    const saveNote = (contestId: number | undefined, index: string, note: string) => {
        setNotes({ ...notes, [`${contestId}-${index}`]: note });
    };

    const getNote = (contestId: number | undefined, index: string) => {
        return notes[`${contestId}-${index}`] || '';
    };

    const unlockBadge = (badgeId: string) => {
        if (!badges.includes(badgeId)) {
            setBadges([...badges, badgeId]);
        }
    };

    const toggleComplete = (contestId: number | undefined, index: string, difficulty?: number) => {
        const id = `${contestId}-${index}`;
        if (completedProblems.includes(id)) {
            setCompletedProblems(completedProblems.filter(p => p !== id));
        } else {
            setCompletedProblems([...completedProblems, id]);
            recordSolve(difficulty || 1000);
        }
    };

    const isCompleted = (contestId: number | undefined, index: string) => {
        return completedProblems.includes(`${contestId}-${index}`);
    };

    return (
        <TrainingContext.Provider value={{
            focusMode, setFocusMode,
            bookmarks, addBookmark, removeBookmark, isBookmarked,
            queue, addToQueue, removeFromQueue, isInQueue,
            notes, saveNote, getNote,
            completedProblems, toggleComplete, isCompleted,
            xp, level, streak, xpForNextLevel, badges, 
            awardXP, unlockBadge, recordSolve, updateStreak
        }}>
            {children}
        </TrainingContext.Provider>
    );
}

export function useTraining() {
    const context = useContext(TrainingContext);
    if (context === undefined) {
        throw new Error('useTraining must be used within a TrainingProvider');
    }
    return context;
}
