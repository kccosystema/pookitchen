import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo auth
    if (password === 'riot2026') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid access code. The riot is closed to you.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-white/5 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center text-emerald-500 mb-6 border border-white/10">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Admin Access</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Static Riot Control Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Access Code</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors pl-12" 
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

          <button className="w-full bg-white text-black py-5 font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
            Enter Dashboard
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-zinc-700 uppercase font-bold tracking-widest">
          Hint: riot2026
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
