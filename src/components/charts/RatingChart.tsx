import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';
import { type RatingChange } from '../../lib/api';
import { format } from 'date-fns';

interface RatingChartProps {
    data: RatingChange[];
}

const RANK_COLORS = {
    newbie: { bg: '#99999915', stroke: '#999999', min: 0, max: 1200, label: 'Newbie' },
    pupil: { bg: '#00800015', stroke: '#008000', min: 1200, max: 1399, label: 'Pupil' },
    specialist: { bg: '#03a89e15', stroke: '#03a89e', min: 1400, max: 1599, label: 'Specialist' },
    expert: { bg: '#0000ff15', stroke: '#0000ff', min: 1600, max: 1899, label: 'Expert' },
    cm: { bg: '#aa00aa15', stroke: '#aa00aa', min: 1900, max: 2099, label: 'Candidate Master' },
    master: { bg: '#ff8c0015', stroke: '#ff8c00', min: 2100, max: 2399, label: 'Master' },
    gm: { bg: '#ff000015', stroke: '#ff0000', min: 2400, max: 3000, label: 'Grandmaster' },
};

export function RatingChart({ data }: RatingChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-500 bg-cf-dark/50 rounded-xl border border-cf-border/50">
                No rating history available
            </div>
        );
    }

    const chartData = data.map((d, i) => {
        const prevRating = i > 0 ? data[i - 1].newRating : d.oldRating;
        const change = d.newRating - prevRating;
        
        return {
            name: format(new Date(d.ratingUpdateTimeSeconds * 1000), 'MMM yyyy'),
            rating: d.newRating,
            contest: d.contestName,
            dateFull: format(new Date(d.ratingUpdateTimeSeconds * 1000), 'dd MMM yyyy'),
            rank: d.rank,
            change: change,
            changeFormatted: change >= 0 ? `+${change}` : `${change}`
        };
    });

    const minRating = Math.max(0, Math.min(...chartData.map(d => d.rating)) - 200);
    const maxRating = Math.max(...chartData.map(d => d.rating)) + 200;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-cf-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-cf-primary)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />

                {/* Rank Zones */}
                {Object.values(RANK_COLORS).map((zone) => (
                    <ReferenceArea
                        key={zone.label}
                        y1={zone.min}
                        y2={zone.max}
                        fill={zone.bg}
                        stroke="none"
                    />
                ))}

                <XAxis
                    dataKey="name"
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 11 }}
                    tickMargin={10}
                    minTickGap={40}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    domain={[minRating, maxRating]}
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 11 }}
                    width={45}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="bg-cf-darker/95 backdrop-blur-md border border-cf-border p-4 rounded-xl shadow-2xl text-sm min-w-[200px]">
                                    <p className="font-bold text-white mb-2 leading-tight">{d.contest}</p>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Date</span>
                                            <span className="text-gray-200">{d.dateFull}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Rank</span>
                                            <span className="text-white font-medium">#{d.rank}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-cf-border/50">
                                            <span className="text-gray-400">Rating</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${d.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    ({d.changeFormatted})
                                                </span>
                                                <span className="text-cf-primary font-black text-base">{d.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="var(--color-cf-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRating)"
                    animationDuration={1500}
                    dot={{ r: 4, fill: 'var(--color-cf-darker)', stroke: 'var(--color-cf-primary)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#60a5fa', stroke: 'var(--color-cf-darker)', strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
