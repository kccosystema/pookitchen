import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-4">Contact the Riot</h1>
          <p className="text-zinc-500 uppercase tracking-widest font-bold text-sm">Need help? Want to collaborate? Just want to scream into the void?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 border border-white/10 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-2">Email Us</h3>
                <p className="text-zinc-500 text-sm">riot@staticriot.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 border border-white/10 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-2">Call Us</h3>
                <p className="text-zinc-500 text-sm">+1 (555) 666-RIOT</p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 border border-white/10 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-2">Headquarters</h3>
                <p className="text-zinc-500 text-sm">The Underground, New York, NY</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border border-white/5 p-10">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Name</label>
                  <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                  <input type="email" className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Subject</label>
                <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Message</label>
                <textarea rows={6} className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors resize-none" />
              </div>
              <button className="w-full bg-white text-black py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-emerald-500 transition-all">
                <Send size={20} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
