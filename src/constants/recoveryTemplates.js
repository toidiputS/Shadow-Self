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

// NOTE: xp/sp field names are retained for database schema compatibility.
// UI displays these as "Resilience" and "Trust" via the terminology map.
export const RECOVERY_TEMPLATES = [
  { id: "orientation", name: "House Orientation", icon: ShieldCheck, xp: 200, sp: 100, freq: "Once", desc: "Getting started and learning the basics." },
  { id: "morning", name: "Morning Reset", icon: Zap, xp: 50, sp: 25, freq: "Daily", desc: "Start your day with clear intentions." },
  { id: "meeting", name: "Meeting Attendance", icon: Users, xp: 100, sp: 50, freq: "Daily", desc: "Attending recovery community meetings." },
  { id: "meds", name: "Medication", icon: Stethoscope, xp: 25, sp: 10, freq: "Daily", desc: "Taking care of your health and prescriptions." },
  { id: "hygiene", name: "House Chores", icon: ClipboardList, xp: 25, sp: 10, freq: "Daily", desc: "Bed made and room tidy." },
  { id: "job", name: "Job Search", icon: Briefcase, xp: 150, sp: 75, freq: "Weekday", desc: "Applying for jobs or attending interviews." },
  { id: "journaling", name: "Daily Reflection", icon: BookOpen, xp: 50, sp: 25, freq: "Daily", desc: "Reflecting on your progress and feelings." },
  { id: "curfew", name: "Curfew Check", icon: Clock, xp: 50, sp: 25, freq: "Daily", desc: "Being safely home by 10 PM." },
  { id: "relapse", name: "Extra Support Needed", icon: ShieldAlert, xp: -500, sp: -250, freq: "Ad-hoc", desc: "Accessing extra care and support when struggling." }
];
