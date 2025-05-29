'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up',
}: FadeInProps) {
  // 방향에 따른 시작 위치 설정
  let initial: { opacity: number; y?: number; x?: number } = { opacity: 0 };
  
  if (direction === 'up') {
    initial = { ...initial, y: 20 };
  } else if (direction === 'down') {
    initial = { ...initial, y: -20 };
  } else if (direction === 'left') {
    initial = { ...initial, x: 20 };
  } else if (direction === 'right') {
    initial = { ...initial, x: -20 };
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={initial}
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration,
          delay,
          ease: 'easeOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 