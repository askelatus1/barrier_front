import { Network, Options, Node, Edge, NetworkEvents } from 'vis-network';
import { DataSet } from 'vis-data';
import { RegionService } from '../api/region.service';
import { DataService } from '../data/data.service';

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

  private constructor() {}

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public initialize(container: HTMLElement): void {
    // Create DataSets
    this.nodes = new DataSet<NetworkNode>();
    this.edges = new DataSet<NetworkEdge>();

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
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1
        }
      }
    };

    this.network = new Network(
      container,
      { nodes: this.nodes, edges: this.edges },
      options
    );
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
    if (!this.nodes) return;
    this.nodes.clear();
    if (!this.edges) return;
    this.edges.clear();
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
    if (!this.network || !this.nodes || !this.edges) return;

    const dataService = DataService.getInstance();
    const regions = dataService.getRegions();
    
    if (!regions.length) return;

    const { nodes, edges } = await RegionService.convertToNetworkStructure(regions);
    
    // Обновляем только данные узлов, сохраняя текущую позицию
    nodes.forEach(node => {
      const currentNode = this.nodes?.get(node.id);
      if (currentNode) {
        const position = this.network?.getPosition(node.id);
        this.nodes?.update({
          ...node,
          x: position?.x,
          y: position?.y
        });
      } else {
        this.nodes?.add(node);
      }
    });

    // Обновляем рёбра
    this.setEdges(edges);
  }
} 