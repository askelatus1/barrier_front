import { ActorType } from './constants';

export interface UiFaction {
    name: string;
    logo: string;
    type: ActorType;
    active: boolean;
    attack: boolean;
    defence: boolean;
    war: boolean;
    wreckage: boolean;
    peace: boolean;
    diplomacy: boolean;
    spy: boolean;
    trade: boolean;
    capture: boolean;
} 