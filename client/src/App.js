import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const App = () => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const socket = useMemo(() => io("https://guff-ar6e.onrender.com"), []);
  const ringSound = useMemo(() => new Audio('/ring.mp3'), []);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Ask for notification permission
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          console.log('🔔 Notifications enabled');
        }
      });
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("recieved-message", ({ message, senderId }) => {
      setMessages(prev => [...prev, { message, senderId }]);

      if (senderId !== socket.id && document.hidden) {
        ringSound.play().catch((e) => console.log("Audio error:", e));
        if (Notification.permission === 'granted') {
          new Notification("New message 💬", {
            body: message,
            icon: '/chat-icon.png',
          });
        }
        document.title = "🔔 New message!";
        setTimeout(() => {
          document.title = "GuffHanum";
        }, 2000);
      }
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
  }, [socket, ringSound]);

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
    setShowEmojiPicker(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (roomId) {
      socket.emit("typing", { roomId, senderId: socket.id });
    }
  };

  // Emoji picker handler
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="container-fluid vh-100 bg-light d-flex flex-column">

      {/* Mobile Join Bar */}
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

        {/* Chat Area */}
        <div className="col-12 col-md-9 d-flex flex-column p-0">

          {/* Header */}
          <div className="bg-primary text-white px-3 py-2">
            <h6 className="mb-0">Room: {roomId || "Not joined"}</h6>
          </div>

          {/* Messages Area */}
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

              {/* Typing Indicator */}
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

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="d-flex border-top p-2 bg-white flex-column flex-md-row align-items-start align-items-md-center"
            style={{ flexShrink: 0, position: 'relative' }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary me-2 mb-2 mb-md-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>

            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary px-4 fw-semibold">
              Send
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div style={{ position: 'absolute', bottom: '50px', left: '50px', zIndex: 999 }}>
                <EmojiPicker onEmojiClick={onEmojiClick} height={300} />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
