import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Cpu } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-[90px] px-10 flex items-center justify-between sticky top-0 bg-bg-base/80 backdrop-blur-md z-50">
        <h1 className="font-serif text-[28px] font-bold text-accent">FastTrackHire</h1>
        <div className="hidden md:flex items-center space-x-8">
           <a href="#" className="text-[14px] font-medium text-text-secondary hover:text-accent transition-colors">Intelligence</a>
           <a href="#" className="text-[14px] font-medium text-text-secondary hover:text-accent transition-colors">Methodology</a>
           <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
           <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-10 max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="accent" className="mb-6 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold">
            The Future of Technical Assessment
          </Badge>
          <h2 className="font-serif text-[72px] leading-[1.1] font-bold text-accent mb-8 max-w-[900px] mx-auto">
            Editorial Precision in <span className="italic font-normal">AI Mock Interviews.</span>
          </h2>
          <p className="text-text-secondary text-[20px] max-w-[700px] mx-auto mb-12 leading-relaxed font-sans">
            FastTrackHire is a high-performance simulation engine designed to align candidate potential with organizational excellence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-[60px] px-10 text-[16px] w-full sm:w-auto" onClick={() => navigate('/auth')}>
              Launch Simulation Room
            </Button>
            <Button size="lg" variant="secondary" className="h-[60px] px-10 text-[16px] w-full sm:w-auto">
              Explore Platform
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-32 bg-accent text-text-inverse relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
        
        <div className="max-w-[1200px] mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Cpu, title: 'Neural Analysis', desc: 'Real-time linguistic and technical evaluation via Llama 3.1 architecture.' },
              { icon: Target, title: 'Role Specific', desc: 'Company-aligned challenges for Google, Amazon, Microsoft and more.' },
              { icon: Zap, title: 'Instant Feedback', desc: 'Structured intelligence reports within seconds of session completion.' },
              { icon: Shield, title: 'Verified Profiles', desc: 'Cross-verification between resume claims and live session data.' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:bg-white/20 transition-all group-hover:-translate-y-1">
                  <f.icon className="w-8 h-8" />
                </div>
                <h4 className="text-[18px] font-bold mb-3 tracking-tight">{f.title}</h4>
                <p className="text-white/50 text-[14px] leading-relaxed font-sans">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-10 bg-bg-surface text-center border-b border-bg-muted">
        <h3 className="font-serif text-[48px] font-bold text-accent mb-6 tracking-tight">Ready to excel?</h3>
        <p className="text-text-secondary text-[18px] mb-10 opacity-70">Join thousands of engineers sharpening their edge with FastTrackHire.</p>
        <Button size="lg" className="h-[60px] px-12 rounded-full" onClick={() => navigate('/auth')}>
          Start Your Assessment
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-bg-base px-10 text-center">
         <h1 className="font-serif text-[24px] font-bold text-accent mb-6">FastTrackHire</h1>
         <p className="text-text-tertiary text-[12px] uppercase tracking-widest font-bold">Editorial Precision • Neural Intelligence • Technical Excellence</p>
         <div className="mt-8 pt-8 border-t border-bg-muted flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-[13px] text-text-tertiary">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">System Status</a>
         </div>
         <p className="mt-12 text-text-tertiary text-[12px] opacity-50">© 2026 FastTrackHire Intelligence. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
