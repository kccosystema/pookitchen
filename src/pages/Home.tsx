import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { formatPrice } from '../utils';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?status=published')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.slice(0, 4)));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Hero Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest mb-6">
              New Drop: The Anarchy Collection
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.9] mb-8">
              Wear the <br />
              <span className="text-transparent stroke-white stroke-1" style={{ WebkitTextStroke: '1px white' }}>Riot.</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
              Premium graphic tees for those who refuse to blend in. Limited runs. Bold statements. High-quality noise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 transition-all transform hover:scale-105">
                Shop Collection
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest mb-2">Premium Quality</h3>
              <p className="text-zinc-500 text-sm">100% heavyweight cotton. Pre-shrunk. Built to survive the mosh pit.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest mb-2">Fast Shipping</h3>
              <p className="text-zinc-500 text-sm">Worldwide shipping. Tracked from our warehouse to your door.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center text-emerald-500 shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest mb-2">Secure Riot</h3>
              <p className="text-zinc-500 text-sm">Encrypted checkout. 30-day returns if you're not feeling the vibe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Featured Drops</h2>
              <p className="text-zinc-500">The latest statements from the underground.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden mb-6">
                    <img 
                      src={product.featured_image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      alt={product.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                        {product.category_name}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-1 group-hover:text-emerald-500 transition-colors">{product.title}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-bold">{formatPrice(product.base_price)}</span>
                    {product.compare_at_price && (
                      <span className="text-zinc-600 line-through text-sm">{formatPrice(product.compare_at_price)}</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )) : (
              // Skeleton/Placeholder
              [1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-900 mb-6"></div>
                  <div className="h-6 bg-zinc-900 w-3/4 mb-2"></div>
                  <div className="h-4 bg-zinc-900 w-1/4"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/shop?cat=band-tees" className="relative h-[500px] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
              alt="Band Tees"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
              <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Band Tees</h3>
              <p className="text-zinc-300 mb-6 max-w-xs">Official and unofficial tributes to the legends of noise.</p>
              <span className="w-fit px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest group-hover:bg-emerald-500 transition-colors">Explore</span>
            </div>
          </Link>
          <Link to="/shop?cat=graphic-tees" className="relative h-[500px] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
              alt="Graphic Tees"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
              <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Graphic Art</h3>
              <p className="text-zinc-300 mb-6 max-w-xs">Edgy statements and underground art for the modern rebel.</p>
              <span className="w-fit px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest group-hover:bg-emerald-500 transition-colors">Explore</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
