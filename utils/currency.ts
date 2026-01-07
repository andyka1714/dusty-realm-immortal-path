
export const formatSpiritStone = (amount: number): string => {
    if (amount < 1000) {
        return `${Math.floor(amount)} 下品`;
    }
    
    const parts = [];
    let remaining = Math.floor(amount);

    const ultimate = Math.floor(remaining / 1000000000);
    remaining %= 1000000000;

    const high = Math.floor(remaining / 1000000);
    remaining %= 1000000;

    const medium = Math.floor(remaining / 1000);
    remaining %= 1000;

    const low = remaining;

    if (ultimate > 0) parts.push(`${ultimate} 極品`);
    if (high > 0) parts.push(`${high} 上品`);
    if (medium > 0) parts.push(`${medium} 中品`);
    if (low > 0) parts.push(`${low} 下品`);

    // Only show top 2 units to avoid clutter (e.g., "1極品 5上品" instead of "1極品 5上品 3中品 20下品")
    return parts.slice(0, 2).join(' ');
};

export const parseSpiritStone = (amount: number): { ultimate: number, high: number, medium: number, low: number } => {
    let remaining = Math.floor(amount);
    const ultimate = Math.floor(remaining / 1000000000);
    remaining %= 1000000000;
    const high = Math.floor(remaining / 1000000);
    remaining %= 1000000;
    const medium = Math.floor(remaining / 1000);
    remaining %= 1000;
    const low = remaining;
    
    return { ultimate, high, medium, low };
}
