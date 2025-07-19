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

/**
 * Represents a faction with all display-related properties for UI
 */
export interface DisplayedFaction extends Faction {
    /**
     * Path to the faction's logo image
     */
    logo: string;

    /**
     * Whether the faction is currently active/selected
     */
    active: boolean;

    /**
     * Whether the faction can attack
     */
    attack: boolean;

    /**
     * Whether the faction is in defense mode
     */
    defence: boolean;

    /**
     * Whether the faction is at war
     */
    war: boolean;

    /**
     * Whether the faction has wreckage
     */
    wreckage: boolean;

    /**
     * Whether the faction is at peace
     */
    peace: boolean;

    /**
     * Whether the faction has diplomatic relations
     */
    diplomacy: boolean;

    /**
     * Whether the faction has spy capabilities
     */
    spy: boolean;

    /**
     * Whether the faction can trade
     */
    trade: boolean;

    /**
     * Whether the faction can capture
     */
    capture: boolean;
}

