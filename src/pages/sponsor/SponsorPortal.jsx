import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Zap, 
  MessageSquare, 
  Plus, 
  ClipboardCheck, 
  AlertCircle,
  Eye,
  History,
  Lock,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const MotionDiv = motion.div;

const SP_TABS = [
  { id: "members", name: "My Members", icon: Users },
  { id: "reviews", name: "Review Queue", icon: ClipboardCheck },
  { id: "assignments", name: "Quest Assignments", icon: Plus },
  { id: "logs", name: "Activity Logs", icon: History },
];

export default function SponsorPortal() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [selectedReview, setSelectedReview] = useState(null);

  // Fetch sponsor's members
  const { data: myMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['sponsor-members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsorships')
        .select(`
          id,
          status,
          member_id,
          profiles:member_id (
            user_id,
            display_name,
            avatar_url,
            status
          )
        `)
        .eq('sponsor_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch review queue
  const { data: reviewQueue = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['review-queue', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_queue')
        .select(`
          id,
          proof_type,
          notes,
          status,
          created_at,
          member_id,
          quest_id,
          profiles:member_id (
            display_name
          ),
          quests:quest_id (
            title
          )
        `)
        .eq('sponsor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && activeTab === 'reviews'
  });

  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['sponsor-activity-logs', user?.id],
    queryFn: async () => {
      // Get member IDs first
      const memberIds = myMembers.map(m => m.member_id);
      if (memberIds.length === 0) return [];

      const { data, error } = await supabase
        .from('guild_activity_log')
        .select('*')
        .in('user_id', memberIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && activeTab === 'logs' && myMembers.length > 0
  });

  // Review approval mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ reviewId, action }) => {
      const { error } = await supabase
        .from('review_queue')
        .update({ 
          status: action === 'approve' ? 'approved' : 'denied',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      setSelectedReview(null);
    }
  });

  const handleReviewAction = (reviewId, action) => {
    reviewMutation.mutate({ reviewId, action });
  };

  // Get status badge for member
  const getMemberStatus = (memberStatus) => {
    switch (memberStatus) {
      case 'active': return { label: 'Active', color: 'text-green-500' };
      case 'warning': return { label: 'Warning', color: 'text-orange-500' };
      case 'breach': return { label: 'Breach', color: 'text-red-500' };
      default: return { label: 'Pending', color: 'text-blue-500' };
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) p-4 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">

        {/* Sponsor Portal Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-4xl nm-flat flex items-center justify-center text-orange-500 relative group">
                <div className="absolute inset-0 bg-orange-500/10 rounded-4xl animate-pulse"></div>
                <ClipboardCheck className="w-10 h-10 relative z-10" />
            </div>

            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.5rem] leading-none mb-4 italic text-orange-500">Sponsor Portal</h1>
              <div className="flex items-center gap-2 opacity-40">
                  <Activity className="w-3 h-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Direct Intervention Bridge Active</p>
              </div>

            </div>

          </div>


          <div className="flex gap-4">
             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 hover:scale-105 transition-all flex items-center gap-3">
                <Plus className="w-4 h-4" /> Custom Alignment Task
             </button>

             <div className="px-6 py-4 rounded-2xl nm-inset-sm flex items-center gap-3 text-orange-500/60 font-black text-[9px] uppercase tracking-widest">
                Linked Subjects: {myMembers.length}
             </div>
          </div>
        </div>


        {/* Sponsor Nav Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 p-3 rounded-[2.5rem] nm-inset overflow-x-auto">
          {SP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap relative ${
                activeTab === tab.id 
                ? 'nm-button text-orange-500 font-bold' 
                : 'opacity-40 hover:opacity-100 hover:nm-flat-sm text-[11px] font-black uppercase tracking-widest'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              <span className={activeTab === tab.id ? '' : 'text-[10px]'}>{tab.name}</span>
              {tab.id === 'reviews' && reviewQueue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 nm-flat flex items-center justify-center border-2 border-(--bg-color) animate-pulse scale-75">
                  <span className="text-[8px] font-black text-white">{reviewQueue.length}</span>
                </span>
              )}
            </button>

          ))}
        </div>


        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[500px]"
          >
            {activeTab === "members" && (
                <div className="space-y-6">
                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  ) : myMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-40 text-center">
                      <Users className="w-16 h-16 mb-8" />
                      <h2 className="text-2xl font-black uppercase tracking-[0.5rem]">No Members Linked</h2>
                      <p className="text-[10px] font-black text-center mt-4">Accept sponsorship requests to begin oversight.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {myMembers.map((sponsorship) => {
                         const member = sponsorship.profiles;
                         const status = getMemberStatus(member?.status);
                         return (
                         <div key={sponsorship.id} className="p-8 rounded-[3rem] nm-flat group hover:nm-flat-lg transition-all relative overflow-hidden">
                            
                            <div className="flex items-center gap-6 mb-8 mt-2">
                               <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-orange-500 font-black text-xl">
                                  {member?.display_name?.charAt(0) || '?'}
                               </div>
                               <div>
                                  <h3 className="text-xl font-black uppercase tracking-widest">{member?.display_name || 'Unknown'}</h3>
                                  <p className={`text-[10px] font-black uppercase underline decoration-2 ${status.color}`}>{status.label}</p>
                               </div>
                            </div>


                            <div className="flex gap-4">
                               <button className="flex-1 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest text-orange-500 flex items-center justify-center gap-2">
                                  <Activity className="w-3 h-3" /> Dashboard
                               </button>

                               <button className="flex-1 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-blue-400">
                                  <MessageSquare className="w-3 h-3" /> Message
                               </button>

                               <button className="w-14 items-center justify-center flex py-4 rounded-2xl nm-button text-red-500 hover:scale-105 transition-all">
                                  <ShieldAlert className="w-4 h-4" />
                               </button>

                            </div>
                         </div>
                         );
                       })}
                    </div>
                  )}
                </div>
            )}


            {activeTab === "reviews" && (
                <div className="space-y-6">
                   {isLoadingReviews ? (
                     <div className="flex items-center justify-center py-20">
                       <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                     </div>
                   ) : reviewQueue.length > 0 ? reviewQueue.map((item) => (
                      <div key={item.id} className="p-10 rounded-[3rem] nm-flat flex flex-col md:flex-row items-center justify-between gap-8 border border-orange-500/5 hover:border-orange-500/20 transition-all">
                         <div className="flex items-center gap-8">
                             <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                                <ClipboardCheck className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">{item.profiles?.display_name || 'Unknown'}</h3>
                                <p className="text-[10px] font-black opacity-30 mt-1">Proof Hub: <span className="text-blue-500">{item.quests?.title || 'Quest'}</span> • {item.proof_type}</p>
                             </div>
                         </div>
                         
                         <div className="max-w-md bg-transparent p-6 rounded-2xl nm-inset-sm">
                            <p className="text-[9px] font-bold opacity-60 leading-relaxed italic">"{item.notes || 'No notes provided'}"</p>
                         </div>


                         <div className="flex gap-4">
                             <button 
                               onClick={() => handleReviewAction(item.id, 'approve')}
                               disabled={reviewMutation.isPending}
                               className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                             >
                               {reviewMutation.isPending && selectedReview === item.id ? (
                                 <Loader2 className="w-4 h-4 animate-spin" />
                               ) : (
                                 <CheckCircle2 className="w-4 h-4" />
                               )} Approve
                             </button>

                             <button 
                               onClick={() => handleReviewAction(item.id, 'deny')}
                               disabled={reviewMutation.isPending}
                               className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                             >
                               <XCircle className="w-4 h-4" /> Deny
                             </button>

                             <button className="p-4 rounded-2xl nm-button text-blue-400">
                                <Eye className="w-4 h-4" />
                             </button>

                         </div>

                      </div>

                   )) : (
                      <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
                         <CheckCircle2 className="w-16 h-16 mb-8 text-green-500" />
                         <h2 className="text-2xl font-black uppercase tracking-[0.5rem]">Queue Expired</h2>
                         <p className="text-[10px] font-black text-center mt-4">No pending identity proofs currently awaiting validation.</p>
                      </div>
                   )}
                </div>
            )}


            {activeTab === "assignments" && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                <Plus className="w-16 h-16 mb-8" />
                <h2 className="text-2xl font-black uppercase tracking-[0.5rem] italic text-orange-500/60">Assignment Module</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Custom quest assignments coming soon.</p>
              </div>
            )}


            {activeTab === "logs" && (
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
                    <History className="w-16 h-16 mb-8" />
                    <h2 className="text-2xl font-black uppercase tracking-[0.5rem]">No Activity</h2>
                    <p className="text-[10px] font-black text-center mt-4">Member activity will appear here.</p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-6 rounded-3xl nm-inset-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-black uppercase">{log.description}</p>
                          <p className="text-[10px] opacity-40">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {log.sp_amount !== 0 && (
                        <span className={`text-sm font-black ${log.sp_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {log.sp_amount > 0 ? '+' : ''}{log.sp_amount} SP
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </MotionDiv>
        </AnimatePresence>


      </div>
    </div>
  );
}
