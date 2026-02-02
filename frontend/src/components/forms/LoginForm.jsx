import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { authAPI } from '../../services/authAPI';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../ui/Loader';
import { motion, AnimatePresence } from 'framer-motion';

// Simple fade-in animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show loader while checking auth
  if (authLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { email, password } = formData;
      const response = await authAPI.login({ email, password });
      
      console.log('Login successful:', response);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="h-fit bg-[#0B0B0F] flex items-center justify-center px-4 mt-47.5 pb-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="w-full max-w-md my-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div 
          className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8"
          variants={fadeIn}
        >
          <motion.div className="text-center mb-8" variants={fadeIn}>
            <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Welcome Back</h1>
            <p className="text-[#818897]">Sign in to continue to Rosync</p>
          </motion.div>
          
          <motion.form onSubmit={handleSubmit} className="space-y-6" variants={fadeIn}>
            <div>
              <label className="block text-sm font-medium text-[#C3C2C4] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-xl text-[#FFFFFF] placeholder-[#818897] focus:outline-none focus:border-[#29C762] transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#C3C2C4] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-xl text-[#FFFFFF] placeholder-[#818897] focus:outline-none focus:border-[#29C762] transition-all duration-200 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#818897] hover:text-[#FFFFFF] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </motion.form>
          
          <motion.p className="text-center mt-6 text-[#C3C2C4]" variants={fadeIn}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#29C762] font-medium hover:underline">
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
