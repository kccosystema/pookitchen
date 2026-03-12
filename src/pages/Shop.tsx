import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../utils';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const categorySlug = searchParams.get('cat');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products?status=published').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      let filtered = productsData;
      if (categorySlug) {
        filtered = productsData.filter((p: any) => p.category_slug === categorySlug || p.category_name.toLowerCase().replace(/ /g, '-') === categorySlug);
      }
      setProducts(filtered);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-4">
            {categorySlug ? categorySlug.replace('-', ' ') : 'All Products'}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-zinc-500">Showing {products.length} results for your riot.</p>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-white/10 text-sm font-bold uppercase tracking-widest hover:border-emerald-500 transition-colors"
              >
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-white/10 text-sm font-bold uppercase tracking-widest hover:border-emerald-500 transition-colors">
                  <span>Sort By</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className={cn("lg:block", filterOpen ? "block" : "hidden")}>
            <div className="space-y-10">
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/shop" className={cn("text-sm transition-colors", !categorySlug ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-white")}>
                      All Collections
                    </Link>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link to={`/shop?cat=${cat.slug}`} className={cn("text-sm transition-colors", categorySlug === cat.slug ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-white")}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => (
                    <button key={size} className="py-2 bg-zinc-900 border border-white/5 text-xs font-bold hover:border-emerald-500 transition-colors">
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Price Range</h3>
                <div className="space-y-4">
                  <input type="range" className="w-full accent-emerald-500" min="0" max="100" />
                  <div className="flex justify-between text-xs text-zinc-500 font-bold">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-zinc-900 mb-6"></div>
                    <div className="h-6 bg-zinc-900 w-3/4 mb-2"></div>
                    <div className="h-4 bg-zinc-900 w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        {product.compare_at_price > product.base_price && (
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">
                              Sale
                            </span>
                          </div>
                        )}
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
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10">
                <p className="text-zinc-500 uppercase tracking-widest font-bold">No products found in this riot.</p>
                <Link to="/shop" className="mt-4 inline-block text-emerald-500 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../utils';
export default Shop;
