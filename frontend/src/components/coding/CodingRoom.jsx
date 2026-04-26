import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { useCodingStore } from '../../stores/codingStore';
import { useAuth } from '../../context/AuthContext';
import ProblemPanel from './ProblemPanel';
import EditorPanel from './EditorPanel';
import TestCasePanel from './TestCasePanel';
import { Card } from '../ui/Card';
import { Timer, Code2, Award, Zap, AlertCircle, ArrowLeft, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { id: 'python', label: 'Python', icon: '🐍', desc: 'Clean & expressive' },
  { id: 'javascript', label: 'JavaScript', icon: '⚡', desc: 'Versatile & fast' },
  { id: 'java', label: 'Java', icon: '☕', desc: 'Strong-typed & robust' },
  { id: 'cpp', label: 'C++', icon: '⚙️', desc: 'High performance' },
  { id: 'go', label: 'Go', icon: '🔷', desc: 'Simple & concurrent' },
];

const CodingRoom = ({ sessionId, onBack }) => {
  const { 
    question, 
    activeLanguage, 
    codeByLanguage, 
    status,
    questionLoading,
    questionError,
    isRunning,
    isSubmitting,
    runError,
    testResults,
    evaluation,
    hiddenSummary,
    elapsedSeconds,
    initSession,
    startCoding,
    updateCode,
    runCode,
    submitCode,
    tick
  } = useCodingStore();

  const { API_URL } = useAuth();
  const token = localStorage.getItem('token');
  const [selectedLang, setSelectedLang] = useState('python');

  useEffect(() => {
    initSession(API_URL, sessionId, token);
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = () => runCode(API_URL, sessionId, token);
  const handleSubmit = () => submitCode(API_URL, sessionId, token, true);

  const handleStartCoding = () => {
    startCoding(API_URL, sessionId, token, selectedLang);
  };

  // ── Language Selection Screen ──
  if (status === 'pending') {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#FAFAF8]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[540px] w-full"
        >
          <Card className="p-10 text-center relative overflow-hidden bg-white border border-[#E8E6E0] shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A1A2E] to-emerald-500" />
            <div className="w-14 h-14 bg-[#1A1A2E]/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Code2 className="w-7 h-7 text-[#1A1A2E]" />
            </div>
            <h2 className="text-[26px] font-serif font-bold text-[#1A1A2E] mb-2">Coding Assessment</h2>
            <p className="text-[#888] text-[14px] mb-8 leading-relaxed max-w-[380px] mx-auto">
              Select your preferred language. A problem will be generated based on your profile.
            </p>

            <div className="grid grid-cols-1 gap-2 mb-8">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all ${
                    selectedLang === lang.id
                      ? 'border-[#1A1A2E] bg-[#1A1A2E]/5 shadow-sm'
                      : 'border-[#E8E6E0] bg-white hover:border-[#CCC]'
                  }`}
                >
                  <span className="text-[22px]">{lang.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[13px] font-bold ${selectedLang === lang.id ? 'text-[#1A1A2E]' : 'text-[#444]'}`}>
                      {lang.label}
                    </p>
                    <p className="text-[11px] text-[#999]">{lang.desc}</p>
                  </div>
                  {selectedLang === lang.id && (
                    <div className="w-5 h-5 rounded-full bg-[#1A1A2E] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {questionError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{questionError}</span>
              </div>
            )}

            <button
              onClick={handleStartCoding}
              disabled={questionLoading}
              className="w-full bg-[#1A1A2E] text-white h-[52px] rounded-xl font-bold text-[14px] hover:bg-[#2A2A4E] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {questionLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Problem...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Begin Coding Round
                </>
              )}
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 text-[13px] text-[#999] hover:text-[#555] flex items-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Interview
              </button>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Completed Screen with full feedback ──
  if (status === 'completed' && evaluation) {
    const scoreColor = evaluation.overall_score >= 70 ? 'text-emerald-500' :
      evaluation.overall_score >= 40 ? 'text-amber-500' : 'text-red-500';

    return (
      <div className="h-full overflow-y-auto bg-[#FAFAF8] no-scrollbar">
        <div className="max-w-[680px] mx-auto py-12 px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="text-center mb-10">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                evaluation.overall_score >= 70 ? 'bg-emerald-100' : evaluation.overall_score >= 40 ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <Award className={`w-10 h-10 ${scoreColor}`} />
              </div>
              <h2 className="text-[30px] font-serif font-bold text-[#1A1A2E] mb-1">Assessment Complete</h2>
              <p className="text-[#888] text-[14px]">Your solution has been evaluated by our AI engine</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <Card className="p-5 text-center bg-white border border-[#E8E6E0]">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Overall</p>
                <p className={`text-[36px] font-bold ${scoreColor}`}>
                  {evaluation.overall_score}
                </p>
              </Card>
              <Card className="p-5 text-center bg-white border border-[#E8E6E0]">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Correct</p>
                <p className="text-[24px] font-bold text-[#1A1A2E]">{evaluation.correctness_score}<span className="text-[14px] text-[#CCC]">/40</span></p>
              </Card>
              <Card className="p-5 text-center bg-white border border-[#E8E6E0]">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Quality</p>
                <p className="text-[24px] font-bold text-[#1A1A2E]">{evaluation.quality_score}<span className="text-[14px] text-[#CCC]">/30</span></p>
              </Card>
              <Card className="p-5 text-center bg-white border border-[#E8E6E0]">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Efficiency</p>
                <p className="text-[24px] font-bold text-[#1A1A2E]">{evaluation.efficiency_score}<span className="text-[14px] text-[#CCC]">/20</span></p>
              </Card>
            </div>

            {/* Verdict + Summary */}
            <Card className="p-6 mb-6 bg-white border border-[#E8E6E0]">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider ${
                  evaluation.verdict === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                  evaluation.verdict === 'Partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {evaluation.verdict}
                </span>
                <span className="text-[12px] text-[#999]">Time: {formatTime(elapsedSeconds)}</span>
                {hiddenSummary && (
                  <span className="text-[12px] text-[#999] ml-auto">
                    Hidden Tests: {hiddenSummary.passed}/{hiddenSummary.total} passed
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#444] leading-relaxed">{evaluation.summary}</p>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-5 bg-white border border-[#E8E6E0]">
                <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {(evaluation.strengths || []).map((s, i) => (
                    <li key={i} className="text-[13px] text-[#444] flex items-start gap-2">
                      <span className="text-emerald-500 mt-1 shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5 bg-white border border-[#E8E6E0]">
                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5" /> Improvements
                </h4>
                <ul className="space-y-2">
                  {(evaluation.improvements || []).map((s, i) => (
                    <li key={i} className="text-[13px] text-[#444] flex items-start gap-2">
                      <span className="text-amber-500 mt-1 shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Complexity Analysis */}
            {evaluation.complexity_analysis && (
              <Card className="p-5 mb-8 bg-white border border-[#E8E6E0]">
                <h4 className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-3">Complexity Analysis</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] text-[#999]">Your Time</p>
                    <code className="text-[14px] font-mono font-bold text-[#1A1A2E]">{evaluation.complexity_analysis.user_time}</code>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#999]">Your Space</p>
                    <code className="text-[14px] font-mono font-bold text-[#1A1A2E]">{evaluation.complexity_analysis.user_space}</code>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#999]">Optimal?</p>
                    <span className={`text-[14px] font-bold ${evaluation.complexity_analysis.is_optimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {evaluation.complexity_analysis.is_optimal ? 'Yes ✓' : 'No'}
                    </span>
                  </div>
                </div>
                {evaluation.complexity_analysis.explanation && (
                  <p className="text-[12px] text-[#666] mt-3 pt-3 border-t border-[#E8E6E0]">
                    {evaluation.complexity_analysis.explanation}
                  </p>
                )}
              </Card>
            )}

            {/* Back button */}
            <button 
              onClick={() => window.location.href = '/sessions'}
              className="w-full bg-[#1A1A2E] text-white h-[52px] rounded-xl font-bold text-[14px] hover:bg-[#2A2A4E] transition-all shadow-lg"
            >
              Return to Sessions
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main IDE Layout ──
  return (
    <div className="h-full flex flex-col bg-[#16161E] overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-white/10 bg-[#1E1E2E] flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors mr-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[12px] font-bold text-white/80">Coding Round</span>
          </div>
          <span className="text-white/20">/</span>
          <span className="text-[12px] text-white/50 max-w-[300px] truncate">
            {question?.title || 'Loading...'}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Run Error Toast */}
          {runError && (
            <span className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-400/10 px-3 py-1 rounded-md">
              <AlertCircle className="w-3 h-3" />
              {runError}
            </span>
          )}
          <div className="flex items-center gap-2 text-white/60">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-[13px] font-mono font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[11px] font-bold text-white/60 uppercase tracking-wider rounded">
            {activeLanguage}
          </span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 relative overflow-hidden">
        <Split 
          className="flex h-full split-horizontal"
          sizes={[42, 58]}
          minSize={280}
          gutterSize={3}
          gutterStyle={() => ({
            backgroundColor: 'rgba(255,255,255,0.05)',
            width: '3px',
            cursor: 'col-resize'
          })}
        >
          {/* Left: Problem Panel */}
          <div className="h-full overflow-hidden">
            <ProblemPanel question={question} />
          </div>

          {/* Right: Editor + Test Cases */}
          <div className="h-full overflow-hidden relative flex flex-col">
            {/* Editor fills available space minus test panel */}
            <div className="flex-1 overflow-hidden" style={{ marginBottom: '280px' }}>
              <EditorPanel 
                code={codeByLanguage[activeLanguage]} 
                language={activeLanguage}
                onChange={(val) => updateCode(val)}
              />
            </div>

            {/* Test Case Panel (absolute positioned at bottom) */}
            <TestCasePanel
              question={question}
              results={testResults}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              evaluation={evaluation}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>
        </Split>
      </div>
    </div>
  );
};

export default CodingRoom;
