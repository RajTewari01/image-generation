'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Image as ImageIcon, Sparkles, Download, Palette } from 'lucide-react';
import FluidBackground, { ThemeName, THEMES } from '@/components/FluidBackground';
import { 
  fetchPipelines, 
  submitGeneration, 
  pollJobStatus,
  PipelinesResponse,
  ASSET_BASE_URL
} from '@/api/client';

export default function Home() {
  const [pipelines, setPipelines] = useState<PipelinesResponse | null>(null);
  const [activePipeline, setActivePipeline] = useState('');
  const [activeType, setActiveType] = useState('');
  const [prompt, setPrompt] = useState('a futuristic cyberpunk city skyline at night, extreme wide shot, hyper realistic');
  const [negativePrompt, setNegativePrompt] = useState('blurry, deformed, low quality');
  
  // Custom Apple Ecosystem Theme
  const [appTheme, setAppTheme] = useState<ThemeName>('Monterey');

  // Dimensions
  const [aspectRatio, setAspectRatio] = useState<'square'|'portrait'|'landscape'>('square');
  const getDims = () => {
    switch(aspectRatio) {
      case 'square': return { w: 512, h: 512 };
      case 'landscape': return { w: 768, h: 512 };
      case 'portrait': return { w: 512, h: 768 };
    }
  };

  const [steps, setSteps] = useState(25);
  const [cfg, setCfg] = useState(7.0);

  // App State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPipelines().then(data => {
      setPipelines(data);
      if (Object.keys(data.pipelines).length > 0) {
        const first = Object.keys(data.pipelines)[0];
        setActivePipeline(first);
        const types = Object.keys(data.pipelines[first].types || {});
        if (types.length > 0) setActiveType(types[0]);
      }
    }).catch(e => {
      console.warn("Backend not detected yet. Start the FastAPI server to populate the AI engines.", e);
    });
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!activePipeline || isGenerating) return;
    setIsGenerating(true);
    setProgress(0);
    setStatusText('Warming up core engine...');
    setCurrentImage(null);
    
    try {
      const { w, h } = getDims();
      const jobId = await submitGeneration({
        pipeline: activePipeline,
        style_type: activeType || undefined,
        prompt,
        negative_prompt: negativePrompt,
        width: w,
        height: h,
        steps,
        cfg
      });
      
      pollingRef.current = setInterval(async () => {
        try {
          const job = await pollJobStatus(jobId);
          setProgress(job.progress * 100);
          
          if (job.status === 'processing') {
            setStatusText('Rendering active tensor graph...');
          } else if (job.status === 'completed') {
            clearInterval(pollingRef.current!);
            setIsGenerating(false);
            if (job.image_url) {
              setCurrentImage(ASSET_BASE_URL + job.image_url);
            }
          } else if (job.status === 'failed') {
            clearInterval(pollingRef.current!);
            setIsGenerating(false);
            setStatusText('Failed: ' + job.error);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1500);
      
    } catch (err: any) {
      setStatusText('Error: ' + err.message);
      setIsGenerating(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* 🌌 Dynamic WebGL Fluid Background */}
      <FluidBackground theme={appTheme} />

      {/* Floating Theme Selector */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-neutral-900/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl">
        <Palette className="w-4 h-4 text-neutral-400" />
        <select 
          value={appTheme} 
          onChange={e => setAppTheme(e.target.value as ThemeName)}
          className="bg-transparent text-sm font-medium text-neutral-200 focus:outline-none cursor-pointer appearance-none pr-2"
        >
          {(Object.keys(THEMES) as Array<ThemeName>).map(theme => (
            <option key={theme} value={theme} className="bg-neutral-900 py-1">{theme} Theme</option>
          ))}
        </select>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row p-2 sm:p-4 gap-4 md:gap-6 pt-[80px] md:pt-4">
        
        {/* ✨ SIDEBAR (Apple-like Glassmorphism) */}
        <motion.aside 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full md:w-80 flex-none h-auto md:h-full flex flex-col gap-4 md:gap-6 p-4 md:p-6 rounded-3xl bg-neutral-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-y-auto"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-lg leading-tight">Image Gen Lite</h1>
              <p className="text-xs font-medium text-neutral-400">Made by Biswadeep Tewari</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">


            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Engine Pipeline</label>
              <select 
                value={activePipeline} 
                onChange={e => {
                  setActivePipeline(e.target.value);
                  const t = pipelines?.pipelines[e.target.value]?.types || {};
                  setActiveType(Object.keys(t)[0] || '');
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                {pipelines && Object.keys(pipelines.pipelines).map(p => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {pipelines?.pipelines[activePipeline]?.types && Object.keys(pipelines.pipelines[activePipeline].types).length > 0 && (
              <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Style Matrix</label>
                <select 
                  value={activeType} 
                  onChange={e => setActiveType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  {Object.entries(pipelines.pipelines[activePipeline].types).map(([k, desc]) => (
                    <option key={k} value={k}>{k} - {String(desc)}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Prompting */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Prompt</label>
              <textarea 
                value={prompt} onChange={e => setPrompt(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Describe your vision..."
              />
            </div>

            {/* Grid Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Steps</label>
                <input type="number" value={steps} onChange={e => setSteps(Number(e.target.value))} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-center" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">CFG</label>
                <input type="number" step="0.5" value={cfg} onChange={e => setCfg(Number(e.target.value))} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-center" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['square', 'landscape', 'portrait'] as const).map(ar => (
                  <button 
                    key={ar} onClick={() => setAspectRatio(ar)}
                    className={'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ' + (aspectRatio === ar ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' : 'bg-black/20 border-white/5 text-neutral-400 hover:bg-black/40')}
                  >
                    {ar.charAt(0).toUpperCase() + ar.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !activePipeline}
            className={'py-4 rounded-xl font-semibold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ' + (isGenerating ? 'bg-white/5 text-neutral-500 cursor-not-allowed' : 'bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98]')}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? 'GENERATING...' : 'SYNTHESIZE'}
          </button>
        </motion.aside>

        {/* 🖼️ CANVAS AREA (Framer Motion Layouts) */}
        <section className="flex-1 h-full flex flex-col items-center justify-center relative">
          <motion.div 
            layout 
            className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/5 shadow-2xl"
            style={{ 
              width: aspectRatio === 'landscape' ? 768 : 512, 
              height: aspectRatio === 'portrait' ? 768 : 512 
            }}
          >
            <AnimatePresence mode="wait">
              {!isGenerating && !currentImage && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 text-neutral-500"
                >
                  <ImageIcon className="w-12 h-12 opacity-50" />
                  <p className="tracking-wide">Awaiting parameters</p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-0 bg-neutral-950/80 backdrop-blur flex flex-col items-center justify-center gap-6 z-20"
                >
                  <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      initial={{ width: "0%" }}
                      animate={{ width: String(progress) + "%" }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                  <motion.p 
                    animate={{ opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-sm font-medium tracking-widest text-indigo-200 uppercase"
                  >
                    {statusText}
                  </motion.p>
                </motion.div>
              )}

              {currentImage && !isGenerating && (
                <motion.img 
                  key="result"
                  src={currentImage}
                  initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover"
                />
              )}
            </AnimatePresence>

            {/* Hover actions when image exists */}
            {currentImage && !isGenerating && (
                 <motion.div 
                 initial={{ opacity: 0 }}
                 whileHover={{ opacity: 1 }}
                 className="absolute inset-0 bg-black/40 opacity-0 transition-opacity flex items-end justify-end p-6"
               >
                 <a href={currentImage} download="generation.png" className="p-3 bg-white/10 backdrop-blur rounded-xl hover:bg-white text-white hover:text-black transition-colors shadow-lg">
                    <Download className="w-5 h-5" />
                 </a>
               </motion.div>
            )}
          </motion.div>
        </section>

      </div>
    </main>
  );
}
