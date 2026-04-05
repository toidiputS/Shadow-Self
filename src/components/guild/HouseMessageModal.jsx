import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, AlertCircle } from "lucide-react";

const MotionDiv = motion.div;

export default function HouseMessageModal({ isOpen, onClose, onConfirm, defaultMessage }) {
  // Since we use a 'key' prop on this component in the parent, 
  // this state will naturally reset/re-initialize whenever it opens.
  const [message, setMessage] = useState(defaultMessage || "");

  const handleConfirm = () => {
    onConfirm(message);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] nm-flat border border-white/5 p-8 md:p-12 z-101"
          >
            {/* Glossy Header Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-orange-500/40 to-transparent" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-orange-500">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] leading-none mb-1 italic">House Message</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-20">Send support to the house</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-red-500/40 hover:text-red-500 hover:scale-110 active:scale-90 transition-all font-black"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-6 italic">Your Message</label>
                <div className="nm-inset-sm rounded-3xl p-1 overflow-hidden transition-all duration-500 focus-within:nm-inset">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    autoFocus
                    className="w-full h-40 px-8 py-6 rounded-3xl bg-transparent border-none focus:outline-hidden text-xs font-bold leading-relaxed italic placeholder:opacity-10 custom-scrollbar resize-none text-orange-500/80"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-5 rounded-2xl nm-button text-[9px] font-black uppercase tracking-[0.3em] opacity-20 hover:opacity-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={!message.trim()}
                  className="flex-1 py-5 rounded-2xl nm-button text-[9px] font-black uppercase tracking-[0.3em] text-orange-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-20 disabled:grayscale"
                >
                  Send Message
                  <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
}
