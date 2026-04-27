import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, ChevronRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COMPANY_LOGOS } from '../lib/logos';
import { useAppStore } from '../stores/appStore';

const SessionsList = () => {
  const { API_URL } = useAuth();
  const { sessions, loading, fetchDashboardData } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData(API_URL, token);
    }
  }, [API_URL, fetchDashboardData]);

  const filteredSessions = sessions.filter(s => 
    s.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto pt-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-serif text-[36px] font-bold text-accent">Session Archive</h2>
            <p className="text-text-secondary text-[16px]">Review and analyze your simulation historical data.</p>
          </div>
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search by company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-surface border border-bg-muted rounded-full pl-11 pr-6 py-3 text-[14px] w-full md:w-[320px] focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-text-tertiary italic">Analyzing archives...</div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card 
                key={session.session_id} 
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-bg-muted hover:border-accent/20"
                onClick={() => navigate(`/interview/${session.session_id}${session.completed ? '/feedback' : ''}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-white border border-bg-muted flex items-center justify-center mr-5 overflow-hidden p-2 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                      {COMPANY_LOGOS[session.company] ? (
                        <img 
                          src={COMPANY_LOGOS[session.company].logo} 
                          alt={session.company} 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = "w-full h-full bg-accent text-white flex items-center justify-center font-bold text-[16px] uppercase";
                            fallback.innerText = session.company.charAt(0);
                            e.target.parentElement.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-accent text-white flex items-center justify-center font-bold text-[16px] uppercase">
                          {session.company.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[17px] font-bold text-accent group-hover:text-accent-hover transition-colors">{session.company}</h4>
                      <div className="flex items-center mt-1 text-[13px] text-text-tertiary">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        <span className="mx-2 text-bg-muted">|</span>
                        <span>Technical Assessment</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="hidden md:block text-right mr-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1">Session Status</p>
                      {session.completed ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="info">In Progress</Badge>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-bg-muted flex items-center justify-center text-text-tertiary group-hover:border-accent group-hover:text-accent group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center mb-6">
              <History className="w-8 h-8 text-text-tertiary opacity-30" />
            </div>
            <h5 className="font-bold text-text-secondary text-[18px]">No matching simulations found</h5>
            <p className="text-text-tertiary max-w-[320px] mt-2 text-[14px]">Adjust your search or start a new simulation to begin building your intelligence archive.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SessionsList;
