import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Sun, Moon, Zap, Shield, Droplets, Flame } from "lucide-react";

const PRESET_THEMES = [
  { name: "Alpha Core", hue: 210, sat: "15%", light: "88%", icon: Shield, color: "text-blue-500" },
  { name: "Veracity", hue: 145, sat: "20%", light: "85%", icon: Droplets, color: "text-emerald-500" },
  { name: "Blood Moon", hue: 0, sat: "25%", light: "85%", icon: Flame, color: "text-red-500" },
  { name: "Stealth", hue: 210, sat: "5%", light: "15%", icon: Moon, color: "text-gray-400" },
  { name: "Neon Flux", hue: 280, sat: "40%", light: "18%", icon: Zap, color: "text-purple-500" },
];

export default function ThemeSidebar({ isOpen, onClose }) {
  const [hue, setHue] = useState(210);
  const [sat, setSat] = useState(15);
  const [light, setLight] = useState(88);
  const [isDark, setIsDark] = useState(false);

  const MotionDiv = motion.div;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--hue", hue);
    root.style.setProperty("--sat", `${sat}%`);
    root.style.setProperty("--light", `${light}%`);
    
    // Update derived text colors for high-contrast accessibility
    if (light < 40) {
      root.style.setProperty("--text-primary", `hsl(${hue}, ${sat}%, 95%)`);
      root.style.setProperty("--text-secondary", `hsl(${hue}, ${sat}%, 65%)`);
      root.style.setProperty("--nm-shadow-light", `hsl(${hue}, ${sat}%, ${light + 5}%)`);
      root.style.setProperty("--nm-shadow-dark", `hsl(${hue}, ${sat}%, ${light - 5}%)`);
    } else {
      root.style.setProperty("--text-primary", `hsl(${hue}, ${sat}%, 15%)`);
      root.style.setProperty("--text-secondary", `hsl(${hue}, ${sat}%, 35%)`);
      root.style.setProperty("--nm-shadow-light", `hsl(${hue}, ${sat}%, ${light + 7}%)`);
      root.style.setProperty("--nm-shadow-dark", `hsl(${hue}, ${sat}%, ${light - 13}%)`);
    }
  }, [hue, sat, light]);

  const toggleDarkMode = () => {
    if (light > 40) {
      setLight(15);
      setSat(10);
      setIsDark(true);
    } else {
      setLight(88);
      setSat(15);
      setIsDark(false);
    }
  };

  const applyPreset = (preset) => {
    setHue(preset.hue);
    setSat(parseInt(preset.sat));
    setLight(parseInt(preset.light));
    setIsDark(parseInt(preset.light) < 40);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Sidebar */}
          <MotionDiv
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-(--bg-color) z-[101] p-8 nm-flat transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black uppercase tracking-widest leading-none">System Style</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full nm-button flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-10">
              {/* Presets */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-5 opacity-60">
                  Protocol Presets
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => applyPreset(theme)}
                      className="group flex items-center gap-4 p-4 rounded-2xl nm-button text-left transition-all"
                    >
                      <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${theme.color}`}>
                        <theme.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{theme.name}</p>
                        <p className="text-[10px] opacity-40 italic">H:{theme.hue} S:{theme.sat} L:{theme.light}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggle */}
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-5 opacity-60">
                  Luminance Protocol
                </label>
                <button
                  onClick={toggleDarkMode}
                  className="w-full py-5 rounded-2xl nm-button flex items-center justify-center gap-4 group transition-all"
                >
                  {isDark ? (
                    <Sun className="w-6 h-6 text-yellow-500 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="w-6 h-6 text-blue-500 group-hover:-rotate-12 transition-transform" />
                  )}
                  <span className="font-black text-xs uppercase tracking-[0.2rem]">
                    {isDark ? "Enable Light Core" : "Enable Stealth Mode"}
                  </span>
                </button>
              </div>

              {/* RGB Wheel / Hue Slider */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) opacity-60">
                      Hue Orchestration
                    </label>
                    <span className="text-[10px] font-black opacity-40">{hue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer nm-inset-sm overflow-hidden"
                    style={{
                      background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) opacity-60">
                      Saturation Depth
                    </label>
                    <span className="text-[10px] font-black opacity-40">{sat}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={sat}
                    onChange={(e) => setSat(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer nm-inset-sm"
                    style={{
                       background: `linear-gradient(to right, hsl(${hue}, 0%, ${light}%), hsl(${hue}, 50%, ${light}%))`
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) opacity-60">
                      Lightness Fine-Tune
                    </label>
                    <span className="text-[10px] font-black opacity-40">{light}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={light}
                    onChange={(e) => setLight(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer nm-inset-sm"
                     style={{
                       background: `linear-gradient(to right, #000, #fff)`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">System Core V3.01 // Adaptive Visuals Enabled</p>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}
