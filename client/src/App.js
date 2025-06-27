import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const socket = useMemo(() => io("https://guff-ar6e.onrender.com"), []);
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("recieved-message", ({ message, senderId }) => {
      setMessages(prev => [...prev, { message, senderId }]);
    });

    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join", joinCode);
    setRoomId(joinCode);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("message", { message, roomId });
    setMessages(prev => [...prev, { message, senderId: socket.id }]);
    setMessage('');
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-gradient">
      <div className="row w-100 shadow-lg" style={{ height: '90vh', maxWidth: '1100px', borderRadius: '15px', overflow: 'hidden' }}>
        
        {/* Left Sidebar */}
        <div className="col-md-3 d-flex flex-column justify-content-center bg-dark text-light p-4">
          <h4 className="text-center mb-4">🔐 Join Room</h4>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="submit" className="btn btn-warning w-100 fw-bold">Join</button>
          </form>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 d-flex flex-column p-0 bg-light">
          
          {/* Header */}
          <div className="bg-primary text-white p-3 fw-semibold shadow-sm">
            Chat Room: {roomId || 'Not Joined Yet'}
          </div>

          {/* Messages */}
          <div className="flex-grow-1 overflow-auto p-3" style={{ background: '#e9ecef' }}>
            <ul className="list-unstyled">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`d-flex mb-2 ${m.senderId === id ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-2 rounded-3 shadow-sm ${m.senderId === id
                      ? 'bg-info text-dark'
                      : 'bg-white text-dark border'}`}
                    style={{ maxWidth: '75%' }}
                  >
                    {m.senderId === id ? m.message : `👤 Stranger: ${m.message}`}
                  </div>
                </li>
              ))}
              <div ref={messageEndRef}></div>
            </ul>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-top d-flex bg-white">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-primary fw-bold px-4">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
