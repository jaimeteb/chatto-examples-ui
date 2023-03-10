import { useState, useRef, useEffect } from 'react';
import './App.css';
import './hamburger.css';

function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState('');
  const messageEndRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const newMessage = { sender: senderId, text: userInput };
    setUserInput('');
    setMessages([...messages, newMessage]);
    try {
      const response = await fetch('http://localhost:4770/channels/rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      const data = await response.json();
      const botMessages = data.flatMap((message) => {
        if (message.text && message.image) {
          return [
            { sender: 'bot', text: message.text },
            { sender: 'bot', image: message.image },
          ];
        }
        return [{ sender: 'bot', text: message.text, image: message.image }];
      });
      setMessages((prevMessages) => [...prevMessages, ...botMessages]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setSenderId(Math.random().toString(36).substring(2));
  }, []);

  return (
    <div className="chatbot">
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <div className="menu" style={{ display: menuOpen ? 'block' : 'none' }}>
        <ul>
          <li>Menu Item 1</li>
          <li>Menu Item 2</li>
          <li>Menu Item 3</li>
        </ul>
      </div>
      <div className="conversation">
        {messages.map((message, index) => {
          const isImageMessage = message.image;
          const messageClass = `message ${message.sender === senderId ? "sent" : "received"} ${isImageMessage ? "image" : ""}`;
          return (
            <div key={index} className={messageClass}>
              {isImageMessage ? (
                <img src={message.image} alt="message" />
              ) : (
                <span>{message.text}</span>
              )}
            </div>
          )
        })}
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
