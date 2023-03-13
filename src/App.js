import { useState, useRef, useEffect } from 'react';
import './App.css';
import './hamburger.css';
import { marked } from 'marked';

function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState('');
  const messageEndRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [endpoint, setEndpoint] = useState({
    alias: 'Local REST Endpoint',
    url: 'http://localhost:4770/channels/rest'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const newMessage = { sender: senderId, text: userInput };
    setUserInput('');
    setMessages([...messages, newMessage]);
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      const data = await response.json();
      const botMessages = data.flatMap((message) => {
        const parsedResponse = marked(message.text.replace(/\n/g, '<br>'));

        if (message.text && message.image) {
          return [
            { sender: 'bot', text: parsedResponse },
            { sender: 'bot', image: message.image },
          ];
        }
        return [{ sender: 'bot', text: parsedResponse, image: message.image }];
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

  const handleEndpointChange = (alias, url) => {
    setEndpoint({ alias, url });
    setMenuOpen(false);
  };

  return (
    <div className="chatbot">
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <div className={`menu ${menuOpen ? 'open' : ''}`} >
        <div className="endpoint-text">
          Select a chatbot.
          <br></br>
          Currently connected to:
          <br></br>
          <b>{endpoint.alias}</b>
        </div>
        <ul>
          <li>
            <button onClick={() =>
              handleEndpointChange('Local REST Endpoint', 'http://localhost:4770/channels/rest')
            }>Local REST Endpoint</button>
          </li>
          <li>
            <button onClick={() =>
              handleEndpointChange('Chatto Trivia Pro', 'https://us-central1-jaimeteb.cloudfunctions.net/chatto-trivia-pro-chatto-dev-rest')
            }>Chatto Trivia Pro</button>
          </li>
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
                <div dangerouslySetInnerHTML={{ __html: message.text }} />
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
