import { RegionStatus } from "./constants";
import { MilitaryFaction } from "./faction";

export type RegionsType = string;

/**
 * Represents a region in the game world
 */
export interface Region {
    /**
     * Unique identifier of the region
     */
    id: RegionsType;

    /**
     * Display name of the region
     */
    title: string;

    /**
     * Current status of the region
     */
    status: RegionStatus;

    /**
     * Array of neighboring region IDs
     */
    neighbour: RegionsType[];

    /**
     * Military faction controlling the region, or null if uncontrolled
     */
    faction: MilitaryFaction | null;
}