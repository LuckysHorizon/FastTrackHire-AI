import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const companies = [
  { id: 'Google', logo: 'G', color: '#4285F4' },
  { id: 'Amazon', logo: 'A', color: '#FF9900' },
  { id: 'Microsoft', logo: 'M', color: '#00A4EF' },
  { id: 'Apple', logo: '', color: '#555555' },
  { id: 'Meta', logo: 'M', color: '#0082FB' },
  { id: 'Netflix', logo: 'N', color: '#E50914' },
];

const InterviewSetup = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/sessions/create?token=${token}`, {
        companyId: selectedCompany.id
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
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[24px] font-bold mb-4 shadow-lg"
                  style={{ backgroundColor: company.color }}
                >
                  {company.logo}
                </div>
                <h4 className="text-[16px] font-bold text-accent">{company.id}</h4>
                <p className="text-[12px] text-text-tertiary mt-1">Technical Simulation</p>
              </Card>
            </motion.div>
          ))}
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
