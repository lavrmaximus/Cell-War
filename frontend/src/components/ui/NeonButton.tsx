import React from 'react';
import { cn } from '../../utils/cn';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, className, disabled, ...props }) => {
    return (
        <button
            disabled={disabled}
            className={cn(
                'px-6 py-3 bg-transparent border-2 border-cyan-600/70 text-cyan-400 font-bold uppercase tracking-widest text-sm rounded-sm',
                'transition-all duration-150 font-mono',
                'hover:bg-cyan-950 hover:border-cyan-400 hover:text-white hover:shadow-neon-cyan',
                'active:scale-95',
                'disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed disabled:shadow-none',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default NeonButton;
