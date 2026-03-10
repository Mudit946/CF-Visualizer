import { useTraining } from '../../context/TrainingContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { StickyNote, Search, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function ProblemNotes() {
    const { notes, bookmarks, queue, saveNote } = useTraining();
    const [search, setSearch] = useState('');

    // Combine all problems from bookmarks and queue that have notes
    const allProblems = [...bookmarks, ...queue].reduce((acc, p) => {
        const id = `${p.contestId}-${p.index}`;
        if (notes[id] && !acc.find(x => `${x.contestId}-${x.index}` === id)) {
            acc.push(p);
        }
        return acc;
    }, [] as any[]);

    const filtered = allProblems.filter(p => {
        const note = notes[`${p.contestId}-${p.index}`] || '';
        return p.name.toLowerCase().includes(search.toLowerCase()) || note.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <Card className="border-cf-border/50 bg-cf-card/30 backdrop-blur-xl h-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-yellow-500">
                            <StickyNote className="w-5 h-5" />
                            Personal Notes
                        </CardTitle>
                        <CardDescription>
                            Review your insights and observations for specific problems.
                        </CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search notes..."
                            className="pl-9 h-9 w-64 bg-cf-dark/50 border-cf-border/50 text-xs"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(prob => {
                        const note = notes[`${prob.contestId}-${prob.index}`];
                        return (
                            <Card key={`${prob.contestId}-${prob.index}`} className="bg-cf-darker/50 border-cf-border/30 hover:border-yellow-500/30 transition-colors group">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white text-sm group-hover:text-yellow-500 transition-colors">
                                                {prob.index}. {prob.name}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">Contest #{prob.contestId}</p>
                                        </div>
                                        <a
                                            href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 hover:bg-cf-card rounded"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-300 italic line-clamp-3 bg-cf-dark/50 p-2 rounded border border-cf-border/20">
                                        "{note}"
                                    </p>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px] text-gray-500 hover:text-red-400"
                                            onClick={() => saveNote(prob.contestId!, prob.index, '')}
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {allProblems.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 opacity-50 border-2 border-dashed border-cf-border/30 rounded-xl">
                            <StickyNote className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium">No notes created yet</p>
                            <p className="text-xs">Add notes via problem cards to track your thoughts</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
