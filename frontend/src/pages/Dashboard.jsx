import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { FileText, Play, Activity, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, API_URL } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ avg_score: 0, total_count: 0 });
  const [resumeStatus, setResumeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const [sessionsRes, resumeRes] = await Promise.all([
          axios.get(`${API_URL}/sessions?token=${token}`),
          axios.get(`${API_URL}/resume?token=${token}`).catch(() => ({ data: { has_resume: false } }))
        ]);
        setSessions(sessionsRes.data?.sessions || []);
        setStats(sessionsRes.data?.stats || { avg_score: 0, total_count: 0 });
        setResumeStatus(resumeRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Failed to synchronize intelligence archive.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-bg-muted border-t-accent rounded-full animate-spin mb-4"></div>
          <p className="text-text-tertiary font-sans text-[14px]">Gathering intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center text-error text-[14px] font-medium mb-8">
           <AlertCircle className="w-5 h-5 mr-3" /> {error}
        </div>
      )}
      {/* Hero Section */}
      <div className="mb-10">
        <h2 className="font-serif text-[36px] font-bold text-accent mb-2">Welcome back, {user?.full_name?.split(' ')[0]}</h2>
        <p className="text-text-secondary text-[16px]">Ready to sharpen your interview skills today?</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Resume Card */}
        <Card variant="elevated" className="flex flex-col">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-6 text-accent">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold mb-2">Resume Intelligence</h3>
          <p className="text-text-secondary text-[14px] flex-1 mb-6">
            {resumeStatus?.has_resume 
              ? "Your resume is parsed and ready for role-specific interview simulation." 
              : "Upload your resume to enable personalized AI mock interviews."}
          </p>
          <div className="flex items-center justify-between mt-auto">
            {resumeStatus?.has_resume ? (
              <Badge variant="success" className="h-6"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>
            ) : (
              <Badge variant="warning" className="h-6">Missing</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/resume')}>
              {resumeStatus?.has_resume ? "Manage" : "Upload"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Start Interview Card */}
        <Card variant="elevated" className="bg-accent text-text-inverse border-none shadow-xl shadow-accent/10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-white">
            <Play className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold mb-2 text-white">Start Simulation</h3>
          <p className="text-white/70 text-[14px] flex-1 mb-6">
            Begin a high-stakes mock interview for FAANG or top-tier tech roles.
          </p>
          <Button 
            className="w-full bg-white text-accent hover:bg-white/90 border-none" 
            onClick={() => navigate('/interview/setup')}
          >
            Launch Interview Room
          </Button>
        </Card>

        {/* Analytics Card */}
        <Card variant="elevated">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-6 text-accent">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold mb-2">Session Insights</h3>
          <p className="text-text-secondary text-[14px] mb-6">
            Analyze your performance across {stats?.total_count || 0} recorded simulations.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-text-tertiary">Overall Preparedness</span>
              <span className="font-semibold text-text-primary">{stats?.avg_score || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${stats?.avg_score || 0}%` }}></div>
            </div>
            <p className="text-[11px] text-text-tertiary italic">Last updated {sessions[0] ? new Date(sessions[0].last_updated).toLocaleDateString() : 'recently'}</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <h3 className="text-[20px] font-bold mb-6">Recent Intelligence Logs</h3>
      <Card className="p-0 overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-bg-subtle text-text-tertiary text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Company Simulation</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-muted">
            {sessions.length > 0 ? sessions.slice(0, 5).map((session) => (
              <tr key={session.session_id} className="hover:bg-bg-subtle/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center font-bold text-[12px] mr-3 uppercase">
                      {session.company.charAt(0)}
                    </div>
                    <span className="font-medium text-[14px] text-text-primary">{session.company}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[14px] text-text-secondary">
                  {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-5">
                  {session.completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Badge variant="info">In Progress</Badge>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/interview/${session.session_id}${session.completed ? '/feedback' : ''}`)}>
                    View Log
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-text-tertiary italic text-[14px]">
                  No sessions recorded yet. Start your first interview to see analytics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
