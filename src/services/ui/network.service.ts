import { Network, Options, Node, Edge, NetworkEvents } from 'vis-network';
import { DataSet } from 'vis-data';
import { RegionService } from '../api/region.service';
import { firstValueFrom } from 'rxjs';

export interface NetworkNode extends Node {
  id: number;
  label: string;
}

export interface NetworkEdge extends Edge {
  from: number;
  to: number;
  physics?: boolean;
}

export class NetworkService {
  private static instance: NetworkService | null = null;
  private network: Network | null = null;
  private nodes: DataSet<NetworkNode> | null = null;
  private edges: DataSet<NetworkEdge> | null = null;
  private stabilized = false;

  private constructor() {}

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public initialize(container: HTMLElement): void {
    if (!container) {
      throw new Error('Container element is required for network initialization');
    }

    // Очищаем старые данные если они есть
    if (this.network) {
      this.clear();
      this.network.destroy();
      this.network = null;
    }

    // Create DataSets
    this.nodes = new DataSet<NetworkNode>();
    this.edges = new DataSet<NetworkEdge>();
    this.stabilized = false;

    // Create Network
    const options: Options = {
      nodes: {
        shape: 'dot',
        size: 30,
        font: {
          size: 12,
          color: '#ffffff'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true
      },
      physics: {
        enabled: true,
        forceAtlas2Based: {
          springLength: 100
        },
        minVelocity: 0.75,
        solver: 'forceAtlas2Based',
        timestep: 0.93,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 50,
          fit: true
        }
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        hover: true
      }
    };

    try {
      this.network = new Network(
        container,
        { nodes: this.nodes, edges: this.edges },
        options
      );

      // Отключаем физику после первой стабилизации и фиксируем все узлы
      this.network.once('stabilized', () => {
        this.stabilized = true;
        this.network?.setOptions({ physics: { enabled: false } });
        // Фиксируем все узлы
        const positions = this.network?.getPositions();
        if (positions && this.nodes) {
          Object.entries(positions).forEach(([id, pos]) => {
            this.nodes?.update({ id: Number(id), x: pos.x, y: pos.y });
          });
        }
      });

      console.log('Network initialized successfully');
    } catch (error) {
      console.error('Failed to initialize network:', error);
      throw error;
    }
  }

  public setNodes(nodes: NetworkNode[]): void {
    if (!this.nodes) return;
    this.nodes.clear();
    this.nodes.add(nodes);
  }

  public setEdges(edges: NetworkEdge[]): void {
    if (!this.edges) return;
    this.edges.clear();
    this.edges.add(edges);
  }

  public addNode(node: NetworkNode): void {
    if (!this.nodes) return;
    this.nodes.add(node);
  }

  public addEdge(edge: NetworkEdge): void {
    if (!this.edges) return;
    this.edges.add(edge);
  }

  public updateNode(node: NetworkNode): void {
    if (!this.nodes) return;
    this.nodes.update(node);
  }

  public updateEdge(edge: NetworkEdge): void {
    if (!this.edges) return;
    this.edges.update(edge);
  }

  public removeNode(nodeId: number): void {
    if (!this.nodes) return;
    this.nodes.remove(nodeId);
  }

  public removeEdge(edgeId: number): void {
    if (!this.edges) return;
    this.edges.remove(edgeId);
  }

  public clear(): void {
    if (this.nodes) {
      this.nodes.clear();
    }
    if (this.edges) {
      this.edges.clear();
    }
  }

  public getNodes(): NetworkNode[] {
    if (!this.nodes) return [];
    return this.nodes.get();
  }

  public getEdges(): NetworkEdge[] {
    if (!this.edges) return [];
    return this.edges.get();
  }

  public on(event: NetworkEvents, callback: (params: any) => void): void {
    if (!this.network) return;
    this.network.on(event, callback);
  }

  public off(event: NetworkEvents, callback: (params: any) => void): void {
    if (!this.network) return;
    this.network.off(event, callback);
  }

  /**
   * Обновить отображение карты с учетом текущего состояния регионов и треков
   */
  public async updateNetworkDisplay(): Promise<void> {
    if (!this.network || !this.nodes || !this.edges) {
      console.error('Network not initialized');
      return;
    }

    try {
      // Только после первой стабилизации сохраняем и восстанавливаем позиции
      let positionMap: Map<number, {x: number, y: number}> = new Map();
      const currentNodes = this.nodes.get();
      if (this.stabilized) {
        if (this.network) {
          currentNodes.forEach(node => {
            const pos = this.network!.getPositions([node.id]);
            if (pos[node.id]) {
              positionMap.set(node.id, pos[node.id]);
            }
          });
        }
      }

      const regions = await firstValueFrom(RegionService.getInstance().getRegions());
      
      if (!regions.length) {
        console.warn('No regions available for network display');
        return;
      }

      const { nodes, edges } = await RegionService.convertToNetworkStructure(regions);
      
      if (!nodes.length) {
        console.warn('No nodes generated for network display');
        return;
      }

      // Для каждого узла восстанавливаем позицию, если она была, иначе не фиксируем
      nodes.forEach(newNode => {
        const existingNode = currentNodes.find(n => n.id === newNode.id);
        if (!existingNode) {
          this.nodes?.add(newNode);
        } else {
          this.nodes?.update(newNode);
        }
      });

      // Удаляем неиспользуемые узлы
      const newIds = new Set(nodes.map(n => n.id));
      currentNodes.forEach(node => {
        if (!newIds.has(node.id)) {
          this.nodes?.remove(node.id);
        }
      });

      // Обновляем рёбра аналогичным образом
      const currentEdges = this.edges.get();
      edges.forEach(newEdge => {
        const existingEdge = currentEdges.find(e => e.id === newEdge.id);
        if (!existingEdge) {
          this.edges?.add(newEdge);
        } else {
          this.edges?.update(newEdge);
        }
      });

      // Удаляем неиспользуемые рёбра
      const newEdgeIds = new Set(edges.map(e => e.id));
      currentEdges.forEach(edge => {
        if (!newEdgeIds.has(edge.id)) {
          this.edges?.remove(edge.id);
        }
      });

      // Не трогаем physics!

      console.log('Network display updated successfully');
    } catch (error) {
      console.error('Failed to update network display:', error);
    }
  }
} 