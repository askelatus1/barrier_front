import { ActorRuleType, EventType, TerritoryRuleType } from "./constants";
import { Faction } from "./faction";
import { Region } from "./region";

export interface BarrierEvent {
    id: string;
    type: EventType;
    actionType: ActionType;
    title: string;
    actorRule: ActorRuleType[]; // Одно правило для захвата, два для других действий
    territoryRule: TerritoryRuleType;
}

export enum ActionType {
    CAPTURE = 'capture',
    PEACE = 'peace',
    WAR = 'war',
    WRECKAGE = 'wreckage',
    TRADE = 'trade',
    DIPLOMACY = 'diplomacy',
    ESPIONAGE = 'espionage'
}

export interface Track {
    id: string;
    eventId: BarrierEvent["id"];
    actors: Faction[];
    territory: Region;
    timeout: number;
    status?: 'resolve' | 'reject';
    scheduler?: NodeJS.Timeout;
}
