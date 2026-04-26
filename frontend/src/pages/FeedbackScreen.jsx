import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, TrendingUp, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';
import CodingResultCard from '../components/coding/CodingResultCard';

const FeedbackScreen = () => {
  const { sessionId } = useParams();
  const { API_URL } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem('token');
      try {
        setError(null);
        const res = await axios.get(`${API_URL}/sessions/${sessionId}/feedback?token=${token}`);
        setFeedback(res.data);
        
        // Also fetch session to get codingRound data
        const sRes = await axios.get(`${API_URL}/sessions/${sessionId}?token=${token}`);
        setSessionData(sRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to retrieve performance analytics. The session may still be processing.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [sessionId, API_URL]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-bg-muted border-t-accent rounded-full animate-spin mb-4"></div>
          <p className="text-text-tertiary font-sans text-[14px]">Generating report...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        {error && (
          <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center text-error text-[14px] font-medium mb-8">
             <AlertCircle className="w-5 h-5 mr-3" /> {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center text-text-tertiary hover:text-accent text-[13px] font-medium transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
            </button>
            <h2 className="font-serif text-[36px] font-bold text-accent">Performance Intelligence</h2>
            <p className="text-text-secondary">Comprehensive evaluation of your {feedback?.company || 'recent'} simulation.</p>
          </div>
          <Button variant="secondary" className="w-fit">
            <Download className="w-4 h-4 mr-2" /> Export PDF Report
          </Button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="text-center p-8 border-t-4 border-t-accent flex flex-col items-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Overall Score</p>
            <h3 className="text-[48px] font-bold text-accent leading-none">{feedback?.overallScore || 0}%</h3>
            <Badge variant="accent" className="mt-4 px-3 py-1 uppercase tracking-tighter">{feedback?.performanceLabel || 'Evaluating'}</Badge>
          </Card>
          <Card className="text-center p-8 flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary mb-2">DSA Technical</p>
            <h3 className="text-[32px] font-bold text-text-primary">{feedback?.dsaScore || 0}%</h3>
          </Card>
          <Card className="text-center p-8 flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Resume Alignment</p>
            <h3 className="text-[32px] font-bold text-text-primary">{feedback?.resumeScore || 0}%</h3>
          </Card>
          <Card className="text-center p-8 flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Communication</p>
            <h3 className="text-[32px] font-bold text-text-primary">{feedback?.communicationScore || 0}%</h3>
          </Card>
        </div>

        <Card className="mb-10 p-8 border-l-4 border-l-accent">
           <h4 className="font-bold text-[18px] mb-4 text-accent">Simulation Executive Summary</h4>
           <p className="text-text-secondary text-[16px] leading-relaxed italic">
             "{feedback?.overallFeedback || "Analyzing performance metrics..."}"
           </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <Card>
            <h4 className="font-bold text-[18px] mb-6 flex items-center text-accent">
              <CheckCircle2 className="w-5 h-5 text-success mr-3" /> Core Strengths
            </h4>
            <ul className="space-y-4">
              {feedback?.strengths?.map((s, i) => (
                <li key={i} className="flex items-start text-[14px] text-text-secondary leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 mr-3 shrink-0"></span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h4 className="font-bold text-[18px] mb-6 flex items-center text-accent">
              <XCircle className="w-5 h-5 text-error mr-3" /> Improvements Needed
            </h4>
            <ul className="space-y-4">
              {feedback?.improvements?.map((im, i) => (
                <li key={i} className="flex items-start text-[14px] text-text-secondary leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-error mt-2 mr-3 shrink-0"></span>
                  {im}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mb-10">
           <h4 className="font-bold text-[18px] mb-8 text-accent">Detailed Question Breakdown</h4>
           <div className="space-y-8">
             {feedback?.questionBreakdown?.map((q, i) => (
               <div key={i} className="border-b border-bg-muted pb-8 last:border-0 last:pb-0">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-bg-subtle border border-bg-muted flex items-center justify-center text-[12px] font-bold mr-4 text-accent">
                        {q.questionNumber || (i + 1)}
                      </span>
                      <h5 className="font-bold text-[15px] text-text-primary">{q.questionTitle}</h5>
                    </div>
                    <Badge 
                      variant={q.performanceRating === 'excellent' ? 'success' : q.performanceRating === 'good' ? 'info' : 'warning'}
                      className="w-fit"
                    >
                      {q.performanceRating}
                    </Badge>
                 </div>
                 <p className="text-[14px] text-text-secondary md:pl-12 leading-relaxed">
                   {q.feedback}
                 </p>
               </div>
             ))}
           </div>
        </Card>

        {sessionData?.codingRound && (
            <CodingResultCard codingRound={sessionData.codingRound} />
        )}

        <Card className="bg-accent text-text-inverse p-8 md:p-10 flex flex-col md:flex-row items-center justify-between rounded-2xl">
           <div className="mb-8 md:mb-0">
             <h4 className="font-serif text-[24px] font-bold mb-2">Next Intelligence Phase</h4>
             <p className="text-white/60 text-[15px]">Recommended action steps to reach the target performance tier.</p>
           </div>
           <div className="w-full md:w-auto space-y-3">
             {feedback?.nextSteps?.map((step, i) => (
               <div key={i} className="flex items-center text-[14px] font-medium bg-white/5 border border-white/10 px-4 py-3 rounded-lg">
                 <TrendingUp className="w-4 h-4 mr-3 text-success shrink-0" /> {step}
               </div>
             ))}
           </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackScreen;
