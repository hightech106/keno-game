import React, { useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const BettingPanel = () => {
  const { roundState } = useSocket();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [stake, setStake] = useState<number>(1);
  const [message, setMessage] = useState<string>('');

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 10) {
        setSelectedNumbers([...selectedNumbers, num]);
      } else {
        alert('Max 10 numbers allowed');
      }
    }
  };

  const placeBet = async () => {
    if (!roundState || roundState.status !== 'OPEN') {
      alert('Round is not open for betting');
      return;
    }

    try {
      const payload = {
        operatorId: 'op-1', // Mock operator
        playerId: 'player-1', // Mock player
        currency: 'USD',
        stake: Number(stake),
        selections: selectedNumbers,
      };

      const response = await axios.post('/api/bets', payload);
      setMessage(`Bet placed successfully! Ticket: ${response.data.ticketId}`);
      setSelectedNumbers([]);
    } catch (error: any) {
      console.error('Bet Error:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h3>Place Your Bet</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Stake: </label>
        <input 
          type="number" 
          value={stake} 
          onChange={(e) => setStake(Number(e.target.value))}
          min="1"
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px', marginBottom: '10px' }}>
        {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => toggleNumber(num)}
            style={{
              backgroundColor: selectedNumbers.includes(num) ? '#4CAF50' : '#f0f0f0',
              color: selectedNumbers.includes(num) ? 'white' : 'black',
              border: '1px solid #ddd',
              padding: '5px',
            }}
          >
            {num}
          </button>
        ))}
      </div>

      <button 
        onClick={placeBet}
        disabled={selectedNumbers.length === 0 || !roundState || roundState.status !== 'OPEN'}
        style={{ width: '100%', padding: '10px', fontSize: '1.2em' }}
      >
        Place Bet ({selectedNumbers.length} numbers)
      </button>

      {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default BettingPanel;
