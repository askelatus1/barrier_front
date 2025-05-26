import { Faction } from '../models/faction';
import { Region } from '../models/region';
import { BarrierEvent, Track } from '../models/events';

export class ApiService {
    private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }
        return response.json();
    }

    // Actors (Factions) endpoints
    async getAllActors(): Promise<Faction[]> {
        const response = await fetch(`${this.baseUrl}/api/actors`);
        return this.handleResponse<Faction[]>(response);
    }

    async getActorById(id: string): Promise<Faction> {
        const response = await fetch(`${this.baseUrl}/api/actors/${id}`);
        return this.handleResponse<Faction>(response);
    }

    // Regions endpoints
    async getAllRegions(): Promise<Region[]> {
        const response = await fetch(`${this.baseUrl}/api/regions`);
        return this.handleResponse<Region[]>(response);
    }

    async getRegionById(id: string): Promise<Region> {
        const response = await fetch(`${this.baseUrl}/api/regions/${id}`);
        return this.handleResponse<Region>(response);
    }

    async getRegionNeighbours(id: string): Promise<Region[]> {
        const response = await fetch(`${this.baseUrl}/api/regions/${id}/neighbours`);
        return this.handleResponse<Region[]>(response);
    }

    // Zones endpoints
    async getAllZones(): Promise<Region[][]> {
        const response = await fetch(`${this.baseUrl}/api/zones`);
        return this.handleResponse<Region[][]>(response);
    }

    async getZoneByFaction(factionId: string): Promise<Region[]> {
        const response = await fetch(`${this.baseUrl}/api/zones/${factionId}`);
        return this.handleResponse<Region[]>(response);
    }

    async getZoneRegions(factionId: string): Promise<Region[]> {
        const response = await fetch(`${this.baseUrl}/api/zones/${factionId}/regions`);
        return this.handleResponse<Region[]>(response);
    }

    async getZoneNeighbours(factionId: string): Promise<Region[]> {
        const response = await fetch(`${this.baseUrl}/api/zones/${factionId}/neighbours`);
        return this.handleResponse<Region[]>(response);
    }

    // Events endpoints
    async getAllEvents(): Promise<BarrierEvent[]> {
        const response = await fetch(`${this.baseUrl}/api/events`);
        return this.handleResponse<BarrierEvent[]>(response);
    }

    async getEventById(id: string): Promise<BarrierEvent> {
        const response = await fetch(`${this.baseUrl}/api/events/${id}`);
        return this.handleResponse<BarrierEvent>(response);
    }

    // Tracks endpoints (если они есть в API)
    async getEventTracks(eventId: string): Promise<Track[]> {
        const response = await fetch(`${this.baseUrl}/api/events/${eventId}/tracks`);
        return this.handleResponse<Track[]>(response);
    }
}

export const apiService = new ApiService(); 