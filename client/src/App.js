import React, { useEffect,useMemo,useState} from 'react'
import {io} from 'socket.io-client'
const App = () => {
  const [message, setMessage] = useState('');
  const [roomId,setRoomId]= useState('');
  const [messages,setMessages]=useState([]);
  const [id,setId] = useState("");
  const socket = useMemo( ()=>
      io("https://guff-ar6e.onrender.com")
  ,[])

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message",{message,roomId})
    setMessage(''); 
  };
  useEffect(()=>{
    socket.on("connect", ()=>{
      setId(socket.id)
      console.log("connected",socket.id);
    })
    socket.on("recieved-message",(m)=>{
      setMessages((messages)=> [...messages,m])
    })
     // eslint-disable-next-line
  },[])
   
  return ( 
    <div>
      <h1>HELLO PROGRAMMER!!</h1>
      <h6>{id}</h6>
       <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
         <input
          type="text"
          placeholder="room id..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Send</button>
      </form>
      <div>
        {
          messages.map((m,i)=>
            <li key={i}>{m}</li>
          )
        }
      </div>
    </div>
  )
}
export default App

