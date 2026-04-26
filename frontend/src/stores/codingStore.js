import { create } from 'zustand';
import axios from 'axios';

export const useCodingStore = create((set, get) => ({
  question: null,
  questionLoading: false,
  questionError: null,
  status: 'pending', // 'pending', 'in_progress', 'completed'
  
  activeLanguage: 'python',
  codeByLanguage: {
    python: '',
    javascript: '',
    java: '',
    cpp: '',
    go: ''
  },
  
  isRunning: false,
  isSubmitting: false,
  runError: null,
  testResults: null,
  evaluation: null,
  hiddenSummary: null,
  
  elapsedSeconds: 0,
  timeLimitSeconds: 2700,
  
  // Actions
  initSession: async (API_URL, sessionId, token) => {
    try {
      const res = await axios.get(`${API_URL}/sessions/${sessionId}/coding/status?token=${token}`);
      set({ 
        status: res.data.status,
        elapsedSeconds: res.data.time_elapsed_seconds || 0,
        activeLanguage: res.data.language || 'python'
      });
      
      if (res.data.status === 'in_progress') {
        // Fetch question if already started (idempotent - won't regenerate)
        try {
          const qRes = await axios.post(`${API_URL}/sessions/${sessionId}/coding/generate?token=${token}`, {
            language: res.data.language || 'python'
          });
          const q = qRes.data.question;
          const lang = res.data.language || 'python';
          set({ 
            question: q,
            codeByLanguage: {
              ...get().codeByLanguage,
              [lang]: get().codeByLanguage[lang] || q.boilerplate?.[lang] || ''
            }
          });
        } catch (err) {
          console.error("Error fetching existing question", err);
        }
      }
    } catch (err) {
      console.error("Error init coding session", err);
    }
  },

  startCoding: async (API_URL, sessionId, token, language) => {
    set({ questionLoading: true, questionError: null });
    try {
      const res = await axios.post(`${API_URL}/sessions/${sessionId}/coding/generate?token=${token}`, {
        language
      });
      const q = res.data.question;
      set({ 
        question: q,
        status: 'in_progress',
        activeLanguage: language,
        elapsedSeconds: 0,
        codeByLanguage: {
          ...get().codeByLanguage,
          [language]: q.boilerplate?.[language] || ''
        }
      });
    } catch (err) {
      console.error("Error generating question", err);
      const msg = err.response?.data?.detail || 'Failed to generate problem. Please try again.';
      set({ questionError: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      set({ questionLoading: false });
    }
  },

  updateCode: (code) => {
    const lang = get().activeLanguage;
    set({
      codeByLanguage: {
        ...get().codeByLanguage,
        [lang]: code
      }
    });
  },

  runCode: async (API_URL, sessionId, token) => {
    const lang = get().activeLanguage;
    const code = get().codeByLanguage[lang];
    if (!code || !code.trim()) return;
    
    set({ isRunning: true, runError: null, testResults: null });
    try {
      const res = await axios.post(`${API_URL}/sessions/${sessionId}/coding/run?token=${token}`, {
        source_code: code,
        language: lang
      });
      set({ testResults: res.data.results });
      return res.data.results;
    } catch (err) {
      console.error("Error running code", err);
      const detail = err.response?.data?.detail;
      if (detail?.error === 'Rate limit exceeded') {
        set({ runError: `Rate limited. Try again in ${detail.reset_in_seconds}s.` });
      } else {
        set({ runError: 'Failed to execute code. Please try again.' });
      }
    } finally {
      set({ isRunning: false });
    }
  },

  submitCode: async (API_URL, sessionId, token, isFinal = true) => {
    const lang = get().activeLanguage;
    const code = get().codeByLanguage[lang];
    if (!code || !code.trim()) return;
    
    set({ isSubmitting: true, runError: null });
    try {
      const res = await axios.post(`${API_URL}/sessions/${sessionId}/coding/submit?token=${token}`, {
        source_code: code,
        language: lang,
        is_final: isFinal
      });
      set({ 
        evaluation: res.data.evaluation,
        testResults: res.data.test_results,
        hiddenSummary: res.data.hidden_summary,
        status: isFinal ? 'completed' : get().status
      });
      return res.data;
    } catch (err) {
      console.error("Error submitting code", err);
      const detail = err.response?.data?.detail;
      if (detail?.error === 'Rate limit exceeded') {
        set({ runError: `Rate limited. Try again in ${detail.reset_in_seconds}s.` });
      } else {
        set({ runError: 'Submission failed. Please try again.' });
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  resetCoding: () => set({
    question: null,
    questionLoading: false,
    questionError: null,
    status: 'pending',
    activeLanguage: 'python',
    codeByLanguage: { python: '', javascript: '', java: '', cpp: '', go: '' },
    isRunning: false,
    isSubmitting: false,
    runError: null,
    testResults: null,
    evaluation: null,
    hiddenSummary: null,
    elapsedSeconds: 0,
  }),

  tick: () => set(state => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
}));
