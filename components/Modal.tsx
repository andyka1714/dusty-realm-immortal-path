import React from 'react';
import { GameTitleStack } from './game/GameTitleStack';
import { GameOrnamentFrame } from './game/GameOrnamentFrame';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

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
  if (!isOpen) return null;

  // Determine container classes based on size
  const containerClasses = size === 'large'
    ? "!left-0 !top-0 !h-full !w-full !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 p-0 md:!left-1/2 md:!top-1/2 md:!h-[90vh] md:!w-[90vw] md:!max-w-[1400px] md:!-translate-x-1/2 md:!-translate-y-1/2 md:rounded-[28px] md:border md:border-amber-700/20"
    : size === 'medium'
      ? "max-h-[calc(100vh-105px)] sm:max-h-[90vh] sm:max-w-4xl"
      : "max-h-[calc(100vh-105px)] sm:max-h-[90vh] sm:max-w-lg";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent
        hideClose
        aria-describedby={undefined}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className={`flex flex-col gap-0 overflow-hidden ${containerClasses}`}
        data-testid="game-modal"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <GameOrnamentFrame
          className={size === 'large' ? "md:rounded-[inherit]" : "rounded-[inherit]"}
          insetClassName={size === 'large' ? "md:rounded-[22px]" : "rounded-[18px]"}
        />

        {/* Header */}
        <DialogHeader className="relative z-10 flex-row items-center justify-between space-y-0 border-b border-stone-800/90 p-4 text-left">
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
          <Button
            onClick={onClose}
            aria-label="關閉視窗"
            variant="ghost"
            size="icon"
            className="rounded-full border border-stone-700/80 bg-stone-950/78 text-stone-500 hover:border-amber-500 hover:text-stone-200"
            data-testid="game-modal-close"
          >
            ×
          </Button>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};
