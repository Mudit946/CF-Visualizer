import { useState } from 'react';
import { useTraining } from '../../context/TrainingContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Bookmark, Search, SortAsc } from 'lucide-react';
import { Input } from '../ui/input';
import { ProblemCard } from '../features/ProblemCard';

export function BookmarksPage() {
    const { bookmarks } = useTraining();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'rating' | 'newest'>('newest');

    const filtered = bookmarks
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase())))
        .sort((a, b) => {
            if (sortBy === 'rating') return (a.rating || 0) - (b.rating || 0);
            return 0; // LocalStorage preserves order of addition
        });

    return (
        <div className="space-y-6">
            <Card className="border-cf-border/50 bg-cf-card/30 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-yellow-500 fill-current" />
                                Saved Problems
                            </CardTitle>
                            <CardDescription>
                                Your personal collection of problems to solve or review.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search name or tag..."
                                    className="pl-9 h-9 w-64 bg-cf-dark/50 border-cf-border/50"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`h-9 border-cf-border/50 ${sortBy === 'rating' ? 'text-cf-primary border-cf-primary/40 bg-cf-primary/10' : 'text-gray-400'}`}
                                onClick={() => setSortBy(sortBy === 'rating' ? 'newest' : 'rating')}
                            >
                                <SortAsc className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {bookmarks.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-500 opacity-50 border-2 border-dashed border-cf-border/30 rounded-xl">
                            <Bookmark className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium">No bookmarks yet</p>
                            <p className="text-xs">Click the bookmark icon on any problem to save it here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map(prob => (
                                <ProblemCard key={`${prob.contestId}-${prob.index}`} problem={prob} />
                            ))}
                            {filtered.length === 0 && search && (
                                <p className="text-center py-10 text-gray-500">No matching problems found</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
