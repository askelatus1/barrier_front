import { ActorType } from '../models/constants';
import { RegionStatus } from '../models/constants';
import { ActionType } from '../models/events';

export const FACTION_COLORS = {
    [ActorType.MILITARY]: '#2E7D32',   // Темно-зеленый
    [ActorType.CIVILIAN]: '#1976D2',   // Синий
    [ActorType.TERRORIST]: '#D32F2F',  // Красный
    NEUTRAL: '#757575'                 // Серый
} as const;

// Цвета для треков
export const TRACK_COLORS = {
    ACTIVE: '#4CAF50',    // Зеленый
    INACTIVE: '#9E9E9E',  // Серый
    HOVER: '#81C784'      // Светло-зеленый
} as const;

// Цвета для статусов регионов
export const REGION_STATUS_COLORS = {
    [RegionStatus.WAR]: '#D32F2F',       // Красный - в состоянии войны
    [RegionStatus.WRECKAGE]: '#FFA000',  // Оранжевый - разрушен
    [RegionStatus.PEACE]: '#388E3C'      // Зеленый - мирный
} as const;

// Цвета для действий
export const ACTION_COLORS = {
    [ActionType.WAR]: '#FF0000',        // Красный - война
    [ActionType.CAPTURE]: '#FFA500',     // Оранжевый - захват
    [ActionType.WRECKAGE]: '#8B4513',    // Коричневый - разбор завалов
    [ActionType.PEACE]: '#4CAF50',       // Зеленый - мир
    [ActionType.TRADE]: '#2196F3',       // Синий - торговля
    [ActionType.DIPLOMACY]: '#9C27B0',   // Фиолетовый - дипломатия
    [ActionType.ESPIONAGE]: '#607D8B'    // Серо-синий - шпионаж
} as const; 