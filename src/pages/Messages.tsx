import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  item_id: string;
  content: string;
  created_at: string;
  items: {
    title: string;
  };
  profiles: {
    email: string;
  };
}

interface Conversation {
  item_id: string;
  item_title: string;
  other_user_id: string;
  other_user_email: string;
  last_message: string;
  last_message_time: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          item_id,
          items:items(title),
          profiles:users!messages_sender_id_fkey1(email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const conversationsMap = new Map<string, Conversation>();

      messages?.forEach((message: Message) => {
        const isUserSender = message.sender_id === user.id;
        const conversationKey = `${message.item_id}-${isUserSender ? message.receiver_id : message.sender_id}`;

        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            item_id: message.item_id,
            item_title: message.items.title,
            other_user_id: isUserSender ? message.receiver_id : message.sender_id,
            other_user_email: message.profiles.email,
            last_message: message.content,
            last_message_time: message.created_at,
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, payload => {
        const newMessage = payload.new as Message;
        if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
          fetchConversations();
          if (selectedConversation?.item_id === newMessage.item_id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation || !user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('item_id', selectedConversation.item_id)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation.other_user_id}),and(sender_id.eq.${selectedConversation.other_user_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();
  }, [selectedConversation, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const message = {
      sender_id: user.id,
      receiver_id: selectedConversation.other_user_id,
      item_id: selectedConversation.item_id,
      content: newMessage.trim(),
    };

    const { error } = await supabase
      .from('messages')
      .insert(message);

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((conversation) => (
              <button
                key={`${conversation.item_id}-${conversation.other_user_id}`}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left ${
                  selectedConversation?.item_id === conversation.item_id &&
                  selectedConversation?.other_user_id === conversation.other_user_id
                    ? 'bg-gray-100'
                    : ''
                }`}
              >
                <div className="font-medium text-gray-800">{conversation.item_title}</div>
                <div className="text-sm text-gray-600">{conversation.other_user_email}</div>
                <div className="text-sm text-gray-500 truncate">{conversation.last_message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(conversation.last_message_time).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedConversation.item_title}
                </h3>
                <p className="text-sm text-gray-600">
                  Chatting with {selectedConversation.other_user_email}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
