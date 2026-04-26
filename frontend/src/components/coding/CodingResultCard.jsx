import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle, Code2, Terminal, Cpu } from 'lucide-react';

const CodingResultCard = ({ codingRound }) => {
  if (!codingRound || codingRound.status === 'pending') return null;

  const latestSubmission = codingRound.submissions?.[codingRound.submissions.length - 1];
  if (!latestSubmission) return null;

  const evaluation = latestSubmission.evaluation;
  const testResults = latestSubmission.test_results || [];
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-accent-light p-2 rounded-lg border border-accent/10">
          <Code2 className="w-5 h-5 text-accent" />
        </div>
        <h3 className="font-serif text-[24px] font-bold text-accent">Coding Assessment Evaluation</h3>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-[#1A1A2E] text-white p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Score Column */}
          <div className="lg:col-span-4 p-10 bg-white/5 flex flex-col items-center justify-center text-center border-r border-white/5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Technical Proficiency</p>
            <div className="relative mb-6">
                <h4 className="text-[64px] font-bold leading-none">{evaluation.overall_score || codingRound.final_score}</h4>
                <span className="absolute -right-8 top-2 text-[20px] font-medium opacity-20">/100</span>
            </div>
            <Badge className="bg-success text-white border-none px-4 py-1 uppercase tracking-widest">
                {evaluation.verdict || 'Accepted'}
            </Badge>
          </div>

          {/* Right: Breakdown */}
          <div className="lg:col-span-8 p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/40">Correctness</p>
                    <p className="text-[18px] font-bold text-white">{evaluation.correctness_score}/40</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/40">Quality</p>
                    <p className="text-[18px] font-bold text-white">{evaluation.quality_score}/30</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/40">Efficiency</p>
                    <p className="text-[18px] font-bold text-white">{evaluation.efficiency_score}/20</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/40">Time</p>
                    <p className="text-[18px] font-bold text-white">{evaluation.time_score}/10</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Terminal className="w-5 h-5 text-accent shrink-0" />
                    <div>
                        <p className="text-[13px] font-bold mb-1">Interviewer Summary</p>
                        <p className="text-[13px] text-white/70 leading-relaxed">{evaluation.summary}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-success/10 rounded-2xl border border-success/20">
                        <p className="text-[11px] font-bold text-success uppercase mb-2">Strengths</p>
                        <ul className="space-y-2">
                            {evaluation.strengths?.map((s, i) => (
                                <li key={i} className="text-[12px] flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 bg-warning/10 rounded-2xl border border-warning/20">
                        <p className="text-[11px] font-bold text-warning uppercase mb-2">Improvements</p>
                        <ul className="space-y-2">
                            {evaluation.improvements?.map((s, i) => (
                                <li key={i} className="text-[12px] flex items-center gap-2">
                                    <XCircle className="w-3 h-3" /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Tests & Complexity */}
        <div className="bg-black/20 p-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {testResults.map((res, i) => (
                            <div key={i} className={`w-3 h-3 rounded-sm ${res.passed ? 'bg-success' : 'bg-error'}`}></div>
                        ))}
                    </div>
                    <span className="text-[12px] font-bold text-white/60">{passedCount}/{totalCount} Tests Passed</span>
                </div>
            </div>

            <div className="flex items-center gap-6 text-[12px]">
                <div className="flex items-center gap-2 text-white/40">
                    <Cpu className="w-4 h-4" />
                    <span>Complexity:</span>
                </div>
                <div className="flex gap-4">
                    <span className="font-mono bg-white/5 px-2 py-1 rounded">Time: {evaluation.complexity_analysis?.user_time || 'O(N)'}</span>
                    <span className="font-mono bg-white/5 px-2 py-1 rounded">Space: {evaluation.complexity_analysis?.user_space || 'O(1)'}</span>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default CodingResultCard;
