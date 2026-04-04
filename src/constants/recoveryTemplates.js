import { 
  ClipboardList, 
  Zap, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  BookOpen,
  Briefcase,
  Users,
  ShieldAlert
} from "lucide-react";

export const RECOVERY_TEMPLATES = [
  { id: "orientation", name: "Guild Orientation", icon: ShieldCheck, xp: 200, sp: 100, freq: "Once", desc: "System training and identity establishment protocols." },
  { id: "morning", name: "Morning Reset", icon: Zap, xp: 50, sp: 25, freq: "Daily", desc: "Identity verification and intention setting." },
  { id: "meeting", name: "Meeting Attendance", icon: Users, xp: 100, sp: 50, freq: "Daily", desc: "Proof of attendance at recovery community meetings." },
  { id: "meds", name: "Medication Compliance", icon: Stethoscope, xp: 25, sp: 10, freq: "Daily", desc: "Supervised or verified medical adherence." },
  { id: "hygiene", name: "Living Hygiene", icon: ClipboardList, xp: 25, sp: 10, freq: "Daily", desc: "Bed made, quarters inspected and validated." },
  { id: "job", name: "Job Search Activity", icon: Briefcase, xp: 150, sp: 75, freq: "Weekday", desc: "Proof of applications or interview attendance." },
  { id: "journaling", name: "Recovery Journal", icon: BookOpen, xp: 50, sp: 25, freq: "Daily", desc: "Qualitative reflection on progress and triggers." },
  { id: "curfew", name: "Curfew Verification", icon: Clock, xp: 50, sp: 25, freq: "Daily", desc: "Presence verification inside the house by 10 PM." },
  { id: "relapse", name: "Relapse Response", icon: ShieldAlert, xp: -500, sp: -250, freq: "Ad-hoc", desc: "Intensive stabilization protocols for deviation." }
];
