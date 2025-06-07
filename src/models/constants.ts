export enum EventType {
    EVENT = 'event'
}

export enum ActorType {
    MILITARY = 'military',
    CIVILIAN = 'civilian', 
    TERRORIST = 'terrorist'
}

export enum ActorRuleType {
    MILITARY = 'military',
    CIVILIAN = 'civilian', 
    TERRORIST = 'terrorist',
    ARMORED = 'armored', // MILITARY + TERRORIST
    LEGAL = 'legal', // MILITARY + CIVILIAN
    ALL = 'all',
    NONE = 'none'
}

// Тип для проверки соответствия ActorType правилу ActorRuleType
export type ActorRuleTypeMap = {
    [ActorRuleType.MILITARY]: ActorType.MILITARY;
    [ActorRuleType.CIVILIAN]: ActorType.CIVILIAN;
    [ActorRuleType.TERRORIST]: ActorType.TERRORIST;
    [ActorRuleType.ARMORED]: ActorType.MILITARY | ActorType.TERRORIST;
    [ActorRuleType.LEGAL]: ActorType.MILITARY | ActorType.CIVILIAN;
    [ActorRuleType.ALL]: ActorType;
    [ActorRuleType.NONE]: never;
}

export enum TerritoryRuleType {
    INITIATOR = 'initiator',
    VICTIM = 'victim',
    BOTH = 'both',
    EMPTY = 'EMPTY',
    WRECKAGE = 'WRECKAGE'
}

export enum RegionStatus {
    WAR = 'war',
    WRECKAGE = 'wreckage',
    PEACE = 'peace'
}

export enum NotifyType {
    START = 'start',
    RESOLVE = 'resolve',
    REJECT = 'reject'
}

export const TIMEOUTS = {
    DEFAULT: 1000,
    EVENT: 1000
} as const;

export enum SSEEventType {
    EVENT_CREATED = 'event_created',
    EVENT_UPDATED = 'event_updated',
    EVENT_DELETED = 'event_deleted',
    TRACK_CREATED = 'track_created',
    TRACK_UPDATED = 'track_updated',
    TRACK_STOPPED = 'track_stopped',
    REGION_CREATED = 'region_created',
    REGION_UPDATED = 'region_updated',
    REGION_DELETED = 'region_deleted'
}