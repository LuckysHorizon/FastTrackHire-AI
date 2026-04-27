import { create } from 'zustand';
import axios from 'axios';

export const useAppStore = create((set, get) => ({
  sessions: [],
  stats: { avg_score: 0, total_count: 0 },
  resumeStatus: null,
  lastFetch: null,
  loading: false,
  error: null,

  fetchDashboardData: async (API_URL, token, force = false) => {
    // Basic cache: only fetch if forced or data is older than 5 minutes
    const now = Date.now();
    const { lastFetch, sessions } = get();
    
    if (!force && lastFetch && (now - lastFetch < 5 * 60 * 1000) && sessions.length > 0) {
      return; // Use cached data
    }

    set({ loading: true, error: null });
    try {
      const [sessionsRes, resumeRes] = await Promise.all([
        axios.get(`${API_URL}/sessions?token=${token}`),
        axios.get(`${API_URL}/resume?token=${token}`).catch(() => ({ data: { has_resume: false } }))
      ]);
      
      set({
        sessions: sessionsRes.data?.sessions || [],
        stats: sessionsRes.data?.stats || { avg_score: 0, total_count: 0 },
        resumeStatus: resumeRes.data,
        lastFetch: Date.now(),
        loading: false
      });
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      set({ 
        error: "Failed to synchronize intelligence archive.",
        loading: false 
      });
    }
  },

  clearCache: () => set({
    sessions: [],
    stats: { avg_score: 0, total_count: 0 },
    resumeStatus: null,
    lastFetch: null,
    error: null
  })
}));
