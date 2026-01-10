
import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'default' | 'large'; // Added size prop
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions, 
  size = 'default' 
}) => {
  if (!isOpen) return null;

  // Determine container classes based on size
  const containerClasses = size === 'large'
    ? "w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-[1400px] bg-stone-900 border-0 md:border md:border-stone-700 md:rounded-xl shadow-2xl flex flex-col"
    : "bg-stone-900 border border-stone-700 rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[calc(100vh-105px)] md:max-h-[90vh]";

  // Wrapper padding: Remove padding on mobile for large modals to ensure full screen
  const wrapperClasses = size === 'large'
    ? "fixed inset-x-0 bottom-0 top-[73px] md:inset-0 z-[5000] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    : "fixed inset-x-0 bottom-0 top-[73px] md:inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in";

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 flex-none">
          <h3 className="text-xl font-bold text-amber-500 tracking-wider">{title}</h3>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200 transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Flex grow to fill available space */}
        <div className="p-0 md:p-6 overflow-y-auto text-stone-300 flex-1 relative bg-stone-950/50">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="p-4 border-t border-stone-800 bg-stone-950/30 flex justify-end gap-3 rounded-b-xl flex-none">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
