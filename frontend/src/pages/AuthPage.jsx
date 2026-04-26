import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await signup(formData);
        setIsLogin(true);
        setError('Account created! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-[440px]">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-[32px] font-bold text-accent mb-2">FastTrackHire</h1>
          <p className="text-text-secondary font-sans tracking-wide uppercase text-[11px] font-semibold">
            The Editorial Interview Intelligence
          </p>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          <div className="flex border-b border-bg-muted mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-[14px] font-medium transition-all ${isLogin ? 'text-accent border-b-2 border-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-[14px] font-medium transition-all ${!isLogin ? 'text-accent border-b-2 border-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-2 space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  key="signup-fields"
                  className="grid grid-cols-2 gap-4"
                >
                  <Input
                    label="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {error && (
              <p className={`text-[13px] text-center ${error.includes('Account created') ? 'text-success' : 'text-error'}`}>
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-8 text-center pb-6">
            <p className="text-[13px] text-text-tertiary">
              By continuing, you agree to our <span className="text-text-secondary underline cursor-pointer">Terms of Service</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
