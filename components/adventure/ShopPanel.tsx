import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { SHOPS, ShopItem } from '../../data/shops';
import { ITEMS } from '../../data/items';
import {
    ConsumableItem,
    ConsumableType,
    ItemCategory,
    ItemQuality,
    EquipmentSlot,
    MajorRealm,
} from '../../types';
import { REALM_NAMES } from '../../constants';
import { formatSpiritStone } from '../../utils/currency';
import { spendSpiritStones } from '../../store/slices/characterSlice';
import { addItem } from '../../store/slices/inventorySlice';
import { addLog } from '../../store/slices/logSlice';
import { X, ShoppingBag, Coins, Package, Shield, Sword, FlaskConical, CircleDashed, Footprints, Crown, Shirt, Medal, Check } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../Modal';
import { GameTooltip } from '../game/GameTooltip';
import { GameSection } from '../game/GameSection';
import { Button } from '../ui/button';
import { getFormalSkill } from '../../data/skills';
import {
    getSkillManualAcquisitionTierLabel,
    getSkillManualSourceLabels,
} from '../../data/items/manuals';
import {
    formatConsumableEffectLabel,
    hasRecoveryEffect,
} from '../../utils/consumableEffects';
import {
    resolveNpcShopAffinity,
    resolveSectIdFromRouteId,
    resolveShopNpcId,
} from '../../utils/npcAffinity';
import { adjustAffinity } from '../../store/slices/questSlice';


