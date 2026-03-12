import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Instagram, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { cn } from './utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { items } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin && location.pathname !== '/admin/login') {
    return null; // Admin has its own sidebar
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Static<span className="text-emerald-500">Riot</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">SHOP</Link>
            <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">BRAND</Link>
            <Link to="/contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">CONTACT</Link>
          </div>

          <div className="flex items-center space-x-5">
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <Link to="/admin/login" className="text-zinc-400 hover:text-white transition-colors">
              <User size={20} />
            </Link>
            <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-colors">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-400 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-zinc-900 border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-bold text-white border-b border-white/5">SHOP</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-bold text-white border-b border-white/5">BRAND</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-bold text-white border-b border-white/5">CONTACT</Link>
              <Link to="/faq" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-bold text-white">FAQ</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-black tracking-tighter text-white uppercase italic mb-6 block">
              Static<span className="text-emerald-500">Riot</span>
            </Link>
            <p className="text-zinc-500 max-w-sm mb-8">
              Premium streetwear for the rebellious soul. Band tees, graphic statements, and high-quality essentials. Born in the noise, built for the riot.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-black transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-black transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-black transition-all">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Shop</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><Link to="/shop" className="hover:text-emerald-500 transition-colors">All Products</Link></li>
              <li><Link to="/shop?cat=band-tees" className="hover:text-emerald-500 transition-colors">Band T-Shirts</Link></li>
              <li><Link to="/shop?cat=funny-tees" className="hover:text-emerald-500 transition-colors">Funny T-Shirts</Link></li>
              <li><Link to="/shop?cat=graphic-tees" className="hover:text-emerald-500 transition-colors">Graphic Tees</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Support</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-xs">
          <p>© 2026 STATIC RIOT. ALL RIGHTS RESERVED.</p>
          <p className="mt-4 md:mt-0">DESIGNED FOR THE NOISE.</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
