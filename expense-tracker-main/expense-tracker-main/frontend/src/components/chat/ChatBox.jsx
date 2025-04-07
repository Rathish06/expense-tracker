import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ChatBox = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        
        // Add user message to chat
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        
        setIsLoading(true);
        try {
            // Since there's no chat endpoint in the backend,
            // we'll just simulate a response
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: 'This is a simulated response. The chat API is not yet implemented.' 
                }]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'Sorry, there was an error processing your request.' 
            }]);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-lg shadow-lg h-[500px]">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-indigo-600 text-white rounded-t-lg">
                <h3 className="text-lg font-medium">Financial Assistant</h3>
                <p className="text-sm opacity-75">Ask me anything about your finances!</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${
                            message.type === 'user' ? 'text-right' : 'text-left'
                        }`}
                    >
                        <div
                            className={`inline-block p-3 rounded-lg ${
                                message.type === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : message.type === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-500">
                        <div className="animate-bounce">•</div>
                        <div className="animate-bounce delay-100">•</div>
                        <div className="animate-bounce delay-200">•</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about your finances..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>

            {/* Example Questions */}
            <div className="p-4 bg-gray-50 rounded-b-lg">
                <p className="text-sm text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        "How much did I spend last month?",
                        "What's my budget status?",
                        "Show my spending trends"
                    ].map((question, index) => (
                        <button
                            key={index}
                            onClick={() => setInputMessage(question)}
                            className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatBox; 