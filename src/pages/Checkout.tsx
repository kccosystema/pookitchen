import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

const Checkout = () => {
  const { items, total } = useCart();
  const [step, setStep] = useState(1);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form Side */}
          <div>
            <Link to="/cart" className="flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors mb-12 text-xs font-bold uppercase tracking-widest">
              <ChevronLeft size={16} />
              <span>Back to Cart</span>
            </Link>

            <div className="space-y-12">
              <section>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-8 h-8 bg-emerald-500 text-black flex items-center justify-center font-black italic">1</div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Shipping Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">First Name</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Last Name</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Address</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">City</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Postal Code</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-black italic border border-white/10">2</div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-600">Payment Method</h2>
                </div>
                <div className="p-8 border border-white/5 bg-zinc-950 opacity-50">
                  <p className="text-zinc-500 text-sm">Complete shipping details to proceed to payment.</p>
                </div>
              </section>

              <button className="w-full bg-white text-black py-5 font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                Continue to Payment
              </button>
            </div>
          </div>

          {/* Summary Side */}
          <aside>
            <div className="bg-zinc-950 p-8 border border-white/5 sticky top-12">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Your Order</h3>
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-zinc-900 shrink-0 overflow-hidden">
                      <img src={item.image} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold uppercase tracking-tight">{item.title}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between text-zinc-500 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-sm">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between text-white font-black uppercase tracking-widest">
                  <span>Total</span>
                  <span className="text-2xl">{formatPrice(total + 10)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
