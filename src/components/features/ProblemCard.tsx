import { useState } from 'react';
import type { Problem } from '../../lib/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTraining } from '../../context/TrainingContext';
import { cn } from '../../lib/utils';
import {
    Bookmark,
    BookmarkCheck,
    ListPlus,
    ListMinus,
    StickyNote,
    BookOpen,
    Youtube,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProblemCardProps {
    problem: Problem;
    showEditorial?: boolean;
    isSimulation?: boolean;
    onSolve?: (status: 'solved' | 'failed') => void;
    className?: string;
}

export function ProblemCard({ problem, showEditorial = true, isSimulation = false, onSolve, className }: ProblemCardProps) {
    const {
        focusMode,
        isBookmarked, addBookmark, removeBookmark,
        isInQueue, addToQueue, removeFromQueue,
        saveNote, getNote
    } = useTraining();

    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [noteText, setNoteText] = useState(getNote(problem.contestId!, problem.index));

    const bookmarked = isBookmarked(problem.contestId!, problem.index);
    const inQueue = isInQueue(problem.contestId!, problem.index);

    const toggleBookmark = () => {
        if (bookmarked) removeBookmark(problem.contestId!, problem.index);
        else addBookmark(problem);
    };

    const toggleQueue = () => {
        if (inQueue) removeFromQueue(problem.contestId!, problem.index);
        else addToQueue(problem);
    };

    const handleSaveNote = () => {
        saveNote(problem.contestId!, problem.index, noteText);
        setShowNoteEditor(false);
    };

    const editorialLink = `https://codeforces.com/blog/entry/${problem.contestId}`; // Rough guess, usually works or points to contest
    const youtubeSearch = `https://www.youtube.com/results?search_query=codeforces+${problem.contestId}+${problem.index}+tutorial`;

    return (
        <Card className={cn(
            "group relative overflow-hidden border-cf-border/40 bg-cf-card/50 backdrop-blur-md hover:border-cf-primary/50 transition-all duration-300",
            className
        )}>
            <div className="p-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white group-hover:text-cf-primary transition-colors">
                                {problem.index}. {problem.name}
                            </span>
                            {!focusMode && !isSimulation && problem.rating && (
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cf-dark border border-cf-border text-[#ffc658]">
                                    *{problem.rating}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {problem.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-cf-card border border-cf-border/50 text-gray-400">
                                    {tag}
                                </span>
                            ))}
                            {problem.tags.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cf-card border border-cf-border/50 text-gray-500">
                                    +{problem.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cf-border/20">
                    <div className="flex items-center bg-cf-darker rounded-lg p-1 border border-cf-border/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleBookmark}
                            className={cn(
                                "h-8 w-8 p-0 rounded-md transition-all duration-300",
                                bookmarked ? "text-yellow-500 bg-yellow-500/10" : "text-gray-500 hover:text-gray-300",
                                isSimulation && "hidden"
                            )}
                        >
                            {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleQueue}
                            className={cn(
                                "h-8 w-8 p-0 rounded-md transition-all duration-300",
                                inQueue ? "text-cf-accent bg-cf-accent/10" : "text-gray-500 hover:text-gray-300",
                                isSimulation && "hidden"
                            )}
                        >
                            {inQueue ? <ListMinus className="w-4 h-4" /> : <ListPlus className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNoteEditor(!showNoteEditor)}
                            className={cn(
                                "h-8 w-8 p-0 rounded-md text-gray-500 hover:text-cf-accent",
                                getNote(problem.contestId!, problem.index) ? 'text-yellow-400' : '',
                                isSimulation && "hidden"
                            )}
                        >
                            <StickyNote className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-cf-border/30 mx-1" />

                    <div className="flex items-center gap-2">
                        {showEditorial && !isSimulation && (
                            <>
                                <a
                                    href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 text-xs gap-1.5 border border-cf-border/50 rounded-md flex items-center hover:bg-cf-primary/10 hover:text-cf-primary group/btn transition-colors"
                                >
                                    <Globe className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                                    Problem
                                </a>
                                <a
                                    href={editorialLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-8 px-3 text-xs gap-1.5 border border-cf-border/50 rounded-md flex items-center hover:bg-cf-accent/10 hover:text-cf-accent group/btn transition-colors"
                                >
                                    <BookOpen className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                    Blog
                                </a>
                                <a
                                    href={youtubeSearch}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-8 px-3 text-xs gap-1.5 border border-cf-border/50 rounded-md flex items-center hover:bg-red-500/10 hover:text-red-500 group/btn transition-colors"
                                >
                                    <Youtube className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                    Video
                                </a>
                            </>
                        )}
                        {isSimulation && (
                            <div className="flex gap-2">
                                <a
                                    href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-4 text-xs font-bold bg-cf-primary hover:bg-cf-primary/80 text-white rounded-md flex items-center transition-colors"
                                >
                                    Solve
                                </a>
                                {onSolve && (
                                    <>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => onSolve('solved')}
                                            className="h-8 px-3 text-[10px] font-bold border-green-500/30 text-green-500 hover:bg-green-500/10"
                                        >
                                            Mark Solved
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => onSolve('failed')}
                                            className="h-8 px-3 text-[10px] font-bold border-red-500/30 text-red-500 hover:bg-red-500/10"
                                        >
                                            Mark Failed
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showNoteEditor && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-cf-darker/50"
                    >
                        <div className="p-4 pt-0">
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Write your notes here..."
                                className="w-full h-24 bg-cf-card/50 border border-cf-border/50 rounded-md p-2 text-xs text-gray-300 focus:outline-none focus:border-cf-primary/50 resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowNoteEditor(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSaveNote}>Save Note</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
