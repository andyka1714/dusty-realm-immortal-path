import { Item } from '../../types';
import { MATERIAL_ITEMS } from './materials';
import { CONSUMABLE_ITEMS } from './consumables';
import { EQUIPMENT_ITEMS } from './equipment';

export const ITEMS: Record<string, Item> = {
  ...MATERIAL_ITEMS,
  ...CONSUMABLE_ITEMS,
  ...EQUIPMENT_ITEMS,
};

export const getItem = (id: string): Item | undefined => ITEMS[id];
