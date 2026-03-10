import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { type Submission } from '../../lib/api';
import { useMemo } from 'react';

interface DifficultyChartProps {
    submissions: Submission[];
}

const RANGES = [
    { label: '800-1100', min: 800, max: 1100, color: '#8884d8' }, // Newbie/Pupil roughly
    { label: '1200-1500', min: 1200, max: 1500, color: '#82ca9d' }, // Specialist
    { label: '1600-1900', min: 1600, max: 1900, color: '#ffc658' }, // Expert/CM
    { label: '2000-2300', min: 2000, max: 2300, color: '#ff8042' }, // Master/IM
    { label: '2400+', min: 2400, max: 4000, color: '#ff0000' } // GM+
];

export function DifficultyChart({ submissions }: DifficultyChartProps) {
    const data = useMemo(() => {
        // Get unique accepted problems
        const solvedSet = new Set<string>();
        const solvedProbs: any[] = [];

        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const id = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!solvedSet.has(id)) {
                    solvedSet.add(id);
                    solvedProbs.push(sub.problem);
                }
            }
        });

        const counts = RANGES.map(r => ({ ...r, value: 0 }));
        let unrated = 0;

        solvedProbs.forEach(prob => {
            if (!prob.rating) {
                unrated++;
                return;
            }
            for (const range of counts) {
                if (prob.rating >= range.min && prob.rating <= range.max) {
                    range.value++;
                    break;
                }
            }
        });

        return counts.filter(c => c.value > 0);
    }, [submissions]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#252526', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
}
