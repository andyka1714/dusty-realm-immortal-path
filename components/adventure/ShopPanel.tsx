import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { SHOPS, ShopItem } from '../../data/shops';
import { ITEMS } from '../../data/items';
import { ItemQuality, ItemCategory, EquipmentSlot, MajorRealm } from '../../types';
import { REALM_NAMES } from '../../constants';
import { formatSpiritStone } from '../../utils/currency';
import { spendSpiritStones } from '../../store/slices/characterSlice';
import { addItem } from '../../store/slices/inventorySlice';
import { addLog } from '../../store/slices/logSlice';
import { X, ShoppingBag, Coins, Package, Shield, Sword, FlaskConical, CircleDashed, Footprints, Crown, Shirt, Medal, Check } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../Modal';

interface ShopPanelProps {
    shopId: string;
    onClose: () => void;
}

// Visual Helpers (Synced with Inventory)
const getQualityBorderColor = (quality: ItemQuality) => {
  switch(quality) {
    case ItemQuality.Low: return 'border-stone-700';
    case ItemQuality.Medium: return 'border-emerald-800/60 bg-emerald-950/10';
    case ItemQuality.High: return 'border-blue-800/60 bg-blue-950/10';
    case ItemQuality.Immortal: return 'border-amber-600/60 bg-amber-950/20';
    default: return 'border-stone-800';
  }
};

const getQualityTextColor = (quality: ItemQuality) => {
  switch(quality) {
    case ItemQuality.Low: return 'text-stone-400';
    case ItemQuality.Medium: return 'text-emerald-400';
    case ItemQuality.High: return 'text-blue-400';
    case ItemQuality.Immortal: return 'text-amber-400';
    default: return 'text-stone-500';
  }
};

const getQualityName = (quality: ItemQuality) => {
    switch(quality) {
        case ItemQuality.Low: return '下品';
        case ItemQuality.Medium: return '中品';
        case ItemQuality.High: return '上品';
        case ItemQuality.Immortal: return '仙品';
        default: return '';
    }
};

