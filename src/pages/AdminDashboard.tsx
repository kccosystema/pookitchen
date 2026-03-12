import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Image as ImageIcon, Plus, 
  Settings, LogOut, ChevronRight, Save, Upload, 
  CheckCircle2, AlertCircle, Move, Maximize, RotateCw, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeShirtPlacement } from '../services/aiService';
import { formatPrice, slugify, cn } from '../utils';

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ImageIcon, label: 'Model Images', path: '/admin/models' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-white/5">
        <Link to="/" className="text-xl font-black tracking-tighter text-white uppercase italic">
          Static<span className="text-emerald-500">Riot</span>
        </Link>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Admin Panel</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all",
              location.pathname === item.path ? "bg-white text-black" : "text-zinc-500 hover:text-white hover:bg-zinc-900"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all w-full"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// --- Pages ---

const DashboardHome = () => {
  const [stats, setStats] = useState({ products: 0, models: 0, designs: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/model-images').then(res => res.json()),
      fetch('/api/design-assets').then(res => res.json())
    ]).then(([products, models, designs]) => {
      setStats({
        products: products.length,
        models: models.length,
        designs: designs.length
      });
    });
  }, []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Dashboard</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Welcome back to the riot control.</p>
        </div>
        <Link to="/admin/products/new" className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-white transition-all">
          <Plus size={16} />
          <span>New Product</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { label: 'Total Products', value: stats.products, icon: Package },
          { label: 'Model Images', value: stats.models, icon: ImageIcon },
          { label: 'Design Assets', value: stats.designs, icon: ImageIcon },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-950 border border-white/5 p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-emerald-500 border border-white/10">
                <stat.icon size={20} />
              </div>
              <span className="text-zinc-800 font-black text-4xl">0{i+1}</span>
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black italic tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 p-8">
        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-zinc-600 text-sm italic">No recent activity to show. Start building the riot.</p>
        </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Products</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Manage your inventory and drops.</p>
        </div>
        <Link to="/admin/products/new" className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-white transition-all">
          <Plus size={16} />
          <span>New Product</span>
        </Link>
      </div>

      <div className="bg-zinc-950 border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-900/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Price</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-zinc-900 shrink-0 overflow-hidden">
                      <img src={product.featured_image} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-bold uppercase tracking-tight text-sm">{product.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{product.category_name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold">{formatPrice(product.base_price)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 text-[8px] font-black uppercase tracking-widest",
                    product.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                  )}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <Settings size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MockupGenerator = ({ onComplete }: { onComplete: (imageUrl: string) => void }) => {
  const [step, setStep] = useState(1);
  const [models, setModels] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [placement, setPlacement] = useState({ x: 35, y: 25, width: 30, height: 40, rotation: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch('/api/model-images').then(res => res.json()).then(setModels);
    fetch('/api/design-assets').then(res => res.json()).then(setDesigns);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedModel) return;
    setAnalyzing(true);
    const result = await analyzeShirtPlacement(selectedModel.url);
    setPlacement(result);
    setAnalyzing(false);
    setStep(3);
  };

  const drawMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedModel || !selectedDesign) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const modelImg = new Image();
    modelImg.crossOrigin = "anonymous";
    modelImg.src = selectedModel.url;
    modelImg.onload = () => {
      canvas.width = modelImg.width;
      canvas.height = modelImg.height;
      ctx.drawImage(modelImg, 0, 0);

      const designImg = new Image();
      designImg.crossOrigin = "anonymous";
      designImg.src = selectedDesign.url;
      designImg.onload = () => {
        const dx = (placement.x / 100) * canvas.width;
        const dy = (placement.y / 100) * canvas.height;
        const dw = (placement.width / 100) * canvas.width;
        const dh = (placement.height / 100) * canvas.height;

        ctx.save();
        ctx.translate(dx + dw / 2, dy + dh / 2);
        ctx.rotate((placement.rotation * Math.PI) / 180);
        ctx.globalAlpha = 0.9; // Slight blend
        ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      };
    };
  };

  useEffect(() => {
    if (step === 3) drawMockup();
  }, [step, placement, selectedModel, selectedDesign]);

  const saveMockup = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onComplete(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="bg-zinc-900 p-8 border border-white/10">
      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
              step >= i ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-600"
            )}>{i}</div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              step >= i ? "text-white" : "text-zinc-600"
            )}>
              {i === 1 ? 'Model' : i === 2 ? 'Design' : 'Adjust'}
            </span>
            {i < 3 && <ChevronRight size={12} className="text-zinc-700" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6">Choose Model Image</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {models.map(m => (
              <button 
                key={m.id} 
                onClick={() => setSelectedModel(m)}
                className={cn(
                  "aspect-[3/4] bg-zinc-950 border-2 overflow-hidden transition-all",
                  selectedModel?.id === m.id ? "border-emerald-500" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <img src={m.url} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
            <button className="aspect-[3/4] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 hover:text-white hover:border-white transition-all">
              <Upload size={24} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Upload New</span>
            </button>
          </div>
          <button 
            disabled={!selectedModel}
            onClick={() => setStep(2)}
            className="w-full bg-white text-black py-4 font-black uppercase tracking-widest disabled:opacity-50"
          >
            Next Step
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6">Choose Design Asset</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {designs.map(d => (
              <button 
                key={d.id} 
                onClick={() => setSelectedDesign(d)}
                className={cn(
                  "aspect-square bg-zinc-950 border-2 p-4 transition-all",
                  selectedDesign?.id === d.id ? "border-emerald-500" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <img src={d.url} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
            <button className="aspect-square border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 hover:text-white hover:border-white transition-all">
              <Upload size={24} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Upload New</span>
            </button>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-white py-4 font-black uppercase tracking-widest">Back</button>
            <button 
              disabled={!selectedDesign}
              onClick={handleAnalyze}
              className="flex-1 bg-emerald-500 text-black py-4 font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {analyzing ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span>Analyze & Place</span>}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6">Adjust Placement</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="relative aspect-[3/4] bg-zinc-950 border border-white/10 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center space-x-2">
                  <Move size={12} />
                  <span>Position (X & Y)</span>
                </label>
                <div className="space-y-4">
                  <input type="range" value={placement.x} onChange={e => setPlacement({...placement, x: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
                  <input type="range" value={placement.y} onChange={e => setPlacement({...placement, y: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center space-x-2">
                  <Maximize size={12} />
                  <span>Scale</span>
                </label>
                <input type="range" value={placement.width} onChange={e => setPlacement({...placement, width: parseInt(e.target.value), height: parseInt(e.target.value) * 1.3})} className="w-full accent-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center space-x-2">
                  <RotateCw size={12} />
                  <span>Rotation</span>
                </label>
                <input type="range" min="-45" max="45" value={placement.rotation} onChange={e => setPlacement({...placement, rotation: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
              </div>
              <div className="pt-6 border-t border-white/5">
                <button onClick={saveMockup} className="w-full bg-emerald-500 text-black py-4 font-black uppercase tracking-widest flex items-center justify-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>Approve Mockup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewProduct = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 1,
    base_price: 35,
    compare_at_price: 45,
    status: 'draft'
  });
  const [mockups, setMockups] = useState<string[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, slug: slugify(formData.title) })
    });
    const { id } = await res.json();
    
    // Save mockups
    for (const m of mockups) {
      await fetch(`/api/products/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: m, is_mockup: true })
      });
    }

    navigate('/admin/products');
  };

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">New Product</h1>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Create a new drop for the riot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-950 border border-white/5 p-8 space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Core Details</h3>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Product Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" 
                placeholder="e.g. ANARCHY LOGO TEE"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors resize-none" 
                placeholder="Tell the story of this piece..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                <select 
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                  className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors appearance-none"
                >
                  <option value={1}>Band T-Shirts</option>
                  <option value={2}>Funny T-Shirts</option>
                  <option value={3}>Graphic T-Shirts</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors appearance-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Product Mockups</h3>
              <button 
                onClick={() => setShowGenerator(true)}
                className="px-4 py-2 bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-colors flex items-center space-x-2"
              >
                <ImageIcon size={14} />
                <span>Generate Mockup</span>
              </button>
            </div>

            {showGenerator && (
              <div className="mb-8">
                <MockupGenerator onComplete={(url) => {
                  setMockups([...mockups, url]);
                  setShowGenerator(false);
                }} />
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              {mockups.map((m, i) => (
                <div key={i} className="relative aspect-[3/4] bg-zinc-900 overflow-hidden group">
                  <img src={m} className="w-full h-full object-cover grayscale" alt="" />
                  <button 
                    onClick={() => setMockups(mockups.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {mockups.length === 0 && !showGenerator && (
                <div className="col-span-4 py-12 text-center border border-dashed border-white/10">
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No mockups generated yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-zinc-950 border border-white/5 p-8 space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Pricing</h3>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Base Price ($)</label>
              <input 
                type="number" 
                value={formData.base_price}
                onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Compare At ($)</label>
              <input 
                type="number" 
                value={formData.compare_at_price}
                onChange={e => setFormData({...formData, compare_at_price: parseFloat(e.target.value)})}
                className="w-full bg-zinc-900 border border-white/10 px-4 py-4 text-white focus:border-emerald-500 outline-none transition-colors" 
              />
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 p-8">
            <button 
              onClick={handleSave}
              className="w-full bg-white text-black py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-emerald-500 transition-all"
            >
              <Save size={20} />
              <span>Save Product</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = localStorage.getItem('admin_auth');

  useEffect(() => {
    if (!auth) navigate('/admin/login');
  }, [auth, navigate]);

  if (!auth) return null;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<NewProduct />} />
          {/* Other routes as needed */}
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
