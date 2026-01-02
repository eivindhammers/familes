/**
 * ChatManager Component
 * Manages one-to-one chat conversations with friends
 */

window.ChatManager = ({ 
  currentProfile,
  friendId,
  friendData,
  onClose,
  darkMode
}) => {
  const { useState, useEffect, useRef } = React;
  const { MessageSquare, Send, X } = window.Icons;
  const { getConversationId, sendMessage, loadMessages, markMessagesAsRead } = window;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const conversationId = getConversationId(currentProfile.id, friendId);
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load messages and mark as read
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = loadMessages(conversationId, (data) => {
      const messagesList = data ? Object.values(data).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      ) : [];
      setMessages(messagesList);
      
      // Mark messages as read whenever messages update (including new messages)
      markMessagesAsRead(conversationId, currentProfile.id);
    });
    
    return () => unsubscribe();
  }, [conversationId, currentProfile.id]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(conversationId, currentProfile.id, friendId, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('no-NO', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl flex flex-col max-h-[90vh] ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {friendData?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {friendData?.name || 'Venn'}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Level {friendData?.level || 1}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Messages area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {messages.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ingen meldinger ennå. Send den første!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentProfile.id;
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-800'
                  }`}>
                    <p className="break-words">{message.text}</p>
                    <div className={`text-xs mt-1 ${
                      isOwnMessage 
                        ? 'text-indigo-200' 
                        : darkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSendMessage} className={`p-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Skriv en melding..."
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300 text-gray-900'
              }`}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                !newMessage.trim() || isSending
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
