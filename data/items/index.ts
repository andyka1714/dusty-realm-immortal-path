import { Item } from '../../types';
import { MATERIAL_ITEMS } from './materials';
import { CONSUMABLE_ITEMS } from './consumables';
import { EQUIPMENT_ITEMS } from './equipment';
import { MANUAL_ITEMS } from './manuals';

export const ITEMS: Record<string, Item> = {
  ...MATERIAL_ITEMS,
  ...CONSUMABLE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...MANUAL_ITEMS,
};

export const getItem = (id: string): Item | undefined => ITEMS[id];
