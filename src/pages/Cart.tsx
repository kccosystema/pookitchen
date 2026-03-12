import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-zinc-900 flex items-center justify-center text-zinc-700 mb-8">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8 text-center max-w-xs">The riot hasn't started yet. Add some gear to your cart to get going.</p>
        <Link to="/shop" className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-12">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-6 pb-8 border-b border-white/5"
              >
                <div className="w-24 sm:w-32 aspect-[3/4] bg-zinc-900 shrink-0 overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover grayscale" alt={item.title} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold uppercase tracking-tight">{item.title}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
                    Size: {item.size} {item.color && `| Color: ${item.color}`}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center border border-white/10 bg-zinc-900">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <aside>
            <div className="bg-zinc-950 p-8 border border-white/5 sticky top-32">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-zinc-500 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-500 uppercase font-black text-[10px] tracking-widest">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between text-white font-black uppercase tracking-widest">
                  <span>Total</span>
                  <span className="text-2xl">{formatPrice(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="w-full bg-white text-black py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-emerald-500 transition-all">
                <span>Checkout</span>
                <ArrowRight size={20} />
              </Link>
              <p className="mt-6 text-center text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                Secure checkout powered by Static Riot
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
