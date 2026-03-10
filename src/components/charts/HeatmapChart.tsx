import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { type Submission } from '../../lib/api';
import { format, subYears, parseISO } from 'date-fns';
import { useMemo } from 'react';
import './heatmap.css';

interface HeatmapChartProps {
    submissions: Submission[];
}

export function HeatmapChart({ submissions }: HeatmapChartProps) {
    const data = useMemo(() => {
        const counts = new Map<string, number>();
        submissions.forEach(sub => {
            // Only count accepted submissions for the heatmap
            if (sub.verdict === 'OK') {
                const dateStr = format(new Date(sub.creationTimeSeconds * 1000), 'yyyy-MM-dd');
                counts.set(dateStr, (counts.get(dateStr) || 0) + 1);
            }
        });

        return Array.from(counts.entries()).map(([date, count]) => ({
            date,
            count
        }));
    }, [submissions]);

    const today = new Date();
    const startDate = subYears(today, 1);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl overflow-x-auto pb-4">
                <div className="min-w-[700px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={data}
                        classForValue={(value) => {
                            if (!value || value.count === 0) {
                                return 'color-empty';
                            }
                            if (value.count === 1) return 'color-scale-1';
                            if (value.count <= 3) return 'color-scale-2';
                            if (value.count <= 6) return 'color-scale-3';
                            return 'color-scale-4';
                        }}
                        titleForValue={(value) => {
                            if (!value || !value.date) return 'No submissions';
                            const d = parseISO(value.date);
                            return `${value.count} submissions on ${format(d, 'MMM d, yyyy')}`;
                        }}
                        showWeekdayLabels={true}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-[#2e3134]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#006d32]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#26a641]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#39d353]"></div>
                <span>More</span>
            </div>
        </div>
    );
}
