import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getChatResponse, ChatMessage as OpenAIChatMessage } from '../lib/openai';
import { ChatMessage as DatabaseChatMessage } from '../types';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DatabaseChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<OpenAIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // If no messages exist, add a welcome message
      if (!data || data.length === 0) {
        const welcomeMessage: DatabaseChatMessage = {
          id: 'welcome',
          user_id: user.id,
          message: "Hi there! I'm here to help you navigate your mental wellbeing. How are you feeling today?",
          sender: 'bot',
          created_at: new Date().toISOString(),
          response: ''
        };
        setMessages([welcomeMessage]);
        // Initialize conversation history
        setConversationHistory([]);
      } else {
        setMessages(data);
        
        // Rebuild conversation history from database messages
        const history: OpenAIChatMessage[] = [];
        data.forEach(msg => {
          if (msg.sender === 'user') {
            history.push({ role: 'user', content: msg.message });
          } else if (msg.sender === 'bot') {
            history.push({ role: 'assistant', content: msg.message });
          }
        });
        setConversationHistory(history);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChatMessages();
    }
  }, [user]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages are added (not on initial load)
    if ((messages.length > 1 && !loading) || isBotTyping || isStreaming) {
      scrollToBottom();
    }
  }, [messages.length, loading, isBotTyping, isStreaming, streamingMessage]);

  const streamText = (text: string, callback: (complete: string) => void) => {
    setIsStreaming(true);
    setStreamingMessage('');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setStreamingMessage(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setStreamingMessage('');
        callback(text);
      }
    }, 25);
  };
  const handleSendMessage = async () => {
    if (!user) return;
    
    if (!inputMessage.trim() || sending || isBotTyping || isStreaming) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setIsBotTyping(true);
    setError(null);

    try {
      // Add user message to conversation history
      const newUserMessage: OpenAIChatMessage = { role: 'user', content: messageText };
      const updatedHistory = [...conversationHistory, newUserMessage];
      setConversationHistory(updatedHistory);

      // Save user message to database
      const { data: userMessageData, error: userError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: messageText,
          sender: 'user',
          response: ''
        })
        .select()
        .single();

      if (userError) throw userError;

      // Add user message to state immediately
      setMessages(prev => [...prev, userMessageData]);

      // Get AI response
      const botResponseText = await getChatResponse(updatedHistory);
      
      // Stop typing indicator and start streaming
      setIsBotTyping(false);
      
      // Add bot response to conversation history
      const newBotMessage: OpenAIChatMessage = { role: 'assistant', content: botResponseText };
      setConversationHistory([...updatedHistory, newBotMessage]);
      
      // Stream the bot response
      streamText(botResponseText, async (completeText) => {
        // Save bot response to database after streaming is complete
        const { data: botMessageData, error: botError } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: completeText,
            sender: 'bot',
            response: ''
          })
          .select()
          .single();

        if (botError) throw botError;

        // Add bot response to messages
        setMessages(prev => [...prev, botMessageData]);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Restore the input message if there was an error
      setInputMessage(messageText);
      // Revert conversation history on error
      setConversationHistory(conversationHistory);
    } finally {
      setSending(false);
      setIsBotTyping(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-app flex flex-col transition-colors duration-200 min-h-screen">
      {/* Header */}
      <div className="bg-app-light px-4 py-3 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="flex justify-center items-center w-full">
          <h1 className="text-xl font-bold text-app transition-colors duration-200">Chat</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32 pt-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {loading && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-app-muted mt-2">Loading messages...</p>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger rounded-lg p-4 mb-4 mx-auto max-w-md">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.sender === 'bot' ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' ? 'bg-warning/20' : 'bg-primary'
                }`}>
                  {message.sender === 'bot' ? (
                    <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-secondary/70 rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-3 py-2 ${
                  message.sender === 'bot' 
                    ? 'bg-app-light text-app' 
                    : 'bg-primary text-white'
                }`}>
                  {message.sender === 'bot' ? (
                    <div className="text-sm leading-relaxed prose prose-sm prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Bot Typing Indicator */}
          {isBotTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[85%]">
                {/* Bot Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-warning/20">
                  <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Typing Indicator */}
                <div className="bg-app-light rounded-2xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
                      <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1.5s' }}></div>
                      <div className="w-2 h-2 bg-app-muted rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1.5s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Streaming Bot Response */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[85%]">
                {/* Bot Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-warning/20">
                  <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Streaming Message */}
                <div className="bg-app-light text-app rounded-2xl px-3 py-2">
                  <div className="text-sm leading-relaxed prose prose-sm prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 right-0 bg-app-light border-t border-app-muted px-4 py-3 transition-colors duration-200 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-app-dark text-app placeholder-app-muted rounded-full border-none outline-none text-sm transition-colors duration-200 focus:ring-2 focus:ring-primary shadow-sm"
                disabled={sending || loading || isBotTyping || isStreaming}
              />
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={sending || loading || isBotTyping || isStreaming || !inputMessage.trim()}
              className="p-2 text-app-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {sending || isBotTyping || isStreaming ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;