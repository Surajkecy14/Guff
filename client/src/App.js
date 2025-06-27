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
      setMessages(prev => [...prev, { message, senderId }]);
    });

    return () => socket.disconnect();
  }, [socket]);

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
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100" style={{ height: '90vh' }}>
        {/* Left Sidebar */}
        <div className="col-md-3 d-flex flex-column justify-content-center border-end bg-white p-4">
          <h5 className="text-center mb-3">Join Room</h5>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Room ID"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-100">Join</button>
          </form>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 d-flex flex-column justify-content-between bg-white p-0">
          {/* Header */}
          <div className="bg-primary text-white p-3">
            <h5 className="mb-0">GuffHanum - Room: {roomId || "None"}</h5>
          </div>

          {/* Messages Area */}
          <div className="flex-grow-1 overflow-auto p-3" style={{ background: '#f7f7f7' }}>
            <ul className="list-unstyled">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`d-flex mb-2 ${m.senderId === id ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-2 rounded ${m.senderId === id ? 'bg-success text-white' : 'bg-secondary text-white'}`}
                    style={{ maxWidth: '70%' }}
                  >
                    {m.senderId === id ? m.message : `Stranger: ${m.message}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Typing Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-top d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-success">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
