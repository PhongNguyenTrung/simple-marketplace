import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  seller_id: string;
  created_at: string;
  status: string;
}

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Fetch item details
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const sendMessage = async () => {
    if (!user || !item) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: item.seller_id,
          item_id: item.id,
          content: message
        });

      if (error) throw error;
      setMessage('');
      alert('Message sent successfully!');
    } catch (err: any) {
      alert('Error sending message: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading item: {error || 'Item not found'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          {item.image_url && (
            <img
              className="h-48 w-full object-cover md:h-full md:w-96"
              src={item.image_url}
              alt={item.title}
            />
          )}
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-xl text-indigo-600">${item.price}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          <p className="mt-4 text-gray-600">{item.description}</p>

          {user && user.id !== item.seller_id && item.status === 'available' && (
            <div className="mt-6">
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    placeholder="Send a message to the seller..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={sendMessage}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send
                </button>
              </div>
            </div>
          )}

          {!user && (
            <p className="mt-6 text-sm text-gray-500">
              Please sign in to contact the seller.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
