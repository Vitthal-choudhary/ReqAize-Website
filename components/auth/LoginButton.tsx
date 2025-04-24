"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from './LoginModal';
import { UserAvatar } from './UserAvatar';
import { useAuth } from './AuthContext';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;

  if (user) {
    return <UserAvatar />;
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Button>
      </motion.div>
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 