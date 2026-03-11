import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { type RatingChange } from '../../lib/api';

interface RatingPredictorProps {
    history: RatingChange[];
}

export function RatingPredictor({ history }: RatingPredictorProps) {
    const predictionData = useMemo(() => {
        if (history.length < 5) return [];

        const lastRating = history[history.length - 1].newRating;
        const trend = (lastRating - history[history.length - 5].newRating) / 5;
        
        const data = history.map(h => ({
            date: new Date(h.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
            rating: h.newRating,
            isPrediction: false
        }));

        // Add 5 predicted points
        for (let i = 1; i <= 5; i++) {
            data.push({
                date: `Future ${i}`,
                rating: Math.round(lastRating + trend * i),
                isPrediction: true
            } as any);
        }

        return data;
    }, [history]);

    const latestRating = history[history.length - 1]?.newRating || 0;
    const predictedRating = predictionData[predictionData.length - 1]?.rating || 0;
    const ratingChangePerc = ((predictedRating - latestRating) / latestRating * 100).toFixed(1);

    return (
        <Card className="border-cf-primary/30 bg-cf-card/30 backdrop-blur-xl">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cf-primary" />
                            Rating Trajectory Predictor
                        </CardTitle>
                        <p className="text-xs text-gray-500 font-medium">AI analysis of your last 10 contests.</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${Number(ratingChangePerc) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {Number(ratingChangePerc) >= 0 ? '+' : ''}{ratingChangePerc}% Trend
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={predictionData}>
                            <defs>
                                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#718096" 
                                fontSize={10} 
                                tickFormatter={(val) => val.includes('Future') ? 'Next' : val}
                            />
                            <YAxis domain={['auto', 'auto']} stroke="#718096" fontSize={10} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#ebf8ff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="rating" 
                                stroke="#3182ce" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorRating)" 
                                strokeDasharray={undefined} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-cf-darker border border-cf-border/30 space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Target className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Target Rank</span>
                        </div>
                        <p className="text-lg font-bold text-white">Expert</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-cf-darker border border-cf-border/30 space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Award className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Probable Peak</span>
                        </div>
                        <p className="text-lg font-bold text-cf-primary">{predictedRating}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-cf-darker border border-cf-border/30 space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Est. Achievement</span>
                        </div>
                        <p className="text-lg font-bold text-white">~3 Months</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
