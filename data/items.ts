// Re-export from the new modular structure
export { ITEMS, getItem } from './items/index';
// Also re-export specific maps if needed, or just let users use ITEMS
export { MATERIAL_ITEMS } from './items/materials';
export { CONSUMABLE_ITEMS } from './items/consumables';
export { EQUIPMENT_ITEMS } from './items/equipment';
