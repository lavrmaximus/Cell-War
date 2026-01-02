import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      className={`px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-500 font-bold uppercase tracking-widest rounded-sm focus:outline-none transition-colors duration-200 ${className}`}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)",
        color: "#ffffff",
        borderColor: "#22d3ee", // cyan-400
        textShadow: "0 0 8px rgba(255,255,255,0.8)"
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default NeonButton;
