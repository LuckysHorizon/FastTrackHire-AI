import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, CheckCircle2, XCircle,
  Play, Send, Loader2, AlertTriangle, Clock, Cpu, Eye, EyeOff
} from 'lucide-react';

const TestCasePanel = ({ question, results, isRunning, isSubmitting, evaluation, onRun, onSubmit }) => {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const visibleResults = results ? results.filter(r => !r.is_hidden) : [];
  const passedVisible = visibleResults.filter(r => r.passed).length;
  const totalVisible = visibleResults.length;
  const allPassed = totalVisible > 0 && passedVisible === totalVisible;
  const nonePassed = totalVisible > 0 && passedVisible === 0;

  const activeResult = visibleResults[activeTab];

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-[#1E1E2E] border-t border-white/10 transition-all duration-300 z-30 ${
        expanded ? 'h-[280px]' : 'h-[44px]'
      }`}
    >
      {/* Panel Header */}
      <div className="h-[44px] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        {/* Left: Toggle + Case Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>Test Cases</span>
            {results && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                allPassed ? 'bg-emerald-500/20 text-emerald-400' :
                nonePassed ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {passedVisible}/{totalVisible}
              </span>
            )}
          </button>

          {expanded && visibleResults.length > 0 && (
            <div className="flex gap-1.5 ml-2">
              {visibleResults.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all ${
                    activeTab === idx
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${res.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  Case {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Run Code */}
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[12px] font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          {/* Submit Final */}
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? 'Evaluating...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {expanded && (
        <div className="h-[calc(280px-44px)] overflow-hidden">
          {/* Loading State */}
          {(isRunning || isSubmitting) && (
            <div className="h-full flex flex-col items-center justify-center text-white/50">
              <Loader2 className="w-7 h-7 animate-spin mb-3 text-emerald-400" />
              <p className="text-[13px] font-medium">
                {isSubmitting ? 'Running all test cases and evaluating...' : 'Executing against visible test cases...'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isRunning && !isSubmitting && !results && (
            <div className="h-full flex flex-col items-center justify-center text-white/30">
              <Play className="w-7 h-7 mb-3" />
              <p className="text-[13px]">Run your code to see results</p>
              <p className="text-[11px] mt-1">Tests against {question?.visible_test_cases?.length || 3} visible cases</p>
            </div>
          )}

          {/* Results */}
          {!isRunning && !isSubmitting && visibleResults.length > 0 && activeResult && (
            <div className="h-full flex flex-col">
              {/* Result status bar */}
              <div className={`flex items-center gap-3 px-5 py-2 text-[12px] font-medium border-b border-white/5 ${
                activeResult.passed ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'
              }`}>
                {activeResult.passed
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <XCircle className="w-4 h-4" />
                }
                <span>{activeResult.passed ? 'Accepted' : activeResult.status || 'Wrong Answer'}</span>
                {activeResult.runtime_ms && (
                  <span className="text-white/40 flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" />
                    {activeResult.runtime_ms.toFixed(1)}ms
                  </span>
                )}
                {activeResult.memory_kb && (
                  <span className="text-white/40 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {(activeResult.memory_kb / 1024).toFixed(1)}MB
                  </span>
                )}
              </div>

              {/* Test case IO grid */}
              <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden divide-x divide-white/5">
                {/* Input */}
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 pt-4 pb-2">Input</p>
                  <pre className="flex-1 px-4 pb-4 font-mono text-[12px] text-white/70 overflow-auto no-scrollbar whitespace-pre-wrap">
                    {activeResult.input_raw || 'n/a'}
                  </pre>
                </div>
                {/* Expected */}
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest px-4 pt-4 pb-2">Expected Output</p>
                  <pre className="flex-1 px-4 pb-4 font-mono text-[12px] text-emerald-400 overflow-auto no-scrollbar whitespace-pre-wrap">
                    {activeResult.expected_output}
                  </pre>
                </div>
                {/* Actual */}
                <div className="flex flex-col overflow-hidden">
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-2 ${
                    activeResult.passed ? 'text-emerald-400/60' : 'text-red-400/60'
                  }`}>Your Output</p>
                  <pre className={`flex-1 px-4 pb-4 font-mono text-[12px] overflow-auto no-scrollbar whitespace-pre-wrap ${
                    activeResult.passed ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activeResult.actual_output
                      ? activeResult.actual_output
                      : activeResult.stderr
                        ? <span className="text-orange-400">{activeResult.stderr}</span>
                        : <span className="text-white/30 italic">No output</span>
                    }
                  </pre>
                </div>
              </div>

              {/* Stderr/compile error */}
              {activeResult.stderr && !activeResult.passed && (
                <div className="px-4 py-3 bg-orange-900/20 border-t border-orange-500/20 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                  <pre className="text-[11px] text-orange-300 font-mono overflow-x-auto no-scrollbar whitespace-pre-wrap">
                    {activeResult.stderr}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Evaluation result after submit */}
          {!isRunning && !isSubmitting && evaluation && visibleResults.length === 0 && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className={`text-[48px] font-bold mb-2 ${
                  evaluation.overall_score >= 70 ? 'text-emerald-400' :
                  evaluation.overall_score >= 40 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {evaluation.overall_score}<span className="text-[20px] text-white/30">/100</span>
                </div>
                <p className="text-white/60 text-[13px]">{evaluation.verdict}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;
