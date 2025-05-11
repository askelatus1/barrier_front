import { ActorType } from "./constants";
import { RegionsType } from "./region";

/**
 * Unique identifier for a faction
 */
export type FactionId = string;

/**
 * Base interface for all factions in the game
 */
export interface Faction {
    /**
     * Unique identifier of the faction
     */
    id: FactionId;

    /**
     * Display name of the faction
     */
    name: string;

    /**
     * ID of the region where the faction's base is located
     */
    baseRegion: RegionsType;

    /**
     * Type of the faction (military, civilian, or terrorist)
     */
    type: ActorType;
}

/**
 * Represents a military faction with strict type checking
 */
export type MilitaryFaction = Faction & {
    type: ActorType.MILITARY;
}

/**
 * Represents a civilian faction with strict type checking
 */
export type CivilianFaction = Faction & {
    type: ActorType.CIVILIAN;
}

/**
 * Represents a terrorist faction with strict type checking
 */
export type TerroristFaction = Faction & {
    type: ActorType.TERRORIST;
}

