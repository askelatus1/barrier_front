import { ActorRuleType, EventType, TerritoryRuleType } from "./constants";
import { Faction } from "./faction";
import { Region } from "./region";

export enum ActionType {
    CAPTURE = 'capture',
    PEACE = 'peace',
    WAR = 'war',
    WRECKAGE = 'wreckage',
    TRADE = 'trade',
    DIPLOMACY = 'diplomacy',
    ESPIONAGE = 'espionage'
}

// Событие из справочника
export interface BarrierEvent {
    id: string;
    type: EventType;
    actionType: ActionType;
    title: string;
    actorRule: ActorRuleType[]; // Одно правило для захвата, два для других действий
    territoryRule: TerritoryRuleType;
}

// Активное событие (трек)
export interface Track {
    id: string;
    eventId: string;           // ID события из справочника
    actors: Faction[];         // Участвующие фракции
    territory: Region;        // Регион, где происходит событие
    affectorTerritory: Region; // регион с которого осуществляется событие
    timeout: number;           // Время на выполнение
    status?: 'resolve' | 'reject'; // Статус выполнения
}
