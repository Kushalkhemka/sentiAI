
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/chat';

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  useEffect(() => {
    // Fixed redirection logic
    if (user && !isLoading) {
      console.log("User is logged in, redirecting to chat page", user);
      navigate('/chat');
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (user: User) => {
    console.log("Login attempt with:", user.email);
    const result = await login({ email: user.email, password: '' });
    if (result) {
      console.log("Login successful, redirecting");
      navigate('/chat');
    }
  };

  const handleSignup = async (user: User) => {
    console.log("Signup attempt with:", user.email);
    const result = await signup({ email: user.email, password: '', name: user.name });
    if (result) {
      console.log("Signup successful, redirecting");
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-background via-background to-secondary/20">
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-2">
            Empathetic AI Chat
          </h1>
          <p className="text-muted-foreground max-w-[42rem] leading-normal mx-auto">
            Your compassionate AI companion for emotional support and well-being
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AuthForm onLogin={handleLogin} onSignup={handleSignup} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>By using this service, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">
            This AI assistant is designed for emotional support and is not a substitute for professional mental health services.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
