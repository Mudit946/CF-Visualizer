import { useEffect } from 'react';
import { useTraining } from '../../context/TrainingContext';
import type { Submission, RatingChange } from '../../lib/api';

interface BadgeSystemProps {
    submissions: Submission[];
    ratingHistory: RatingChange[];
}

export function BadgeSystem({ submissions, ratingHistory }: BadgeSystemProps) {
    const { unlockBadge, badges, awardXP, streak } = useTraining();

    useEffect(() => {
        if (!submissions.length) return;

        // 1. 🔥 7-Day Streak
        if (streak >= 7 && !badges.includes('streak-7')) {
            unlockBadge('streak-7');
            awardXP(500);
        }

        // 2. 🧠 Graph Master
        const graphSolved = submissions.filter(s =>
            s.verdict === 'OK' &&
            s.problem.tags.includes('graphs')
        ).length;

        if (graphSolved >= 20 && !badges.includes('graph-master')) {
            unlockBadge('graph-master');
            awardXP(1000);
        }

        // 3. ⚡ Speed Solver
        const submissionsByDay: Record<string, number> = {};
        submissions.filter(s => s.verdict === 'OK').forEach(s => {
            const day = new Date(s.creationTimeSeconds * 1000).toDateString();
            submissionsByDay[day] = (submissionsByDay[day] || 0) + 1;
        });

        const maxSolvedInADay = Math.max(0, ...Object.values(submissionsByDay));
        if (maxSolvedInADay >= 5 && !badges.includes('speed-solver')) {
            unlockBadge('speed-solver');
            awardXP(300);
        }

        // 4. 🏆 Contest Crusher
        if (ratingHistory.length >= 10 && !badges.includes('contest-crusher')) {
            unlockBadge('contest-crusher');
            awardXP(800);
        }

        // 5. 🎯 Upsolve Champion (Heuristic: Solved contest problems more than 5 hours after submission start)
        // Note: Codeforces contest duration is usually 2-3 hours. 5 hours is a safe 'after contest' margin.
        const upsolvedCount = submissions.filter(s => {
            if (s.verdict !== 'OK' || !s.problem.contestId) return false;
            // participantType is available in Submission.author
            return s.author.participantType === 'PRACTICE' || s.author.participantType === 'VIRTUAL';
        }).length;

        if (upsolvedCount >= 10 && !badges.includes('upsolve-champion')) {
            unlockBadge('upsolve-champion');
            awardXP(1200);
        }

    }, [submissions, ratingHistory, badges, unlockBadge, awardXP, streak]);

    return null; // This component doesn't render anything itself
}
