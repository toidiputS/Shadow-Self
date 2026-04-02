import React, { useState, useRef } from "react";
import { 
  FileUp, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Users, 
  Building, 
  ShieldCheck, 
  Activity,
  Plus
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;

export default function ImportTools() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
        setIsUploading(true);
        setError(null);
        // Mock processing time
        setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(`Tactical Import Complete: 12 Residents established.`);
            // Reset after 5s
            setTimeout(() => setUploadSuccess(null), 5000);
        }, 2000);
    } else {
        setError("Invalid Payload Detection: Only CSV format authorized.");
        setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-3xl nm-flat flex items-center justify-center text-blue-500">
           <FileUp className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest italic text-blue-500">Data Import Nodes</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Initialize Roster from External Payloads</p>
        </div>
      </div>

      <AnimatePresence>
         {(uploadSuccess || error) && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className={`p-10 rounded-[3rem] nm-flat flex items-center gap-8 ${error ? 'bg-red-500/5 border border-red-500/20' : 'bg-green-500/5 border border-green-500/20'}`}
            >
               <div className={`w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center ${error ? 'text-red-500' : 'text-green-500'}`}>
                  {error ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
               </div>
               <div>
                  <h3 className={`text-xl font-black uppercase tracking-widest ${error ? 'text-red-500' : 'text-green-500'}`}>{error ? 'Security Protocol Triggered' : 'Identity Hub Synchronized'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2 line-clamp-1">{error || uploadSuccess}</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Resident CSV Upload */}
         <div className="p-12 rounded-[4rem] nm-flat space-y-10 group hover:nm-flat-lg transition-all duration-700">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                     <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest">Resident Roster</h3>
                    <p className="text-[9px] font-bold opacity-30 mt-1 uppercase tracking-widest">Bulk identity establishment</p>
                  </div>
               </div>
               <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-8 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest text-blue-500 group-hover:scale-105 active:scale-95 transition-all"
               >
                  Select File
               </button>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[3rem] p-16 text-center transition-all duration-500 cursor-pointer ${
                isUploading ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/20 hover:bg-white/2'
              }`}
            >
               {isUploading ? (
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                     <Activity className="w-16 h-16 text-blue-500" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">Parsing Payload...</p>
                  </div>
               ) : (
                  <div className="space-y-6">
                     <FileUp className="w-16 h-16 mx-auto text-blue-500/10 group-hover:text-blue-500/40 transition-colors" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4rem] opacity-20">Drop CSV Identity Node Here</p>
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-10">Headers: name, email, phone, clearance</p>
                  </div>
               )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
         </div>

         {/* House Template Cloning */}
         <div className="p-12 rounded-[4rem] nm-flat space-y-10 opacity-60 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-orange-500">
                  <Building className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-xl font-black uppercase tracking-widest">Cross-Guild Cloning</h3>
                 <p className="text-[9px] font-bold opacity-30 mt-1 uppercase tracking-widest">Clone protocol logic between houses</p>
               </div>
            </div>

            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Authorized House Source Nodes:</p>
               <div className="space-y-4">
                  {['East Wing Institutional', 'West Recovery Guild', 'South Harbor Wellness'].map((h) => (
                    <div key={h} className="p-8 rounded-4xl nm-inset-sm flex items-center justify-between group cursor-pointer hover:bg-white/2 transition-colors">
                       <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{h}</span>
                       <button className="w-12 h-12 rounded-xl nm-button flex items-center justify-center text-blue-500 hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <button className="w-full py-6 rounded-4xl nm-button text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-orange-500 transition-all flex items-center justify-center gap-4">
               Initialize Logic Clone <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
