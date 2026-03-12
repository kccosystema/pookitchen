import React from 'react';
import { motion } from 'motion/react';

const About = () => {
  return (
    <div className="min-h-screen bg-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-8 leading-tight">
              Static <br />
              <span className="text-emerald-500">Riot.</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              We didn't start this to be another clothing brand. We started this because the world was getting too quiet. Static Riot is for the rebels, the noise-makers, and the ones who find beauty in the distortion.
            </p>
            <p className="text-zinc-500 mb-12">
              Every piece we drop is a statement. High-quality materials, underground designs, and a refusal to compromise. We don't follow trends; we build the riot.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Founded</h4>
                <p className="text-zinc-600 text-sm">2026, Underground</p>
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Mission</h4>
                <p className="text-zinc-600 text-sm">Design for the Noise</p>
              </div>
            </div>
          </motion.div>
          <div className="relative">
            <div className="aspect-[4/5] bg-zinc-900 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1964&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale"
                alt="Brand Vibe"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500 -z-10 hidden md:block"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
