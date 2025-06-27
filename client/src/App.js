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
    <div className="container-fluid vh-100 bg-light d-flex flex-column">
      <div className="row flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>

        {/* Sidebar (Join Room) */}
        <div className="col-12 col-md-3 bg-dark text-white d-flex flex-column justify-content-center p-4">
          <h4 className="text-center mb-4">🔐 Join Room</h4>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="submit" className="btn btn-warning w-100">Join</button>
          </form>
        </div>

        {/* Chat Section */}
        <div className="col-12 col-md-9 d-flex flex-column p-0">

          {/* Header */}
          <div className="bg-primary text-white px-3 py-2">
            <h6 className="mb-0">Room: {roomId || "Not joined"}</h6>
          </div>

          {/* Scrollable Message Area */}
          <div
            className="px-3 py-2"
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              backgroundColor: '#f1f1f1',
              height: 0,
              minHeight: 0
            }}
          >
            <ul className="list-unstyled mb-0">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`d-flex mb-2 ${m.senderId === id ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-2 rounded-3 ${m.senderId === id
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
          <form
            onSubmit={handleSendMessage}
            className="d-flex border-top p-2 bg-white"
            style={{ flexShrink: 0 }}
          >
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
