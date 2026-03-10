import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { type RatingChange } from '../../lib/api';
import { format } from 'date-fns';

interface RatingChartProps {
    data: RatingChange[];
}

export function RatingChart({ data }: RatingChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
                No rating history available
            </div>
        );
    }

    const chartData = data.map((d) => ({
        name: format(new Date(d.ratingUpdateTimeSeconds * 1000), 'MMM yyyy'),
        rating: d.newRating,
        contest: d.contestName,
        dateFull: format(new Date(d.ratingUpdateTimeSeconds * 1000), 'dd MMM yyyy'),
        rank: d.rank
    }));

    const minRating = Math.min(...chartData.map(d => d.rating)) - 100;
    const maxRating = Math.max(...chartData.map(d => d.rating)) + 100;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />

                {/* Codeforces Rank Ranges Backgrounds */}
                <ReferenceLine y={1200} stroke="#333" strokeDasharray="3 3" />
                <ReferenceLine y={1400} stroke="#333" strokeDasharray="3 3" />
                <ReferenceLine y={1600} stroke="#333" strokeDasharray="3 3" />
                <ReferenceLine y={1900} stroke="#333" strokeDasharray="3 3" />
                <ReferenceLine y={2100} stroke="#333" strokeDasharray="3 3" />
                <ReferenceLine y={2400} stroke="#333" strokeDasharray="3 3" />

                <XAxis
                    dataKey="name"
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickMargin={10}
                    minTickGap={30}
                />
                <YAxis
                    domain={[minRating > 0 ? minRating : 0, maxRating]}
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 12 }}
                    width={60}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="bg-cf-darker border border-cf-border p-3 rounded-lg shadow-xl text-sm whitespace-nowrap">
                                    <p className="font-bold text-white mb-1">{d.contest}</p>
                                    <p className="text-gray-300">Date: {d.dateFull}</p>
                                    <p className="text-gray-300">Rank: <span className="text-white font-medium">{d.rank}</span></p>
                                    <p className="text-cf-primary font-bold mt-1">= {d.rating}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="var(--color-cf-primary)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'var(--color-cf-primary)' }}
                    activeDot={{ r: 6, fill: '#60a5fa', stroke: 'var(--color-cf-darker)', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
