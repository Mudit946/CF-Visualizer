import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Swords, Timer, Trophy, Share2, Plus, Play, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { codeforcesAPI, type Problem } from '../lib/api';
import { ProblemCard } from '../components/features/ProblemCard';
import { LiveLeaderboard } from '../components/features/LiveLeaderboard';

interface Room {
    id: string;
    name: string;
    host: string;
    problems: Problem[];
    duration: number; // minutes
    participants: { 
        handle: string; 
        solved: string[];
        submissions: Record<string, {
            status: 'solved' | 'failed' | 'pending' | 'none';
            attempts: number;
            time: number;
        }>;
        totalSolved: number;
        penalty: number;
    }[];
    startTime: number | null;
    status: 'waiting' | 'running' | 'finished';
    messages: { sender: string, text: string, time: string }[];
}

export default function ContestRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    
    // Form state
    const [config, setConfig] = useState({
        name: '',
        count: 5,
        minRating: 1200,
        maxRating: 1600,
        tags: '',
        duration: 120
    });

    const createRoom = async () => {
        try {
            const allProblems = await codeforcesAPI.getProblems(config.tags ? config.tags.split(',') : undefined);
            const candidates = allProblems.filter(p => 
                p.rating && p.rating >= config.minRating && p.rating <= config.maxRating
            );
            
            const selected = candidates.sort(() => 0.5 - Math.random()).slice(0, config.count);
            
            const newRoom: Room = {
                id: Math.random().toString(36).substr(2, 9),
                name: config.name || 'New Practice Room',
                host: 'You',
                problems: selected,
                duration: config.duration,
                participants: [{ 
                    handle: 'You', 
                    solved: [], 
                    submissions: {}, 
                    totalSolved: 0, 
                    penalty: 0 
                }],
                startTime: null,
                status: 'waiting',
                messages: [
                    { sender: 'System', text: 'Welcome to the practice room!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ]
            };
            
            setRooms([newRoom, ...rooms]);
            setActiveRoom(newRoom);
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    const startContest = () => {
        if (!activeRoom) return;
        setActiveRoom({
            ...activeRoom,
            status: 'running',
            startTime: Date.now()
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <Users className="w-10 h-10 text-cf-primary" />
                        CONTEST ROOMS
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Practice with friends in simulated contest environments.</p>
                </div>
                {!activeRoom && (
                    <Button 
                        onClick={() => setIsCreating(true)}
                        className="bg-cf-primary hover:bg-cf-primary/80 text-white font-bold px-6 h-12 rounded-xl shadow-lg shadow-cf-primary/20 gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Private Room
                    </Button>
                )}
            </div>

            {activeRoom ? (
                <RoomInterface room={activeRoom} onLeave={() => setActiveRoom(null)} onStart={startContest} />
            ) : isCreating ? (
                <Card className="max-w-2xl mx-auto border-cf-primary/30 bg-cf-card/30 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Configure Your Contest</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room Name</label>
                                <Input 
                                    placeholder="e.g. Graph Masters" 
                                    value={config.name}
                                    onChange={e => setConfig({...config, name: e.target.value})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration (Minutes)</label>
                                <Input 
                                    type="number" 
                                    value={config.duration}
                                    onChange={e => setConfig({...config, duration: parseInt(e.target.value)})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Problem Count</label>
                                <Input 
                                    type="number" 
                                    value={config.count}
                                    onChange={e => setConfig({...config, count: parseInt(e.target.value)})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags (optional, comma separated)</label>
                                <Input 
                                    placeholder="greedy,dp,graphs" 
                                    value={config.tags}
                                    onChange={e => setConfig({...config, tags: e.target.value})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Rating</label>
                                <Input 
                                    type="number" 
                                    value={config.minRating}
                                    onChange={e => setConfig({...config, minRating: parseInt(e.target.value)})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Rating</label>
                                <Input 
                                    type="number" 
                                    value={config.maxRating}
                                    onChange={e => setConfig({...config, maxRating: parseInt(e.target.value)})}
                                    className="bg-cf-darker border-cf-border/50 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
                            <Button onClick={createRoom} className="flex-1 bg-cf-primary text-white font-bold rounded-xl h-12">Create Room</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for public/active rooms if any */}
                    <Card className="border-cf-border/30 bg-cf-card/20 border-dashed flex flex-col items-center justify-center p-12 text-center group hover:border-cf-primary/40 cursor-pointer transition-all" onClick={() => setIsCreating(true)}>
                        <div className="w-16 h-16 rounded-full bg-cf-darker flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-cf-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Create New Room</h3>
                        <p className="text-gray-500 text-sm mt-2">Start a private practice session.</p>
                    </Card>
                    
                    {rooms.map(room => (
                        <Card key={room.id} className="border-cf-border/50 bg-cf-card/30 hover:border-cf-primary/30 transition-all overflow-hidden group">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-white group-hover:text-cf-primary transition-colors">{room.name}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cf-dark text-cf-primary border border-cf-primary/20 capitalize">
                                        {room.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-3.5 h-3.5" />
                                        {room.duration} mins
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Swords className="w-3.5 h-3.5" />
                                        {room.problems.length} Problems
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" />
                                        {room.participants.length} Active
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-3.5 h-3.5" />
                                        Solo Mode
                                    </div>
                                </div>
                                <Button onClick={() => setActiveRoom(room)} className="w-full bg-cf-darker group-hover:bg-cf-primary text-gray-400 group-hover:text-white transition-all font-bold rounded-xl">
                                    Join Room
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function RoomInterface({ room, onLeave, onStart }: { room: Room, onLeave: () => void, onStart: () => void }) {
    const [timeLeft, setTimeLeft] = useState(room.duration * 60);
    const [messages, setMessages] = useState(room.messages);
    const [chatInput, setChatInput] = useState('');
    const [showReplay, setShowReplay] = useState(false);
    
    useEffect(() => {
        if (room.status === 'running' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [room.status, timeLeft]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMessage = {
            sender: 'You',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setChatInput('');
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <Card className="border-cf-border/50 bg-cf-card/30 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center bg-cf-darker/50 border-b border-cf-border/30 gap-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={onLeave} className="rounded-lg h-9">← Back</Button>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{room.name}</h2>
                                    <p className="text-xs text-gray-500 font-mono">ROOM ID: {room.id}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time Remaining</p>
                                    <div className={cn(
                                        "text-3xl font-mono font-black",
                                        timeLeft < 300 ? "text-red-500 animate-pulse" : "text-cf-primary"
                                    )}>
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>
                                {room.status === 'waiting' && (
                                    <Button onClick={onStart} className="bg-cf-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-cf-primary/20 gap-2">
                                        <Play className="w-5 h-5" />
                                        Start Contest
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {room.status === 'finished' ? (
                                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="text-center space-y-2">
                                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto drop-shadow-lg" />
                                        <h3 className="text-3xl font-black text-white italic">CONTEST FINISHED</h3>
                                        <p className="text-gray-400">Great work! Here is your performance breakdown.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-2xl bg-cf-darker border border-cf-border/30 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rank</p>
                                            <p className="text-3xl font-black text-cf-primary">#1</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-cf-darker border border-cf-border/30 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Solved</p>
                                            <p className="text-3xl font-black text-white">{room.participants[0].totalSolved} / {room.problems.length}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-cf-darker border border-cf-border/30 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">XP Gained</p>
                                            <p className="text-3xl font-black text-green-500">+{room.participants[0].totalSolved * 50}</p>
                                        </div>
                                    </div>

                                    <div className="bg-cf-darker rounded-2xl border border-cf-border/30 overflow-hidden">
                                        <div className="p-4 border-b border-cf-border/30 flex justify-between items-center bg-cf-dark">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Play className="w-4 h-4 text-cf-primary" />
                                                Contest Replay Timeline
                                            </h4>
                                            <Button variant="ghost" size="sm" onClick={() => setShowReplay(!showReplay)} className="text-xs text-cf-primary">
                                                {showReplay ? 'Hide' : 'Show Details'}
                                            </Button>
                                        </div>
                                        {showReplay && (
                                            <div className="p-6 space-y-4">
                                                {room.participants[0].solved.length > 0 ? (
                                                    room.participants[0].solved.map((p, idx) => (
                                                        <div key={p} className="flex items-center gap-4">
                                                            <div className="w-2 h-2 rounded-full bg-cf-primary" />
                                                            <div className="text-sm font-bold text-gray-300">00:{15 + idx * 10}:00</div>
                                                            <div className="text-sm text-white">Problem {p} Solved!</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">No problems solved during this session.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {room.problems.map((p) => (
                                        <ProblemCard key={p.index} problem={p} isSimulation={true} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="w-full lg:w-96 space-y-6">
                    <Card className="border-cf-border/50 bg-cf-card/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Live Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-2">
                             <LiveLeaderboard 
                                participants={room.participants} 
                                problems={room.problems} 
                                compact={true} 
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-cf-border/50 bg-cf-card/30 flex flex-col h-[400px]">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-cf-primary" />
                                Live Chat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin scrollbar-thumb-cf-border">
                                {messages.map((m, i) => (
                                    <div key={i} className={cn(
                                        "flex flex-col gap-1",
                                        m.sender === 'You' ? "items-end" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500">{m.sender}</span>
                                            <span className="text-[10px] text-gray-600">{m.time}</span>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-2 rounded-2xl text-xs max-w-[90%]",
                                            m.sender === 'You' ? "bg-cf-primary text-white rounded-tr-none" : "bg-cf-darker text-gray-300 rounded-tl-none border border-cf-border/30"
                                        )}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="bg-cf-darker border-cf-border/50 rounded-xl h-10 text-xs"
                                />
                                <Button onClick={handleSendMessage} size="sm" className="bg-cf-primary rounded-xl w-10 h-10 p-0">
                                    <Share2 className="w-4 h-4 rotate-90" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-cf-border/50 bg-cf-card/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-cf-primary" />
                                Room Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-2 text-cf-primary bg-cf-primary/5 p-3 rounded-xl border border-cf-primary/10">
                                <Info className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] leading-tight font-medium">Results are calculated automatically based on CF API submissions while the timer is running.</p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full h-10 rounded-xl gap-2 border-cf-border/50 group"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + '/rooms?id=' + room.id);
                                    alert('Invite link copied!');
                                }}
                            >
                                <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Copy Invite Link
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
