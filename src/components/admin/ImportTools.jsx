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
  Plus,
  Loader2,
  Download
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/hooks/useAuth";

const MotionDiv = motion.div;

export default function ImportTools({ guildId }) {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [importingCount, setImportingCount] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch available guilds for cloning
  const { data: availableGuilds = [] } = useState([]);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
    return records;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type === "text/csv" && !file.name.endsWith('.csv')) {
      setUploadError("Invalid Payload Detection: Only CSV format authorized.");
      setTimeout(() => setUploadError(null), 4000);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      // Validate required columns
      const requiredColumns = ['name', 'email'];
      const headers = Object.keys(records[0] || {});
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Create users and add to guild
      let importedCount = 0;
      const errors = [];

      for (const record of records) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('display_name', record.name)
            .single();

          let userId;

          if (existingUser) {
            userId = existingUser.user_id;
          } else {
            // Create new user via auth (would need admin rights or invitation flow)
            // For now, just create profile if email provided
            if (record.email) {
              // This would typically be done via admin API or invitation
              // For MVP, we'll skip user creation and just log
              errors.push(`Skipped ${record.name}: User creation requires invitation flow`);
              continue;
            }
          }

          // Add to guild if guildId provided
          if (guildId && userId) {
            await supabase
              .from('guild_members')
              .upsert([{
                guild_id: guildId,
                user_id: userId,
                role: 'member'
              }], {
                onConflict: 'guild_id,user_id'
              });
          }

          importedCount++;
          setImportingCount(importedCount);
        } catch (err) {
          errors.push(`Error importing ${record.name}: ${err.message}`);
        }
      }

      if (importedCount > 0) {
        setUploadSuccess(`Tactical Import Complete: ${importedCount} residents established.${errors.length > 0 ? ` (${errors.length} skipped)` : ''}`);
      } else {
        setUploadError(`Import completed but no users added. ${errors.join('; ')}`);
      }

      // Reset after 8s
      setTimeout(() => {
        setUploadSuccess(null);
        setUploadError(null);
      }, 8000);

    } catch (err) {
      setUploadError(`Invalid Payload Detection: ${err.message}`);
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setIsUploading(false);
      setImportingCount(0);
    }
  };

  const downloadTemplate = () => {
    const template = "name,email,phone,clearance\nJohn Doe,john@example.com,555-0123,member\nJane Smith,jane@example.com,555-0456,member";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGuildClone = async (sourceGuildId) => {
    if (!guildId || !sourceGuildId) return;
    
    setIsUploading(true);
    setUploadError(null);

    try {
      // Clone quests from source guild
      const { data: sourceQuests, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('guild_id', sourceGuildId);

      if (questsError) throw questsError;

      // Clone quests to target guild
      const newQuests = sourceQuests.map(quest => ({
        ...quest,
        id: undefined,
        guild_id: guildId,
        created_at: undefined
      }));

      const { error: insertError } = await supabase
        .from('quests')
        .insert(newQuests);

      if (insertError) throw insertError;

      // Log activity
      await supabase
        .from('guild_activity_log')
        .insert([{
          guild_id: guildId,
          user_id: user.id,
          action_type: 'guild_cloned',
          description: `Cloned ${newQuests.length} quests from another guild`,
          sp_amount: 0
        }]);

      setUploadSuccess(`Cross-Guild Clone Complete: ${newQuests.length} protocols synchronized.`);

    } catch (err) {
      setUploadError(`Clone failed: ${err.message}`);
    } finally {
      setIsUploading(false);
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
         {(uploadSuccess || uploadError) && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className={`p-10 rounded-[3rem] nm-flat flex items-center gap-8 ${uploadError ? 'bg-red-500/5 border border-red-500/20' : 'bg-green-500/5 border border-green-500/20'}`}
            >
               <div className={`w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center ${uploadError ? 'text-red-500' : 'text-green-500'}`}>
                  {uploadError ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
               </div>

               <div>
                  <h3 className={`text-xl font-black uppercase tracking-widest ${uploadError ? 'text-red-500' : 'text-green-500'}`}>{uploadError ? 'Security Protocol Triggered' : 'Identity Hub Synchronized'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2 line-clamp-1">{uploadError || uploadSuccess}</p>
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

               <div className="flex gap-2">
                 <button 
                    onClick={downloadTemplate}
                    className="px-4 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                 >
                    <Download className="w-3 h-3" /> Template
                 </button>
                 <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className="px-8 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest text-blue-500 group-hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                    Select File
                 </button>
               </div>
            </div>


            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[3rem] p-16 text-center transition-all duration-500 cursor-pointer ${
                isUploading ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/20 hover:bg-white/2'
              }`}
            >
               {isUploading ? (
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                     <Activity className="w-16 h-16 text-blue-500" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">
                       Parsing Payload... ({importingCount} processed)
                     </p>
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
                  {['East Wing Institutional', 'West Recovery Guild', 'South Harbor Wellness'].map((h, i) => (
                    <div key={h} className="p-8 rounded-4xl nm-inset-sm flex items-center justify-between group cursor-pointer hover:bg-white/2 transition-colors">
                       <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{h}</span>
                       <button 
                        onClick={() => handleGuildClone(`demo-guild-${i}`)}
                        disabled={isUploading || !guildId}
                        className="w-12 h-12 rounded-xl nm-button flex items-center justify-center text-blue-500 hover:scale-110 transition-transform disabled:opacity-30"
                       >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                       </button>
                    </div>

                  ))}
               </div>
            </div>


            <button 
              disabled={isUploading}
              className="w-full py-6 rounded-4xl nm-button text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-orange-500 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
            >
               Initialize Logic Clone <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
