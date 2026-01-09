
import React from 'react';

// Regex Helpers
export const parseBattleLog = (message: string) => {
    // Regex Logic
    // Splits by tags and maps to spans
    // Supports nested logic? No, flat structure assumed mostly.
    
    // We can use a simple split by regex capturing group
    // Regex: /(<[^>]+>.*?<\/[^>]+>)/g
    const parts = message.split(/(<[^>]+>.*?<\/[^>]+>)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('<player>')) {
            const content = part.replace(/<\/?player>/g, '');
            return <span key={index} className="text-cyan-400 font-bold">{content}</span>;
        }
        if (part.startsWith('<enemy')) {
            const match = part.match(/<enemy rank="([^"]+)">(.+?)<\/enemy>/);
            if (match) {
                const rank = match[1];
                const content = match[2];
                let color = "text-stone-400"; // Common
                if (rank === 'Elite') color = "text-blue-400"; // Elite
                if (rank === 'Boss') color = "text-red-500 font-bold"; // Boss
                return <span key={index} className={`${color}`}>[{content}]</span>;
            }
        }
        if (part.startsWith('<item')) {
            const match = part.match(/<item q="(\d+)">(.+?)<\/item>/);
            if (match) {
                const q = parseInt(match[1]);
                const content = match[2];
                let color = "text-stone-400";
                if (q === 1) color = "text-emerald-400"; // Medium (Green)
                if (q === 2) color = "text-blue-400";    // High (Blue)
                if (q === 3) color = "text-amber-400";   // Immortal (Gold)
                if (q >= 4) color = "text-purple-400";   // Future/Special?
                return <span key={index} className={`${color} font-bold`}>[{content}]</span>;
            }
        }
        if (part.startsWith('<stones>')) {
             const content = part.replace(/<\/?stones>/g, '');
             return <span key={index} className="text-sky-300 font-bold">{content}</span>;
        }
        if (part.startsWith('<dmg>')) {
             const content = part.replace(/<\/?dmg>/g, '');
             return <span key={index} className="text-white font-bold">{content}</span>;
        }
        if (part.startsWith('<acc>')) {
             const content = part.replace(/<\/?acc>/g, '');
             return <span key={index} className="text-amber-500 font-bold">{content}</span>;
        }
        
        if (part.startsWith('<exp>')) {
             const content = part.replace(/<\/?exp>/g, '');
             return <span key={index} className="text-emerald-400 font-bold">{content}</span>;
        }
        
        return <span key={index}>{part}</span>;
    });
};
