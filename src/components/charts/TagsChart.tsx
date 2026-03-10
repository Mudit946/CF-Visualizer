import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { type Submission } from '../../lib/api';
import { useMemo } from 'react';

interface TagsChartProps {
    submissions: Submission[];
}

export function TagsChart({ submissions }: TagsChartProps) {
    const data = useMemo(() => {
        const tagCounts = new Map<string, number>();
        const solvedSet = new Set<string>();

        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const id = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!solvedSet.has(id)) {
                    solvedSet.add(id);
                    sub.problem.tags.forEach(tag => {
                        // Ignore trivial tags to keep chart clean
                        if (tag !== 'implementation' && tag !== 'math') {
                            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                        }
                    });
                }
            }
        });

        return Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7); // top 7 tags
    }, [submissions]);

    if (data.length === 0) {
        return <div className="text-gray-500 text-sm flex items-center justify-center h-full">Not enough data to calculate top tags</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="tag" tick={{ fill: '#888', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                    name="Problems Solved"
                    dataKey="count"
                    stroke="var(--color-cf-primary)"
                    fill="var(--color-cf-primary)"
                    fillOpacity={0.6}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#252526', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
