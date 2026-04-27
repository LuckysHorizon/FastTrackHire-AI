import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Code2, ChevronRight } from 'lucide-react';

import { COMPANY_LOGOS } from '../lib/logos';

const companies = Object.entries(COMPANY_LOGOS).map(([id, data]) => ({
  id,
  ...data
}));

const InterviewSetup = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [codingEnabled, setCodingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('python');
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/sessions/create?token=${token}`, {
        companyId: selectedCompany.id,
        codingEnabled: codingEnabled
      });
      navigate(`/interview/${res.data.sessionId}`);
    } catch (err) {
      console.error("Error starting session", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[800px] mx-auto pt-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-[36px] font-bold text-accent mb-4">Target Simulation</h2>
          <p className="text-text-secondary text-[16px]">Select the organization you wish to simulate an interview with.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {companies.map((company) => (
            <motion.div
              key={company.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCompany(company)}
              className="cursor-pointer"
            >
              <Card 
                className={`flex flex-col items-center text-center p-8 transition-all border-2 ${
                  selectedCompany?.id === company.id 
                    ? 'border-accent bg-accent-light ring-4 ring-accent/5' 
                    : 'border-bg-muted hover:border-bg-muted hover:bg-bg-surface/50'
                }`}
              >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-white overflow-hidden border border-bg-muted p-3"
                >
                  <img 
                    src={company.logo} 
                    alt={company.id} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-white text-[24px] font-bold" style="background-color: ${company.color}">
                          ${company.id.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                </div>
                <h4 className="text-[16px] font-bold text-accent">{company.id}</h4>
                <p className="text-[12px] text-text-tertiary mt-1">Technical Simulation</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coding Round Toggle */}
        <div className="max-w-[500px] mx-auto mb-12">
            <Card className="p-6 border-bg-muted bg-bg-surface/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center text-accent">
                            <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-[15px] font-bold text-accent">Coding Assessment</h4>
                            <p className="text-[12px] text-text-tertiary">Add a 45-minute coding challenge</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setCodingEnabled(!codingEnabled)}
                        className={`w-12 h-6 rounded-full transition-all relative ${codingEnabled ? 'bg-accent' : 'bg-bg-muted'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${codingEnabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                {codingEnabled && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-6 border-t border-bg-muted space-y-4"
                    >
                        <div className="relative">
                            <label className="text-[11px] font-bold text-text-tertiary uppercase mb-2 block">Preferred Language</label>
                            <div className="relative">
                                <button 
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="w-full h-12 bg-bg-surface border border-bg-muted rounded-xl px-4 flex items-center justify-between text-[14px] font-medium text-text-primary hover:bg-bg-subtle/50 transition-all focus:border-accent focus:ring-4 focus:ring-accent/5"
                                >
                                    <div className="flex items-center">
                                        <Code2 className="w-4 h-4 mr-3 text-accent" />
                                        <span>
                                            {preferredLanguage === 'python' && 'Python 3'}
                                            {preferredLanguage === 'javascript' && 'JavaScript (Node.js)'}
                                            {preferredLanguage === 'java' && 'Java 17'}
                                            {preferredLanguage === 'cpp' && 'C++ 17'}
                                            {preferredLanguage === 'go' && 'Go 1.21'}
                                        </span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
                                </button>

                                {isOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-bg-surface border border-bg-muted rounded-xl shadow-xl z-20 overflow-hidden py-1"
                                        >
                                            {[
                                                { id: 'python', label: 'Python 3' },
                                                { id: 'javascript', label: 'JavaScript (Node.js)' },
                                                { id: 'java', label: 'Java 17' },
                                                { id: 'cpp', label: 'C++ 17' },
                                                { id: 'go', label: 'Go 1.21' }
                                            ].map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => {
                                                        setPreferredLanguage(lang.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-[14px] flex items-center justify-between hover:bg-bg-subtle transition-colors ${
                                                        preferredLanguage === lang.id ? 'text-accent font-bold bg-accent/5' : 'text-text-secondary font-medium'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${preferredLanguage === lang.id ? 'bg-accent' : 'bg-transparent'}`}></div>
                                                        {lang.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-success-light text-success text-[10px] font-bold rounded uppercase">3 Visible Tests</span>
                            <span className="px-2 py-1 bg-success-light text-success text-[10px] font-bold rounded uppercase">5 Hidden Tests</span>
                            <span className="px-2 py-1 bg-accent-light text-accent text-[10px] font-bold rounded uppercase">AI Scored</span>
                        </div>
                    </motion.div>
                )}
            </Card>
        </div>

        <div className="flex flex-col items-center">
          <Button 
            size="lg" 
            className="w-full max-w-[320px] mb-4 h-[56px] text-[16px]" 
            disabled={!selectedCompany || loading}
            onClick={handleStart}
          >
            {loading ? 'Initializing Session...' : 'Enter Interview Room'}
          </Button>
          <p className="text-[13px] text-text-tertiary flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse"></span>
            High-stakes simulation including DSA and Resume verification.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewSetup;
