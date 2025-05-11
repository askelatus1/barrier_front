import { NetworkNode, NetworkEdge } from './network.service';

export const demoNodes: NetworkNode[] = [
  { id: 1, label: 'Центр', group: 'center' },
  { id: 2, label: 'Север', group: 'north' },
  { id: 3, label: 'Юг', group: 'south' },
  { id: 4, label: 'Восток', group: 'east' },
  { id: 5, label: 'Запад', group: 'west' }
];

export const demoEdges: NetworkEdge[] = [
  { from: 1, to: 2, label: 'N' },
  { from: 1, to: 3, label: 'S' },
  { from: 1, to: 4, label: 'E' },
  { from: 1, to: 5, label: 'W' }
]; 