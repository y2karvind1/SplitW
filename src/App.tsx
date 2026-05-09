import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { GroupView } from './components/GroupView';
import { LogIn, Split } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastActive: new Date().toISOString()
        }, { merge: true });
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-indigo-500"
        >
          <Split size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative mb-8 text-center">
          <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 glass flex items-center justify-center rounded-2xl">
                <Split size={40} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold font-display mb-4 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              Splitwise Pro
            </h1>
            <p className="text-slate-400 max-w-sm mx-auto">
              Smart expense sharing with AI-powered receipt scanning and debt simplification.
            </p>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={login}
          className="glass-button px-8 py-4 flex items-center gap-3 text-lg"
        >
          <LogIn size={20} />
          Sign in with Google
        </motion.button>
      </div>
    );
  }

  return (
    <Layout user={user} setActiveGroupId={setActiveGroupId}>
      <AnimatePresence mode="wait">
        {activeGroupId ? (
          <GroupView 
            key={activeGroupId} 
            groupId={activeGroupId} 
            onBack={() => setActiveGroupId(null)} 
          />
        ) : (
          <Dashboard key="dashboard" onGroupSelect={setActiveGroupId} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
