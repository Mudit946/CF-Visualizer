import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Swords, Timer, Trophy, Share2, Plus, Play, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { codeforcesAPI, type Problem } from '../lib/api';
import { ProblemCard } from '../components/features/ProblemCard';
import { LiveLeaderboard } from '../components/features/LiveLeaderboard';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';

interface Room {
    id: string;
    name: string;
    host: string;
    problems: Problem[];
    duration: number; // minutes
    participants: Participant[];
    startTime: number | null;
    status: 'waiting' | 'running' | 'finished';
    messages: Message[];
}

interface Participant {
    handle: string;
    solved: string[];
    submissions: Record<string, {
        status: 'solved' | 'failed' | 'pending' | 'none';
        attempts: number;
        time: number;
    }>;
    totalSolved: number;
    penalty: number;
}

interface Message { sender: string, text: string, time: string }

export default function ContestRooms() {
    const [searchParams] = useSearchParams();
    const urlRoomId = searchParams.get('id');

    const [rooms, setRooms] = useState<Room[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    
    const [myHandle] = useState(() => {
        const saved = localStorage.getItem('cf_handle');
        if (saved) return saved;
        // Fallback for demo/guest
        return 'Peer-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    });
    
    // Form state
    const [config, setConfig] = useState({
        name: '',
        count: 5,
        minRating: 1200,
        maxRating: 1600,
        tags: '',
        duration: 120
    });

    useEffect(() => {
        if (urlRoomId && !activeRoom) {
            // In a real P2P app, we'd wait for a peer to send us the state
            // For now, we set a partial state and let useRealtimeRoom find the host
            setActiveRoom({
                id: urlRoomId,
                name: 'Joining Room...',
                host: '',
                problems: [],
                duration: 0,
                participants: [],
                startTime: null,
                status: 'waiting',
                messages: []
            });
        }
    }, [urlRoomId]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRoom = async () => {
        console.log('Starting room creation with config:', config);
        setIsLoading(true);
        setError(null);
        try {
            const allProblems = await codeforcesAPI.getProblems(config.tags ? config.tags.split(',') : undefined);
            console.log(`Fetched ${allProblems.length} problems from API`);
            
            const candidates = allProblems.filter(p => 
                p.rating && p.rating >= config.minRating && p.rating <= config.maxRating
            );
            console.log(`Found ${candidates.length} candidates after filtering`);
            
            if (candidates.length === 0) {
                setError('No problems found for the selected criteria. Try adjusting the ratings or tags.');
                setIsLoading(false);
                return;
            }

            const selected = candidates.sort(() => 0.5 - Math.random()).slice(0, config.count);
            const roomId = Math.random().toString(36).substr(2, 9);
            
            const newRoom: Room = {
                id: roomId,
                name: config.name || 'New Practice Room',
                host: myHandle,
                problems: selected,
                duration: config.duration,
                participants: [{ 
                    handle: myHandle, 
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
            
            console.log('Room created successfully:', newRoom);
            setRooms([newRoom, ...rooms]);
            setActiveRoom(newRoom);
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create room:', error);
            setError('Failed to fetch problems from Codeforces. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <Users className="w-10 h-10 text-cf-primary" />
                        CONTEST ROOMS
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Practice with friends in real-time P2P environments.</p>
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
                <RoomInterface room={activeRoom} myHandle={myHandle} onLeave={() => setActiveRoom(null)} />
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

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
                            <Button 
                                onClick={createRoom} 
                                disabled={isLoading}
                                className="flex-1 bg-cf-primary hover:bg-cf-primary/80 text-white font-bold rounded-xl h-12 shadow-lg shadow-cf-primary/20 transition-all active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </div>
                                ) : 'Create Room'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-cf-border/30 bg-cf-card/20 border-dashed flex flex-col items-center justify-center p-12 text-center group hover:border-cf-primary/40 cursor-pointer transition-all" onClick={() => setIsCreating(true)}>
                        <div className="w-16 h-16 rounded-full bg-cf-darker flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-cf-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Create New Room</h3>
                        <p className="text-gray-500 text-sm mt-2">Start a private P2P session.</p>
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
                                        <Radio className="w-3.5 h-3.5" />
                                        P2P Enabled
                                    </div>
                                </div>
                                <Button onClick={() => setActiveRoom(room)} className="w-full bg-cf-darker group-hover:bg-cf-primary text-gray-400 group-hover:text-white transition-all font-bold rounded-xl">
                                    Enter Room
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function RoomInterface({ room: initialRoom, myHandle, onLeave }: { room: Room, myHandle: string, onLeave: () => void }) {
    const { peers, roomState, participants: p2pParticipants, messages: p2pMessages, broadcastRoomState, broadcastMyState, sendChatMessage, requestRoomState } = useRealtimeRoom(initialRoom.id, myHandle);
    
    const [localRoom, setLocalRoom] = useState<Room>(initialRoom);
    const [timeLeft, setTimeLeft] = useState(initialRoom.duration * 60);
    const [chatInput, setChatInput] = useState('');
    const [showReplay, setShowReplay] = useState(false);

    const [myState, setMyState] = useState<Participant>(() => {
        const existing = initialRoom.participants.find(p => p.handle === myHandle);
        return existing || {
            handle: myHandle,
            solved: [],
            submissions: {},
            totalSolved: 0,
            penalty: 0
        };
    });

    // Sync room state from peers/host
    useEffect(() => {
        if (roomState) {
            console.log('Received room state update:', roomState);
            setLocalRoom(prev => ({
                ...prev,
                ...roomState,
                // Preserving local messages and myHandle from initialRoom if needed
                messages: (roomState.messages && roomState.messages.length > prev.messages.length) ? roomState.messages : prev.messages
            }));

            // Sync timer if running
            if (roomState.status === 'running' && roomState.startTime) {
                const elapsedSeconds = Math.floor((Date.now() - roomState.startTime) / 1000);
                const remaining = Math.max(0, roomState.duration * 60 - elapsedSeconds);
                setTimeLeft(remaining);
            } else if (roomState.status === 'waiting') {
                setTimeLeft(roomState.duration * 60);
            }
        }
    }, [roomState]);

    // Request state if we don't have it (Joining state)
    useEffect(() => {
        if (localRoom.name === 'Joining Room...' && peers.length > 0) {
            const interval = setInterval(() => {
                if (localRoom.name === 'Joining Room...') {
                    console.log('Still joining... requesting room state from peers...');
                    requestRoomState();
                } else {
                    clearInterval(interval);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [peers.length, localRoom.name, requestRoomState]);

    // Host: Listen for state requests
    useEffect(() => {
        const handleRequest = (e: any) => {
            if (localRoom.host === myHandle) {
                console.log('Responding to state request from:', e.detail.peerId);
                broadcastRoomState({
                    id: localRoom.id,
                    name: localRoom.name,
                    host: localRoom.host,
                    problems: localRoom.problems,
                    duration: localRoom.duration,
                    status: localRoom.status,
                    startTime: localRoom.startTime,
                    messages: localRoom.messages
                });
            }
        };
        window.addEventListener('requestRoomState', handleRequest);
        return () => window.removeEventListener('requestRoomState', handleRequest);
    }, [localRoom, myHandle, broadcastRoomState]);

    // Host: Broadcast state to new peers automatically
    useEffect(() => {
        if (localRoom.host === myHandle && peers.length > 0) {
            broadcastRoomState({
                id: localRoom.id,
                name: localRoom.name,
                host: localRoom.host,
                problems: localRoom.problems,
                duration: localRoom.duration,
                status: localRoom.status,
                startTime: localRoom.startTime,
                messages: localRoom.messages
            });
        }
    }, [peers.length, localRoom.id, localRoom.status, broadcastRoomState, myHandle]);

    // Broadcast our own state whenever it changes
    useEffect(() => {
        broadcastMyState(myState);
        // If host, also update localRoom participants list for local consistency
        if (localRoom.host === myHandle) {
            setLocalRoom(prev => ({
                ...prev,
                participants: prev.participants.map(p => p.handle === myHandle ? myState : p)
            }));
        }
    }, [myState, broadcastMyState, localRoom.host, myHandle]);

    useEffect(() => {
        if (localRoom.status === 'running' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [localRoom.status, timeLeft]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMessage = {
            sender: myHandle,
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        sendChatMessage(newMessage);
        setChatInput('');
    };

    const handleSolve = (problemIndex: string, status: 'solved' | 'failed') => {
        const startTime = localRoom.startTime || Date.now();
        const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
        
        setMyState(prev => {
            const current = prev.submissions[problemIndex] || { attempts: 0, status: 'none', time: 0 };
            if (current.status === 'solved') return prev; // Already solved

            const newAttempts = current.attempts + 1;
            const newStatus = status;
            const newSolved = status === 'solved' ? [...prev.solved, problemIndex] : prev.solved;
            const penaltyIncrease = status === 'solved' ? elapsedMinutes + (newAttempts - 1) * 20 : 0;

            return {
                ...prev,
                solved: newSolved,
                submissions: {
                    ...prev.submissions,
                    [problemIndex]: {
                        status: newStatus,
                        attempts: newAttempts,
                        time: status === 'solved' ? elapsedMinutes : 0
                    }
                },
                totalSolved: newSolved.length,
                penalty: prev.penalty + penaltyIncrease
            };
        });
    };

    const startContest = () => {
        const startedRoom = {
            ...localRoom,
            status: 'running' as const,
            startTime: Date.now()
        };
        setLocalRoom(startedRoom);
        broadcastRoomState({
            id: startedRoom.id,
            name: startedRoom.name,
            host: startedRoom.host,
            problems: startedRoom.problems,
            duration: startedRoom.duration,
            status: startedRoom.status,
            startTime: startedRoom.startTime,
            messages: startedRoom.messages
        });
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const allParticipants = useMemo(() => {
        // Build the list of all participants.
        // If we are host, our state is in localRoom.participants (updated via useEffect)
        // If we are guest, we use myState + p2pParticipants.
        
        const peersList = Object.values(p2pParticipants);
        const list = [myState];

        peersList.forEach(p => {
            if (p.handle !== myHandle) {
                list.push(p);
            }
        });

        // Sort by solved (desc) then penalty (asc)
        return list.sort((a, b) => b.totalSolved - a.totalSolved || a.penalty - b.penalty);
    }, [myState, p2pParticipants, myHandle]);

    const allMessages = useMemo(() => {
        return [...localRoom.messages, ...p2pMessages];
    }, [localRoom.messages, p2pMessages]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <Card className="border-cf-border/50 bg-cf-card/30 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center bg-cf-darker/50 border-b border-cf-border/30 gap-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={onLeave} className="rounded-lg h-9">← Back</Button>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{localRoom.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500 font-mono">ROOM ID: {localRoom.id}</p>
                                        <span className="text-[10px] bg-cf-primary/20 text-cf-primary px-1.5 rounded">{myHandle} (You)</span>
                                        <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 rounded animate-pulse">● Live ({peers.length + 1})</span>
                                    </div>
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
                                {localRoom.status === 'waiting' && localRoom.host === 'You' && (
                                    <Button onClick={startContest} className="bg-cf-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-cf-primary/20 gap-2">
                                        <Play className="w-5 h-5" />
                                        Start Contest
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {localRoom.status === 'finished' ? (
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
                                            <p className="text-3xl font-black text-white">{allParticipants[0]?.totalSolved || 0} / {localRoom.problems.length}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-cf-darker border border-cf-border/30 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">XP Gained</p>
                                            <p className="text-3xl font-black text-green-500">+{(allParticipants[0]?.totalSolved || 0) * 50}</p>
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
                                                {allParticipants[0]?.solved.length > 0 ? (
                                                    allParticipants[0].solved.map((p, idx) => (
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
                                    {localRoom.problems.length > 0 ? (
                                        localRoom.problems.map((p) => (
                                            <ProblemCard 
                                                key={`${p.contestId}${p.index}`} 
                                                problem={p} 
                                                isSimulation={true} 
                                                onSolve={(status) => handleSolve(p.index, status)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-20 text-center space-y-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cf-primary mx-auto" />
                                            <p className="text-gray-500 font-medium">Waiting for room host to broadcast configuration...</p>
                                        </div>
                                    )}
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
                                participants={allParticipants} 
                                problems={localRoom.problems} 
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
                                {allMessages.map((m, i) => (
                                    <div key={i} className={cn(
                                        "flex flex-col gap-1",
                                        m.sender === myHandle ? "items-end" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500">{m.sender === myHandle ? 'You' : m.sender}</span>
                                            <span className="text-[10px] text-gray-600">{m.time}</span>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-2 rounded-2xl text-xs max-w-[90%]",
                                            m.sender === myHandle ? "bg-cf-primary text-white rounded-tr-none" : "bg-cf-darker text-gray-300 rounded-tl-none border border-cf-border/30"
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
                                <Radio className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] leading-tight font-medium">Peer-to-Peer synchronization enabled. No backend required.</p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full h-10 rounded-xl gap-2 border-cf-border/50 group"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + '/rooms?id=' + localRoom.id);
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
