import { useState, useEffect, useCallback, useRef } from 'react';
import { joinRoom, selfId } from 'trystero/torrent';
import type { Problem } from '../lib/api';

interface RoomState {
    id: string;
    name: string;
    host: string;
    problems: Problem[];
    duration: number;
    status: 'waiting' | 'running' | 'finished';
    startTime: number | null;
    messages: Message[];
}

interface ParticipantState {
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

interface Message {
    sender: string;
    text: string;
    time: string;
}

export function useRealtimeRoom(roomId: string | null, _userHandle: string) {
    const [peers, setPeers] = useState<string[]>([]);
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [participants, setParticipants] = useState<Record<string, ParticipantState>>({});
    const [messages, setMessages] = useState<Message[]>([]);
    
    const roomRef = useRef<any>(null);
    const actionsRef = useRef<any>(null);

    useEffect(() => {
        if (!roomId) return;

        const config = { appId: 'cf-visualizer-pro-v1' };
        const room = joinRoom(config, roomId);
        roomRef.current = room;

        const [sendState, getState] = room.makeAction('roomState');
        const [sendParticipant, getParticipant] = room.makeAction('pState');
        const [sendMessage, getMessage] = room.makeAction('message');
        const [requestState, getRequestState] = room.makeAction('reqState');

        actionsRef.current = { sendState, sendParticipant, sendMessage, requestState };

        room.onPeerJoin(peerId => {
            console.log('Peer joined:', peerId);
            setPeers(prev => [...prev, peerId]);
        });

        room.onPeerLeave(peerId => {
            console.log('Peer left:', peerId);
            setPeers(prev => prev.filter(id => id !== peerId));
            setParticipants(prev => {
                const updated = { ...prev };
                delete updated[peerId];
                return updated;
            });
        });

        getState((data: any) => {
            setRoomState(data as RoomState);
        });

        getParticipant((data: any, peerId: string) => {
            setParticipants(prev => ({ ...prev, [peerId]: data as ParticipantState }));
        });

        getMessage((data: any) => {
            setMessages(prev => [...prev, data as Message]);
        });

        getRequestState((_: any, peerId: string) => {
            // Handled by the listener in the component
            const event = new CustomEvent('requestRoomState', { detail: { peerId } });
            window.dispatchEvent(event);
        });

        return () => {
            room.leave();
        };
    }, [roomId]);

    const broadcastRoomState = useCallback((state: RoomState) => {
        if (actionsRef.current?.sendState) {
            actionsRef.current.sendState(state);
        }
    }, []);

    const requestRoomState = useCallback(() => {
        if (actionsRef.current?.requestState) {
            actionsRef.current.requestState({});
        }
    }, []);

    const broadcastMyState = useCallback((state: ParticipantState) => {
        if (actionsRef.current?.sendParticipant) {
            actionsRef.current.sendParticipant(state);
        }
    }, []);

    const sendChatMessage = useCallback((msg: Message) => {
        if (actionsRef.current?.sendMessage) {
            actionsRef.current.sendMessage(msg);
            setMessages(prev => [...prev, msg]);
        }
    }, []);

    return {
        peers,
        roomState,
        participants,
        messages,
        broadcastRoomState,
        broadcastMyState,
        sendChatMessage,
        requestRoomState,
        selfId
    };
}
