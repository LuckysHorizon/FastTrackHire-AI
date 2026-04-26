import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, ChevronDown, Clock, Cpu, Tag, BarChart2 } from 'lucide-react';

const DIFF_STYLE = {
  easy: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  hard: 'bg-red-100 text-red-700 border border-red-200',
};

const ProblemPanel = ({ question }) => {
  const [activeTab, setActiveTab] = useState('problem');
  const [revealedHints, setRevealedHints] = useState([]);

  const revealHint = (idx) => {
    if (!revealedHints.includes(idx)) {
      setRevealedHints(prev => [...prev, idx]);
    }
  };

  if (!question) {
    return (
      <div className="h-full bg-[#FAFAF8] p-8 animate-pulse">
        <div className="h-7 bg-[#E8E6E0] rounded-lg w-2/3 mb-3" />
        <div className="h-4 bg-[#E8E6E0] rounded w-1/4 mb-8" />
        {[1,2,3,4].map(i => (
          <div key={i} className="h-4 bg-[#E8E6E0] rounded mb-3" style={{ width: `${90 - i*8}%` }} />
        ))}
      </div>
    );
  }

  const tabs = [
    { id: 'problem', label: 'Problem' },
    { id: 'hints', label: `Hints (${question.hints?.length || 0})` },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FAFAF8] overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-[#E8E6E0] bg-white shrink-0 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#1A1A2E] text-[#1A1A2E]'
                : 'border-transparent text-[#888] hover:text-[#444]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'problem' && (
          <div className="p-8 max-w-[760px]">
            {/* Title + Meta */}
            <h1 className="font-serif text-[26px] font-bold text-[#1A1A2E] mb-3 leading-tight">
              {question.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                DIFF_STYLE[question.difficulty] || DIFF_STYLE.medium
              }`}>
                {question.difficulty}
              </span>

              {question.topic_tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#F0EEE8] text-[#666] text-[11px] rounded-md font-medium">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}

              {question.estimated_minutes && (
                <span className="flex items-center gap-1 text-[11px] text-[#999] ml-auto">
                  <Clock className="w-3 h-3" />
                  ~{question.estimated_minutes} min
                </span>
              )}
            </div>

            {/* Problem Statement */}
            <div className="prose prose-sm max-w-none problem-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {question.problem_statement}
              </ReactMarkdown>
            </div>

            {/* Complexity */}
            {(question.time_complexity || question.space_complexity) && (
              <div className="mt-10 pt-6 border-t border-[#E8E6E0]">
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Expected Complexity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-[#E8E6E0] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1.5">Time</p>
                    <code className="text-[15px] font-mono font-bold text-[#1A1A2E]">
                      {question.time_complexity}
                    </code>
                  </div>
                  <div className="bg-white border border-[#E8E6E0] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1.5">Space</p>
                    <code className="text-[15px] font-mono font-bold text-[#1A1A2E]">
                      {question.space_complexity}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="p-8 max-w-[760px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-[#1A1A2E]">Progressive Hints</h3>
                <p className="text-[12px] text-[#888]">Reveal one at a time to preserve the challenge</p>
              </div>
            </div>

            <div className="space-y-3">
              {(question.hints || []).map((hint, idx) => (
                <div key={idx} className="border border-[#E8E6E0] rounded-xl overflow-hidden">
                  {revealedHints.includes(idx) ? (
                    <div className="p-5 bg-white">
                      <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2">
                        Hint {idx + 1}
                      </p>
                      <p className="text-[14px] text-[#333] leading-relaxed">{hint}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => revealHint(idx)}
                      disabled={idx > 0 && !revealedHints.includes(idx - 1)}
                      className="w-full p-5 bg-[#F8F7F4] flex items-center justify-between hover:bg-[#F0EEE8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-amber-600">{idx + 1}</span>
                        </div>
                        <span className="text-[13px] font-medium text-[#666]">
                          {idx > 0 && !revealedHints.includes(idx - 1) ? 'Reveal previous hint first' : 'Click to reveal hint'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#999]" />
                    </button>
                  )}
                </div>
              ))}

              {(!question.hints || question.hints.length === 0) && (
                <div className="text-center py-12 text-[#999]">
                  <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-[13px]">No hints available for this problem</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;
