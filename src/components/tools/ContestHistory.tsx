import { useState, useMemo } from 'react';
import { type RatingChange } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ContestHistoryProps {
    ratingHistory: RatingChange[];
}

export function ContestHistory({ ratingHistory }: ContestHistoryProps) {
    const [page, setPage] = useState(0);
    const itemsPerPage = 10;

    const sortedHistory = useMemo(() => {
        return [...ratingHistory].sort((a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds);
    }, [ratingHistory]);

    const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
    const currentItems = sortedHistory.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    if (ratingHistory.length === 0) {
        return (
            <Card className="border-cf-border/50 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-400" />
                        Contest History
                    </CardTitle>
                    <CardDescription>No contest history found.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-cf-border/50 flex flex-col h-full bg-gradient-to-b from-cf-dark to-cf-darker">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    Contest History
                </CardTitle>
                <CardDescription>
                    Detailed log of your rated contests and delta tracking.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 overflow-hidden p-0 px-4 pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-400 uppercase bg-cf-card/50 border-b border-cf-border/50">
                            <tr>
                                <th className="px-4 py-3 font-medium">Contest</th>
                                <th className="px-4 py-3 font-medium text-center">Rank</th>
                                <th className="px-4 py-3 font-medium text-center">Rating</th>
                                <th className="px-4 py-3 font-medium text-center">Delta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((contest) => {
                                const delta = contest.newRating - contest.oldRating;
                                const isPositive = delta > 0;
                                const isZero = delta === 0;

                                return (
                                    <tr key={contest.contestId} className="border-b border-cf-border/20 hover:bg-cf-card/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-200 truncate max-w-[200px] md:max-w-[300px]">
                                            <div className="truncate" title={contest.contestName}>
                                                {contest.contestName}
                                            </div>
                                            <div className="text-xs text-gray-500 font-normal mt-0.5">
                                                {format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-white font-mono">
                                            {contest.rank}
                                        </td>
                                        <td className="px-4 py-3 text-center text-white font-bold">
                                            {contest.newRating}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className={`inline-flex items-center justify-center gap-1 font-bold ${isPositive ? 'text-[#39d353]' : isZero ? 'text-gray-400' : 'text-[#ff0000]'
                                                }`}>
                                                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isZero ? <Minus className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                {isPositive ? '+' : ''}{delta}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 mx-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-gray-400">
                            Page {page + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
