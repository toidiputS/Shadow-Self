import React, { useState } from "react";
import { X, Palette, Contrast, Sun, Moon, Sparkles, Check, Droplets, HardDrive, Layout, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const PROTOCOL_PRESETS = [
  { 
    id: 'alpha-core', 
    name: 'Alpha Core', 
    hue: 210, 
    sat: '15%', 
    light: '88%', 
    icon: <HardDrive className="w-4 h-4" />,
    description: 'The standard institutional baseline. Clean, balanced, and authoritative.'
  },
  { 
    id: 'veracity', 
    name: 'Veracity', 
    hue: 155, 
    sat: '20%', 
    light: '88%', 
    icon: <Check className="w-4 h-4" />,
    description: 'High-compliance clinical environment. Focused on clarity and health.'
  },
  { 
    id: 'blood-moon', 
    name: 'Blood Moon', 
    hue: 355, 
    sat: '25%', 
    light: '15%', 
    icon: <Sparkles className="w-4 h-4" />,
    description: 'High-stakes shadow work mode. Deep contrast and focused intensity.'
  },
  { 
    id: 'stealth', 
    name: 'Stealth', 
    hue: 220, 
    sat: '10%', 
    light: '12%', 
    icon: <Moon className="w-4 h-4" />,
    description: 'Minimum visual footprint. Designed for long-term monitoring cycles.'
  },
  { 
    id: 'neon-flux', 
    name: 'Neon Flux', 
    hue: 280, 
    sat: '40%', 
    light: '88%', 
    icon: <Droplets className="w-4 h-4" />,
    description: 'Vibrant resource-heavy interface. High engagement protocol.'
  },
];

export default function ThemeSidebar({ isOpen, onClose }) {
  const [activePreset, setActivePreset] = useState('alpha-core');

  const updateVar = (name, value) => {
    document.documentElement.style.setProperty(name, value);
    // Set data attribute to indicate manual override of dark mode
    if (name === '--light') {
        document.documentElement.setAttribute('data-theme', parseInt(value) < 40 ? 'dark' : 'light');
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    updateVar('--hue', preset.hue);
    updateVar('--sat', preset.sat);
    updateVar('--light', preset.light);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />
          
          {/* Sidebar */}
          <MotionDiv
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-(--bg-color) border-l border-white/5 nm-flat shadow-2xl z-101 p-8 md:p-12 overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
                   <Layout className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest leading-none">System Style</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Orchestration Module</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl nm-button flex items-center justify-center group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="space-y-12">
              {/* Appearance Mode */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Contrast className="w-4 h-4 opacity-40" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Base Luminance Protocol</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => updateVar('--light', '88%')}
                    className="p-5 rounded-2xl nm-button flex flex-col items-center gap-3 group"
                  >
                    <Sun className="w-6 h-6 text-yellow-500/60 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Light Core</span>
                  </button>
                  <button 
                    onClick={() => updateVar('--light', '15%')}
                    className="p-5 rounded-2xl nm-button flex flex-col items-center gap-3 group"
                  >
                    <Moon className="w-6 h-6 text-blue-400/60 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Stealth Node</span>
                  </button>
                </div>
              </section>

              {/* Hue Orchestration */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 opacity-40" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Hue Orchestration</h3>
                  </div>
                  <RefreshCw className="w-3.5 h-3.5 opacity-20 hover:opacity-50 transition-opacity cursor-pointer" onClick={() => updateVar('--hue', '210')} />
                </div>
                <div className="nm-inset-sm p-6 rounded-3xl">
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    defaultValue="210"
                    onChange={(e) => updateVar('--hue', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-linear-to-r from-red-500 via-green-500 to-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-tighter opacity-30">
                    <span>0° Spectral</span>
                    <span>180° Midpoint</span>
                    <span>360° Reset</span>
                  </div>
                </div>
              </section>

              {/* Protocol Presets */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-4 h-4 opacity-40" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Protocol Presets</h3>
                </div>
                <div className="space-y-4">
                  {PROTOCOL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`w-full p-5 rounded-3xl flex items-start gap-4 transition-all duration-300 ${
                        activePreset === preset.id 
                        ? 'nm-inset border border-blue-500/20' 
                        : 'nm-button border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center shrink-0 ${activePreset === preset.id ? 'text-blue-500' : 'opacity-40'}`}>
                        {preset.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-widest">{preset.name}</p>
                          {activePreset === preset.id && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <p className="text-[10px] opacity-40 mt-1 leading-relaxed font-medium">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 opacity-20 text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.4rem]">Shadow Self — Styling Kernel v1.2</p>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}