// Helper for attribute names (Moved from Inventory to be shared concept ideally, but kept here for now)
const getAttributeName = (key: string) => {
    switch(key) {
        case 'attack': return '攻擊';
        case 'defense': return '防禦';
        case 'hp': return '氣血';
        case 'maxHp': return '氣血上限';
        case 'mp': return '真元';
        case 'maxMp': return '真元上限';
        case 'speed': return '速度';
        case 'crit': return '暴擊';
        case 'critDamage': return '暴傷';
        case 'dodge': return '閃避';
        case 'blockRate': return '格擋';
        case 'res': return '抗性'; 
        case 'magic': return '術法'; 
        case 'regenHp': return '回春';
        case 'physique': return '體魄';
        case 'rootBone': return '根骨';
        case 'insight': return '神識';
        case 'comprehension': return '悟性';
        case 'fortune': return '福緣';
        case 'charm': return '魅力';
        default: return key;
    }
};

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
    const { equipment, items: inventoryItems } = useSelector((state: RootState) => state.inventory);
    const { completedQuests: completedQuestIds, npcAffinity, sectAffinity } = useSelector((state: RootState) => state.quest);
    const shop = SHOPS[shopId];
    
    // UI Effects State
    const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string}[]>([]);
    const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);
    
    // Tooltip State
    const [hoveredItem, setHoveredItem] = useState<{ itemId: string, style: React.CSSProperties } | null>(null);

    // Safety check
    if (!shop) return null;
    const shopNpcId = resolveShopNpcId(shopId);
    const shopSectId = resolveSectIdFromRouteId(shopId);
    const shopAffinity = resolveNpcShopAffinity({
        shopId,
        npcId: shopNpcId,
        charm: character.attributes.charm,
        profession: character.profession,
        completedQuestIds,
        persistedNpcAffinity: npcAffinity,
        persistedSectAffinity: sectAffinity,
    });

    const handleBuy = (shopItem: ShopItem) => {
        const item = ITEMS[shopItem.itemId];
        if (!item) return;

        const basePrice = shopItem.price ?? item.price;
        const price = shopAffinity.applyDiscount(basePrice);
        
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
        if (shopNpcId) {
            dispatch(adjustAffinity({
                targetType: 'npc',
                targetId: shopNpcId,
                delta: 1,
                reason: '商店往來',
            }));
        }
        if (shopSectId) {
            dispatch(adjustAffinity({
                targetType: 'sect',
                targetId: shopSectId,
                delta: 1,
                reason: '宗門商店往來',
            }));
        }

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
            eyebrow="SPIRIT MARKET"
            icon={<ShoppingBag size={20} className="text-amber-500" />}
            size="medium"
        >
            <div className="flex flex-col h-full bg-stone-900/50">
                {/* Header Info */}
                <div className="p-4 border-b border-stone-800 flex flex-col md:flex-row gap-3 md:gap-0 md:justify-between items-start md:items-center bg-stone-950/80 relative">
                    <div className="min-w-0">
                        <p className="text-stone-400 text-sm italic">{shop.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]" data-testid="shop-affinity-summary">
                            <span className="rounded border border-amber-900/50 bg-amber-950/20 px-2 py-0.5 text-amber-200">
                                態度：{shopAffinity.attitudeLabel}
                            </span>
                            <span className="rounded border border-emerald-900/50 bg-emerald-950/20 px-2 py-0.5 text-emerald-200">
                                折扣 {shopAffinity.discountPercent}%
                            </span>
                            <span className="rounded border border-stone-800 bg-stone-950/70 px-2 py-0.5 text-stone-400">
                                {shopAffinity.discountSources.join(" / ")}
                            </span>
                        </div>
                    </div>
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
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                  <GameSection
                    title="當期貨單"
                    eyebrow="MARKET LEDGER"
                    className="min-h-full"
                    bodyClassName="space-y-2"
                  >
                    {shop.items.map((shopItem, idx) => {
                        const item = ITEMS[shopItem.itemId];
                        if (!item) return null; // Skip invalid items
                        
                        // User Request: Only show equipment for the current realm
                        if (item.category === ItemCategory.Equipment && item.minRealm !== undefined && item.minRealm !== character.majorRealm) {
                            return null;
                        }
                        if (
                            item.category === ItemCategory.Consumable &&
                            'requiredProfession' in item &&
                            item.requiredProfession &&
                            character.profession !== item.requiredProfession
                        ) {
                            return null;
                        }
                        if (
                            item.category === ItemCategory.Consumable &&
                            (item as ConsumableItem).subType !== ConsumableType.Manual &&
                            'requiredRealm' in item &&
                            item.requiredRealm !== undefined &&
                            item.requiredRealm > character.majorRealm
                        ) {
                            return null;
                        }
                        
                        const basePrice = shopItem.price ?? item.price;
                        const price = shopAffinity.applyDiscount(basePrice);
                        const canAfford = character.spiritStones >= price;
                        const isJustPurchased = recentlyPurchased === shopItem.itemId;
                        
                        const qualityBorder = getQualityBorderColor(item.quality);
                        const qualityText = getQualityTextColor(item.quality);
                        const qualityName = getQualityName(item.quality);
                        const consumable = item.category === ItemCategory.Consumable
                          ? item as ConsumableItem
                          : null;
                        
                        // Determine Realm Name
                        const realmName = item.minRealm !== undefined
                          ? REALM_NAMES[item.minRealm]
                          : ('requiredRealm' in item && item.requiredRealm !== undefined ? REALM_NAMES[item.requiredRealm] : '');

                        return (
                            <div 
                                key={idx} 
                                className={`bg-stone-900 border rounded p-3 flex items-center gap-4 hover:border-stone-600 transition-colors group relative ${qualityBorder}`}
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const tooltipWidth = 256; 
                                    const isMobile = window.innerWidth < 768;
                                    
                                    let style: React.CSSProperties = {};
                                    
                                    if (isMobile) {
                                        // Mobile: Center horizontally
                                        style.left = (window.innerWidth - tooltipWidth) / 2;
                                        
                                        // Prefer Bottom if space > 320px
                                        if (window.innerHeight - rect.bottom > 320) {
                                            style.top = rect.bottom + 10;
                                        } else {
                                            // Else Top
                                            style.bottom = window.innerHeight - rect.top + 10;
                                        }
                                    } else {
                                        // Desktop: Default Right
                                        style.left = rect.right + 10;
                                        style.top = rect.top;
                                        
                                        // Check overflow Right
                                        if (rect.right + tooltipWidth + 20 > window.innerWidth) {
                                            style.left = rect.left - tooltipWidth - 10;
                                        }
                                    }
                                    
                                    setHoveredItem({ itemId: item.id, style });
                                }}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
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
                                    {consumable && (
                                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                                            {consumable.effects.map((effect, effectIndex) => (
                                                <span
                                                    key={`${effect.type}-${effectIndex}`}
                                                    className={clsx(
                                                        "rounded-full border px-2 py-0.5",
                                                        hasRecoveryEffect([effect])
                                                            ? "border-emerald-900/60 bg-emerald-950/35 text-emerald-200"
                                                            : "border-stone-800 bg-stone-950/60 text-stone-400"
                                                    )}
                                                >
                                                    {formatConsumableEffectLabel(effect)}
                                                </span>
                                            ))}
                                            <span className="rounded-full border border-amber-900/50 bg-amber-950/25 px-2 py-0.5 text-amber-200">
                                                {shopItem.stock === undefined ? '常備' : `庫存 ${shopItem.stock}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Buy Action */}
                                {/* Price & Action */}
                                <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                                    <div className="text-sm font-mono text-amber-500 flex flex-col items-end gap-0.5 whitespace-nowrap">
                                        {shopAffinity.discountPercent > 0 && (
                                            <span className="text-[10px] text-stone-500 line-through">
                                                {formatSpiritStone(basePrice)}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1">
                                        {formatSpiritStone(price)}
                                        <Coins size={12} />
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => handleBuy(shopItem)}
                                        disabled={!canAfford || isJustPurchased}
                                        variant={isJustPurchased ? "emerald" : canAfford ? "amber" : "stone"}
                                        size="sm"
                                        className={clsx(
                                            "min-w-[60px] w-full px-4 py-1.5 text-sm font-bold active:scale-95",
                                            isJustPurchased
                                                ? "bg-emerald-900/30 border-emerald-600 text-emerald-400 scale-105"
                                                : canAfford 
                                                    ? "bg-amber-900/20 border-amber-800 text-amber-500 hover:bg-amber-900/40 hover:border-amber-500 hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                                                    : "bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed grayscale"
                                        )}
                                        data-testid={`shop-buy-${shopItem.itemId}`}
                                    >
                                        {isJustPurchased ? (
                                            <>
                                                <Check size={14} className="animate-bounce" />
                                                <span className="text-xs">已購</span>
                                            </>
                                        ) : (
                                            "購買"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                  </GameSection>
                </div>
            </div>
            

            
            {/* Hover Tooltip */}
            {hoveredItem && ITEMS[hoveredItem.itemId] && (
                <GameTooltip
                    eyebrow="MARKET GOODS"
                    title={ITEMS[hoveredItem.itemId].name}
                    titleClassName={getQualityTextColor(ITEMS[hoveredItem.itemId].quality)}
                    footer={
                        (() => {
                            const hovered = ITEMS[hoveredItem.itemId];
                            const realmName = hovered.minRealm !== undefined
                              ? REALM_NAMES[hovered.minRealm]
                              : ('requiredRealm' in hovered && hovered.requiredRealm !== undefined ? REALM_NAMES[hovered.requiredRealm] : '');
                            return `${getQualityName(hovered.quality)}${realmName ? ` · ${realmName}期` : ''}`;
                        })()
                    }
                    widthClassName="w-64"
                    style={hoveredItem.style}
                >
                    {(() => {
                        const item = ITEMS[hoveredItem.itemId];
                        
                        return (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-stone-400 italic">{item.description}</p>
                                
                                {/* Stats */}
                                {item.category === ItemCategory.Equipment && (item as any).stats && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between items-center text-xs text-stone-500 mb-1">
                                            <span>基礎屬性</span>
                                            {/* Comparison Header */}
                                    {(() => {
                                                const slot = (item as any).slot as EquipmentSlot;
                                                const equippedId = equipment[slot];
                                                const equippedItem = equippedId ? inventoryItems.find(i => i.instanceId === equippedId) : null;
                                                 if (equippedItem) {
                                                    const eqDef = ITEMS[equippedItem.itemId];
                                                    return (
                                                        <span className="text-stone-600">比較: {eqDef?.name}</span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        
                                        {Object.entries((item as any).stats).map(([key, val]) => {
                                            const value = val as number;
                                            // Calculate Diff
                                            let diff = null;
                                            const slot = (item as any).slot as EquipmentSlot;
                                            const equippedId = equipment[slot];
                                            const equippedItem = equippedId ? inventoryItems.find(i => i.instanceId === equippedId) : null;
                                            
                                            if (equippedItem && equippedItem.instance?.stats) {
                                                const eqVal = (equippedItem.instance.stats as any)[key] || 0;
                                                diff = value - eqVal;
                                            }

                                            return (
                                                <div key={key} className="flex justify-between items-center text-sm">
                                                    <span className="text-stone-300">{getAttributeName(key)}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-amber-500">+{value}</span>
                                                        {diff !== null && diff !== 0 && (
                                                            <span className={clsx("font-mono text-xs", diff > 0 ? "text-emerald-500" : "text-red-500")}>
                                                                ({diff > 0 ? '+' : ''}{diff})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* Consumable Effects */}
                                {item.category === ItemCategory.Consumable && (item as any).effects && (
                                     <div className="mt-2 space-y-1 text-xs text-stone-400">
                                        {(item as any).effects.map((effect: any, i: number) => (
                                            <div key={i}>
                                                {formatConsumableEffectLabel(effect, {
                                                    useColon: true,
                                                })}
                                            </div>
                                        ))}
                                        {(() => {
                                            const consumable = item as ConsumableItem;
                                            if (consumable.subType !== ConsumableType.Manual) {
                                                return null;
                                            }

                                            const manualSkillId = consumable.effects.find(
                                                (effect) => effect.type === 'learn_skill' && effect.skillId
                                            )?.skillId;
                                            const manualSkill = manualSkillId ? getFormalSkill(manualSkillId) : null;
                                            if (!manualSkill) {
                                                return null;
                                            }

                                            const prerequisiteNames = (manualSkill.prerequisiteSkillIds ?? []).map(
                                                (prerequisiteSkillId) =>
                                                    getFormalSkill(prerequisiteSkillId)?.name ??
                                                    prerequisiteSkillId
                                            );

                                            return (
                                                <div className="mt-3 rounded border border-indigo-900/50 bg-indigo-950/20 p-2 space-y-1">
                                                    <div className="text-indigo-200">
                                                        {getSkillManualAcquisitionTierLabel(manualSkill)} · {manualSkill.type === 'Active' ? '主動術式' : '被動心法'}
                                                    </div>
                                                    <div>來源：{getSkillManualSourceLabels(manualSkill).join('、')}</div>
                                                    {consumable.requiredRealm !== undefined && (
                                                        <div>可先購得，需 {REALM_NAMES[consumable.requiredRealm]} 期方可參悟。</div>
                                                    )}
                                                    {prerequisiteNames.length > 0 && (
                                                        <div>前置：{prerequisiteNames.join('、')}</div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                     </div>
                                )}
                            </div>
                        );
                    })()}
                </GameTooltip>
            )}

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
