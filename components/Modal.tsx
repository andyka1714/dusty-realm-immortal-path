import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { GameTitleStack } from './game/GameTitleStack';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'default' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  eyebrow = 'IMMORTAL RECORD',
  icon,
  children, 
  actions, 
  size = 'default' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // Determine container classes based on size
  const containerClasses = size === 'large'
    ? "relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-[1400px] border-0 md:border md:border-amber-700/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(42,31,10,0.9)_0%,rgba(12,12,12,0.94)_18%,rgba(8,8,8,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.72)] flex flex-col md:rounded-[28px]"
    : size === 'medium'
      ? "relative w-full max-w-4xl max-h-[calc(100vh-105px)] md:max-h-[90vh] border border-amber-700/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(42,31,10,0.9)_0%,rgba(12,12,12,0.94)_20%,rgba(8,8,8,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.72)] flex flex-col rounded-[24px]"
      : "relative max-w-lg w-full max-h-[calc(100vh-105px)] md:max-h-[90vh] border border-amber-700/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(42,31,10,0.9)_0%,rgba(12,12,12,0.94)_20%,rgba(8,8,8,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.72)] flex flex-col rounded-[24px]";

  // Wrapper padding: Remove padding on mobile for large modals to ensure full screen
  const wrapperClasses = size === 'large'
    ? "fixed inset-0 z-[5000] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    : "fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in";

  const modalContent = (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        <div className={clsx(
          "pointer-events-none absolute inset-0 overflow-hidden",
          size === 'large' ? "md:rounded-[inherit]" : "rounded-[inherit]"
        )}>
          <div className={clsx(
            "absolute inset-[12px] border border-stone-800/70 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.04)]",
            size === 'large' ? "md:rounded-[22px]" : "rounded-[18px]"
          )}></div>
          <div className="absolute left-4 top-4 h-6 w-6 rounded-tl-[10px] border-l border-t border-amber-400/25"></div>
          <div className="absolute right-4 top-4 h-6 w-6 rounded-tr-[10px] border-r border-t border-amber-400/25"></div>
          <div className="absolute bottom-4 left-4 h-6 w-6 rounded-bl-[10px] border-b border-l border-stone-500/25"></div>
          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-br-[10px] border-b border-r border-stone-500/25"></div>
          <div className="absolute inset-x-6 top-[10px] h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
          <div className="absolute inset-x-10 top-[58px] h-px bg-gradient-to-r from-transparent via-stone-500/20 to-transparent"></div>
          <div className="absolute -right-10 top-3 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl"></div>
          <div className="absolute left-8 top-5 rounded-full border border-amber-500/15 bg-black/20 px-3 py-1 text-[10px] tracking-[0.28em] text-amber-200/65">
            {eyebrow}
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-stone-800/90 p-4 flex-none">
          <GameTitleStack
            eyebrow={eyebrow}
            title={title}
            icon={
              icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-700/30 bg-black/25 text-amber-400 shadow-[0_8px_18px_rgba(0,0,0,0.35)]">
                  {icon}
                </div>
              ) : undefined
            }
            titleClassName="truncate text-xl tracking-[0.16em] text-amber-400"
          />
          <button 
            onClick={onClose}
            className="rounded-full border border-stone-700/80 bg-stone-950/78 p-2 text-stone-500 transition-colors hover:border-amber-500 hover:text-stone-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Flex grow to fill available space */}
        <div className="relative z-10 p-0 pt-2 md:p-6 md:pt-8 overflow-y-auto text-stone-300 flex-1 bg-stone-950/35">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="relative z-10 flex justify-end gap-3 border-t border-stone-800/90 bg-stone-950/25 p-4 flex-none">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