const ShopPanel: React.FC<ShopPanelProps> = ({ shopId, onClose }) => {
    const dispatch = useDispatch();
    const character = useSelector((state: RootState) => state.character);
    const shop = SHOPS[shopId];
    
    // UI Effects State
    const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string}[]>([]);
    const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);

    // Safety check
    if (!shop) return null;

    const handleBuy = (shopItem: ShopItem) => {
        const item = ITEMS[shopItem.itemId];
        if (!item) return;

        const price = shopItem.price ?? item.price;
        
        if (character.spiritStones < price) {
            dispatch(addLog({ 
                message: `靈石不足，無法購買 [${item.name}]。`, 
                type: 'warning-low'
            }));
            return;
        }

        // Transaction
        dispatch(spendSpiritStones(price));
        dispatch(addItem({ itemId: item.id, count: 1 }));
        dispatch(addLog({ 
            message: `花費 ${price} 靈石購買了 [${item.name}]。`, 
            type: 'gold'
        }));

        // Trigger Effects
        const effectId = Date.now();
        setFloatingTexts(prev => [...prev, { id: effectId, text: `-${price}` }]);
        setRecentlyPurchased(shopItem.itemId);

        // Cleanup effects
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== effectId));
        }, 1000);

        setTimeout(() => {
            setRecentlyPurchased(prev => prev === shopItem.itemId ? null : prev);
        }, 1000);
    };

    return (
        <Modal 
            isOpen={true} 
            onClose={onClose}
            title={shop.name}
            icon={<ShoppingBag size={20} className="text-amber-500" />}
            size="medium"
        >
            <div className="flex flex-col h-full bg-stone-900/50">
                {/* Header Info */}
                <div className="p-4 border-b border-stone-800 flex flex-col md:flex-row gap-3 md:gap-0 md:justify-between items-start md:items-center bg-stone-950/80 relative">
                    <p className="text-stone-400 text-sm italic">{shop.description}</p>
                    <div className="relative">
                        <div className="flex items-center gap-2 text-amber-500 font-mono font-bold bg-black/40 px-3 py-1 rounded border border-amber-900/30 self-end md:self-auto transition-all duration-300">
                            <Coins size={14} />
                            {formatSpiritStone(character.spiritStones)}
                        </div>
                        {/* Floating Cost Effects */}
                        {floatingTexts.map(ft => (
                           <div key={ft.id} className="absolute right-0 top-full mt-1 text-red-400 font-mono font-bold text-sm pointer-events-none animate-float-down">
                               {ft.text}
                           </div>
                        ))}
                    </div>
                </div>

                {/* Item List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
                    {shop.items.map((shopItem, idx) => {
                        const item = ITEMS[shopItem.itemId];
                        if (!item) return null; // Skip invalid items
                        
                        // User Request: Only show equipment for the current realm
                        if (item.category === ItemCategory.Equipment && item.minRealm !== undefined && item.minRealm !== character.majorRealm) {
                            return null;
                        }
                        
                        const price = shopItem.price ?? item.price;
                        const canAfford = character.spiritStones >= price;
                        const isJustPurchased = recentlyPurchased === shopItem.itemId;
                        
                        const qualityBorder = getQualityBorderColor(item.quality);
                        const qualityText = getQualityTextColor(item.quality);
                        const qualityName = getQualityName(item.quality);
                        
                        // Determine Realm Name
                        const realmName = item.minRealm !== undefined ? REALM_NAMES[item.minRealm] : '';

                        return (
                            <div key={idx} className={`bg-stone-900 border rounded p-3 flex items-center gap-4 hover:border-stone-600 transition-colors group ${qualityBorder}`}>
                                {/* Icon / Visual */}
                                <div className="w-12 h-12 flex items-center justify-center rounded bg-stone-950/30 shrink-0">
                                    {item.category === ItemCategory.Equipment && (
                                        <>
                                          {(item as any).slot === EquipmentSlot.Weapon && <Sword className={`w-8 h-8 ${qualityText}`} />}
                                          {(item as any).slot === EquipmentSlot.Head && <Crown className={`w-8 h-8 ${qualityText}`} />}
                                          {(item as any).slot === EquipmentSlot.Body && <Shirt className={`w-8 h-8 ${qualityText}`} />}
                                          {(item as any).slot === EquipmentSlot.Legs && <Footprints className={`w-8 h-8 ${qualityText}`} />}
                                          {(item as any).slot === EquipmentSlot.Accessory && <Medal className={`w-8 h-8 ${qualityText}`} />}
                                          {(item as any).slot === EquipmentSlot.Offhand && <Shield className={`w-8 h-8 ${qualityText}`} />}
                                        </>
                                    )}
                                    {item.category === ItemCategory.Consumable && <FlaskConical className="w-8 h-8 text-emerald-400" />}
                                    {item.category === ItemCategory.Material && <CircleDashed className="w-8 h-8 text-stone-600" />}
                                    {![ItemCategory.Equipment, ItemCategory.Consumable, ItemCategory.Material].includes(item.category) && <Package className="w-8 h-8 text-stone-600"/>}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold truncate ${qualityText}`}>
                                            {item.name} <span className="text-xs opacity-80 font-normal">({qualityName})</span> {realmName && <span className="text-xs text-amber-500 font-mono">[{realmName}期]</span>}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-stone-500 truncate mt-1">{item.description}</p>
                                </div>

                                {/* Buy Action */}
                                {/* Price & Action */}
                                <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                                    <div className="text-sm font-mono text-amber-500 flex items-center gap-1 whitespace-nowrap">
                                        {formatSpiritStone(price)}
                                        <Coins size={12} />
                                    </div>
                                    <button 
                                        onClick={() => handleBuy(shopItem)}
                                        disabled={!canAfford || isJustPurchased}
                                        className={clsx(
                                            "px-4 py-1.5 rounded flex items-center justify-center gap-1 font-bold text-sm border transition-all w-full active:scale-95 min-w-[60px]",
                                            isJustPurchased
                                                ? "bg-emerald-900/30 border-emerald-600 text-emerald-400 scale-105"
                                                : canAfford 
                                                    ? "bg-amber-900/20 border-amber-800 text-amber-500 hover:bg-amber-900/40 hover:border-amber-500 hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                                                    : "bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        {isJustPurchased ? (
                                            <>
                                                <Check size={14} className="animate-bounce" />
                                                <span className="text-xs">已購</span>
                                            </>
                                        ) : (
                                            "購買"
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <style>{`
                @keyframes floatDown {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(20px); opacity: 0; }
                }
                .animate-float-down {
                    animation: floatDown 1s ease-out forwards;
                }
            `}</style>
        </Modal>
    );
};

export default ShopPanel;
