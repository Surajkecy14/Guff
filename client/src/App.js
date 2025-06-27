import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socket = useMemo(() => io("https://guff-ar6e.onrender.com"), []);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("recieved-message", ({ message, senderId }) => {
      setMessages(prev => [...prev, { message, senderId }]);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId !== socket.id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
      }
    });

    return () => {
      socket.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
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

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (roomId) {
      socket.emit("typing", { roomId, senderId: socket.id });
    }
  };

  return (
    <div className="container-fluid vh-100 bg-light d-flex flex-column">
      
      {/* Mobile / Top Navbar Join */}
      <div className="row d-md-none bg-dark text-white p-2 align-items-center">
        <form className="d-flex w-100 gap-2" onSubmit={handleJoinRoom}>
          <input
            type="text"
            className="form-control"
            placeholder="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" className="btn btn-warning">Join</button>
        </form>
      </div>

      <div className="row flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
        
        {/* Desktop Sidebar */}
        <div className="d-none d-md-flex col-md-3 bg-dark text-white flex-column justify-content-center p-4">
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

          {/* Messages */}
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
                    {m.senderId === id ? m.message : `👤: ${m.message}`}
                  </div>
                </li>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <li className="d-flex mb-2 justify-content-start">
                  <div
                    className="p-2 rounded-3 bg-light border text-muted"
                    style={{ fontStyle: 'italic', fontSize: '0.9rem' }}
                  >
                    👤 Someone is typing...
                  </div>
                </li>
              )}

              <div ref={messageEndRef}></div>
            </ul>
          </div>

          {/* Input */}
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
              onChange={handleTyping}
            />
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
