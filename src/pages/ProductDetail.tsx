import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft, ChevronRight, Share2, Ruler, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedColor(data.variants[0].color);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Product not found</div>;

  const images = product.images && product.images.length > 0 ? product.images : [{ url: product.featured_image }];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.base_price,
      image: product.featured_image,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });
    // Optional: Show success toast or redirect
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[activeImage].url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'} 
                className="w-full h-full object-cover grayscale"
                alt={product.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="w-10 h-10 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "aspect-square bg-zinc-900 overflow-hidden border-2 transition-all",
                    activeImage === idx ? "border-emerald-500" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img.url} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
                <Link to="/shop" className="hover:text-white">Shop</Link>
                <span>/</span>
                <Link to={`/shop?cat=${product.category_slug}`} className="hover:text-white">{product.category_name}</Link>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 leading-tight">{product.title}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-black text-white">{formatPrice(product.base_price)}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-zinc-600 line-through">{formatPrice(product.compare_at_price)}</span>
                )}
                {product.compare_at_price > product.base_price && (
                  <span className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">
                    Save {Math.round((1 - product.base_price / product.compare_at_price) * 100)}%
                  </span>
                )}
              </div>
              <p className="text-zinc-400 leading-relaxed mb-8">
                {product.description || "Premium heavyweight t-shirt featuring a custom Static Riot design. Built for durability and style. 100% cotton, pre-shrunk, and ready for whatever the night brings."}
              </p>
            </div>

            {/* Selectors */}
            <div className="space-y-8 mb-10">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-black uppercase tracking-widest text-xs">Select Size</h3>
                  <button className="flex items-center space-x-1 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <Ruler size={12} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "py-3 border text-xs font-black transition-all",
                        selectedSize === size ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-white/10 bg-zinc-900">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-emerald-500 text-black py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-white transition-all transform hover:scale-[1.02]"
              >
                <ShoppingBag size={20} />
                <span>Add to Cart</span>
              </button>
              <button className="w-full sm:w-16 h-16 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white transition-all">
                <Share2 size={20} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-emerald-500">
                  <Truck size={18} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  <p className="text-white">Fast Shipping</p>
                  <p className="text-zinc-500">2-4 Business Days</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-emerald-500">
                  <RefreshCw size={18} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  <p className="text-white">Easy Returns</p>
                  <p className="text-zinc-500">30-Day Window</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../utils';
export default ProductDetail;
