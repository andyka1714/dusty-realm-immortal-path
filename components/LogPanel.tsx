import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import clsx from 'clsx';
import { parseBattleLog } from '../utils/logParser';

export const LogPanel: React.FC = () => {
  const logs = useSelector((state: RootState) => state.logs.logs);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
  }, [logs]);

  // Logs are stored Newest First in state for efficiency if we cap it, 
  // but let's reverse them for chronological display (Old -> New)
  const displayLogs = [...logs].reverse();

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 h-64 md:h-full flex flex-col">
      <h3 className="text-stone-300 font-bold mb-3 border-b border-stone-800 pb-2 tracking-widest">
        修煉日誌
      </h3>
      <div 
        ref={bottomRef} // Reuse bottomRef as container ref for simplicity, though name is mismatch
        className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm scroll-smooth"
      >
        {displayLogs.length === 0 && (
          <p className="text-stone-600 text-center italic mt-10">暫無消息...</p>
        )}
        {displayLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 animate-fade-in">
            <span className="text-stone-600 text-xs whitespace-nowrap mt-0.5 opacity-50">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            <span className={clsx(
              "leading-relaxed break-words",
              log.type === 'info' && "text-stone-400",
              log.type === 'gain' && "text-stone-300",
              log.type === 'danger' && "text-red-400 font-bold", 
              log.type === 'success' && "text-amber-300 font-bold", 
              log.type === 'gold' && "text-yellow-400 font-bold",
              log.type === 'age' && "text-cyan-300/80 italic",
              log.type === 'epiphany' && "text-purple-300 font-bold shadow-purple-500/20 drop-shadow-sm",
              
              // Lifespan Warnings
              log.type === 'warning-low' && "text-yellow-400",
              log.type === 'warning-med' && "text-orange-500 font-bold",
              log.type === 'warning-critical' && "text-red-600 font-extrabold animate-pulse drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]"
            )}>
              {parseBattleLog(log.message)}
            </span>
          </div>
        ))}
        {/* Removed empty div ref */}
      </div>
    </div>
  );
};