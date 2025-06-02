import { RegionStatus } from './constants';
import { ActionType } from './events';

export const ACTION_COLORS = {
  [ActionType.WAR]: '#FF0000',        // Красный - война
  [ActionType.CAPTURE]: '#FFA500',     // Оранжевый - захват
  [ActionType.WRECKAGE]: '#8B4513',    // Коричневый - разбор завалов
  [ActionType.PEACE]: '#4CAF50',       // Зеленый - мир
  [ActionType.TRADE]: '#2196F3',       // Синий - торговля
  [ActionType.DIPLOMACY]: '#9C27B0',   // Фиолетовый - дипломатия
  [ActionType.ESPIONAGE]: '#607D8B'    // Серо-синий - шпионаж
} as const;

export const REGION_STATUS_COLORS = {
  [RegionStatus.WAR]: '#D32F2F',       // Красный - в состоянии войны
  [RegionStatus.WRECKAGE]: '#FFA000',  // Оранжевый - разрушен
  [RegionStatus.PEACE]: '#388E3C'      // Зеленый - мирный
} as const; 