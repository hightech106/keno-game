import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RoundState {
  roundId: string;
  status: string;
  scheduledTime: Date;
  numbersDrawn: number[];
}

interface SocketContextType {
  socket: Socket | null;
  roundState: RoundState | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  roundState: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roundState, setRoundState] = useState<RoundState | null>(null);

  useEffect(() => {
    // Connect to the 'game' namespace
    const newSocket = io('http://localhost:3000/game', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
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
        // Maybe trigger a balance refresh here
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, roundState, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
