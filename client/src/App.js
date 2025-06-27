import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const socket = useMemo(() => io("https://guff-ar6e.onrender.com"), []);

  useEffect(() => {
    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("recieved-message", ({ message, senderId }) => {
      setMessages((prev) => [...prev, { message, senderId }]);
    });

    return () => socket.disconnect();
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { message, roomId });
    setMessages((prev) => [...prev, { message, senderId: socket.id }]); // display own message
    setMessage('');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join", joinCode);
    setRoomId(joinCode);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial' }}>
      <h2>💬 GuffHanum</h2>
      <form onSubmit={handleJoinRoom} style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Room Name..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '60%' }}
        />
        <button type="submit">Join Room</button>
      </form>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '60%' }}
        />
        <input
          type="text"
          placeholder="Room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '30%' }}
        />
        <button type="submit">Send</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((m, i) => (
          <li
            key={i}
            style={{
              textAlign: m.senderId === id ? 'right' : 'left',
              marginBottom: '10px'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                backgroundColor: m.senderId === id ? '#a0e7e5' : '#f2f2f2',
                padding: '10px 15px',
                borderRadius: '10px',
                maxWidth: '70%',
                wordWrap: 'break-word'
              }}
            >
              {m.senderId === id ? m.message : `Stranger: ${m.message}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
