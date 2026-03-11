import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BookOpen, Search, Cpu, ListChecks, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AIEditorialExplainer() {
    const [problemUrl, setProblemUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [explanation, setExplanation] = useState<any>(null);

    const handleAnalyze = () => {
        if (!problemUrl) return;
        setIsAnalyzing(true);
        // Simulate AI analysis delay
        setTimeout(() => {
            setExplanation({
                title: "158B. Taxi",
                difficulty: "Medium-Easy",
                keyTechnique: "Greedy Algorithm / Implementation",
                complexity: "O(n) time, O(1) space",
                summary: "The problem asks for the minimum number of taxis to transport groups of children. Each taxi can hold up to 4 people.",
                walkthrough: [
                    "Count the frequencies of groups with sizes 1, 2, 3, and 4.",
                    "Every group of size 4 needs its own taxi.",
                    "Each group of size 3 can be paired with a group of size 1 (if available).",
                    "Groups of size 2 can be paired with each other.",
                    "Remaining size 1 and size 2 groups are grouped into any available space."
                ]
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <Card className="border-cf-primary/30 bg-cf-card/30 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-cf-primary" />
                        AI Editorial Explainer
                    </CardTitle>
                    <p className="text-xs text-gray-400">Paste a problem link to get a structured AI-powered explanation.</p>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Input 
                            value={problemUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProblemUrl(e.target.value)}
                            placeholder="https://codeforces.com/contest/158/problem/B"
                            className="bg-cf-darker border-cf-border/50 rounded-xl h-12"
                        />
                        <Button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing}
                            className="bg-cf-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-cf-primary/20 gap-2"
                        >
                            {isAnalyzing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Analyze
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
                {explanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <Card className="md:col-span-2 border-cf-border/30 bg-cf-card/20">
                            <CardHeader className="pb-2 border-b border-cf-border/10">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-cf-primary" />
                                        <h3 className="font-bold text-white">{explanation.title} - Analysis</h3>
                                    </div>
                                    <span className="text-[10px] bg-cf-primary/10 text-cf-primary px-2 py-0.5 rounded font-black uppercase tracking-widest">{explanation.difficulty}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-cf-primary">
                                        <MessageSquareQuote className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Concept Summary</span>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                        {explanation.summary}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-cf-primary">
                                        <ListChecks className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Step-by-Step Strategy</span>
                                    </div>
                                    <div className="space-y-3">
                                        {explanation.walkthrough.map((step: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-cf-darker/50 border border-cf-border/20 group hover:border-cf-primary/30 transition-all">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cf-dark flex items-center justify-center text-[10px] font-bold text-cf-primary border border-cf-primary/20">
                                                    {i + 1}
                                                </span>
                                                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-cf-accent/30 bg-cf-accent/5">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-cf-accent">
                                        <Lightbulb className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Pro Tip</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-400 italic">
                                        "When dealing with greedy problems, try to solve the most constrained groups first. Here, size 4 and size 3 groups are the most priority."
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-cf-border/50 bg-cf-card/30">
                                <CardContent className="p-5 space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Technique</span>
                                        <p className="text-sm font-bold text-white uppercase">{explanation.keyTechnique}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Efficiency</span>
                                        <p className="text-sm font-mono text-cf-primary font-bold">{explanation.complexity}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
