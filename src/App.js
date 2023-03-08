import { useState, useRef, useEffect } from 'react';
import './App.css';

function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMessage = { sender: 'user', text: userInput };
    setUserInput('');
    setMessages([...messages, newMessage]);
    try {
      const response = await fetch('http://localhost:4770/channels/rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data[0].text };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot">
      <div className="conversation">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'sent' : 'received'}`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form className="input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chatbot;
