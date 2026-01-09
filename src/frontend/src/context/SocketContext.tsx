import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface RoundState {
  roundId: string;
  status: string;
  scheduledTime: Date;
  numbersDrawn: number[];
  countdownSeconds?: number;
}

interface SocketContextType {
  socket: Socket | null;
  roundState: RoundState | null;
  isConnected: boolean;
  refreshRound: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  roundState: null,
  isConnected: false,
  refreshRound: async () => {},
});

export const useSocket = () => useContext(SocketContext);

const API_BASE_URL = 'http://localhost:3000';

// Fetch current round from REST API
const fetchCurrentRound = async (): Promise<RoundState | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rounds/current`);
    const data = response.data;
    return {
      roundId: data.roundId,
      status: data.status,
      scheduledTime: new Date(data.scheduledTime),
      numbersDrawn: data.numbersDrawn || [],
      countdownSeconds: data.countdownSeconds,
    };
  } catch (error) {
    console.error('Failed to fetch current round:', error);
    return null;
  }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roundState, setRoundState] = useState<RoundState | null>(null);

  // Fetch initial round state on mount
  useEffect(() => {
    fetchCurrentRound().then(setRoundState);
  }, []);

  // Refresh round state manually
  const refreshRound = async () => {
    const round = await fetchCurrentRound();
    if (round) {
      setRoundState(round);
    }
  };

  useEffect(() => {
    // Connect to the 'game' namespace
    const newSocket = io(`${API_BASE_URL}/game`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      // Refresh round state when connected
      refreshRound();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('round_state_change', (data: any) => {
      console.log('Round State Change:', data);
      setRoundState((prev) => ({
        ...prev,
        roundId: data.roundId,
        status: data.status,
        scheduledTime: new Date(data.scheduledTime),
        numbersDrawn: prev?.roundId === data.roundId ? prev.numbersDrawn : [],
      }));
      // Also refresh from API to get latest data
      refreshRound();
    });

    newSocket.on('draw_numbers', (data: any) => {
      console.log('Draw Numbers:', data);
      setRoundState((prev) => {
        if (!prev || prev.roundId !== data.roundId) return prev;
        return {
          ...prev,
          numbersDrawn: data.numbers,
        };
      });
    });
    
    newSocket.on('round_settled', (data: any) => {
      console.log('Round Settled:', data);
      // Refresh round state after settlement
      refreshRound();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, roundState, isConnected, refreshRound }}>
      {children}
    </SocketContext.Provider>
  );
};
