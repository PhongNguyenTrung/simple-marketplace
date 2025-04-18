import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Store, Search, MessageCircle, LogIn, UserPlus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Components will be implemented in subsequent steps
import Home from './pages/Home';
import Auth from './pages/Auth';
import NewItem from './pages/NewItem';
import Messages from './pages/Messages';
import ItemDetail from './pages/ItemDetail';

function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Store className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Marketplace</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/new-item" className="flex items-center text-gray-600 hover:text-gray-900">
                  <Plus className="h-5 w-5" />
                  <span className="ml-1">Sell</span>
                </Link>
                <Link to="/messages" className="flex items-center text-gray-600 hover:text-gray-900">
                  <MessageCircle className="h-5 w-5" />
                  <span className="ml-1">Messages</span>
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="flex items-center text-gray-600 hover:text-gray-900">
                  <LogIn className="h-5 w-5" />
                  <span className="ml-1">Sign In</span>
                </Link>
                <Link to="/auth?mode=signup" className="flex items-center text-gray-600 hover:text-gray-900">
                  <UserPlus className="h-5 w-5" />
                  <span className="ml-1">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/new-item" element={<NewItem />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;