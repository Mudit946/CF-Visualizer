import { Search, TrendingUp, Target, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

const features = [
    {
        icon: <TrendingUp className="h-6 w-6 text-blue-400" />,
        title: 'Rating Analytics',
        description: 'Track your rating progression, rank distribution, and performance history over time.',
    },
    {
        icon: <Target className="h-6 w-6 text-green-400" />,
        title: 'Problem Detection',
        description: 'Analyze your weak topics and get personalized practice recommendations.',
    },
    {
        icon: <BarChart2 className="h-6 w-6 text-purple-400" />,
        title: 'Submission Insights',
        description: 'View your activity heatmap, solved problem statistics, and difficulty spread.',
    },
];

export function Home() {
    const [handle, setHandle] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle.trim()) {
            navigate(`/profile/${handle.trim()}`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
            <div className="max-w-3xl w-full space-y-12 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                        Master your <span className="text-cf-primary">Competitive Programming</span> Journey
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Get deep analytics, interactive visualizations, and personalized recommendations for your Codeforces profile.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="max-w-md mx-auto w-full relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cf-primary transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Enter Codeforces handle..."
                        className="pl-10 h-14 text-lg bg-cf-darker border-cf-border focus-visible:ring-cf-primary/50"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                    />
                    <Button
                        type="submit"
                        className="absolute right-1.5 top-1.5 h-11 px-6 bg-cf-primary hover:bg-cf-primary/90 text-white font-medium"
                    >
                        Analyze Profile
                    </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    {features.map((feature, idx) => (
                        <Card key={idx} className="bg-cf-card/50 border-cf-border/50 text-left border-none shadow-none">
                            <CardContent className="pt-6 space-y-3">
                                <div className="bg-cf-darker w-12 h-12 rounded-xl flex items-center justify-center border border-cf-border/50">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
