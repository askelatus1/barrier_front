import { Network, Options, Node, Edge, NetworkEvents } from 'vis-network';
import { DataSet } from 'vis-data';

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
  private static instance: NetworkService;
  private network: Network | null = null;
  private nodes: DataSet<NetworkNode>;
  private edges: DataSet<NetworkEdge>;

  private constructor() {
    this.nodes = new DataSet<NetworkNode>();
    this.edges = new DataSet<NetworkEdge>();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public initialize(container: HTMLElement, options: Options = {}): void {
    const defaultOptions: Options = {
      nodes: {
        shape: 'ellipse',
        size: 50,
        font: {
          size: 14
        }
      },
      edges: {
        // arrows: {
        //   to: { enabled: true, scaleFactor: 1 }
        // },
        font: {
          size: 12,
          align: 'middle'
        }
      },
      physics: {
        forceAtlas2Based: {
          springLength: 100
        },
        minVelocity: 0.75,
        solver: 'forceAtlas2Based',
        timestep: 0.93
      }
    };

    const data = {
      nodes: this.nodes,
      edges: this.edges
    };

    this.network = new Network(container, data, { ...defaultOptions, ...options });
  }

  public setNodes(nodes: NetworkNode[]): void {
    this.nodes.clear();
    this.nodes.add(nodes);
  }

  public setEdges(edges: NetworkEdge[]): void {
    this.edges.clear();
    this.edges.add(edges);
  }

  public addNode(node: NetworkNode): void {
    this.nodes.add(node);
  }

  public addEdge(edge: NetworkEdge): void {
    this.edges.add(edge);
  }

  public updateNode(node: NetworkNode): void {
    this.nodes.update(node);
  }

  public updateEdge(edge: NetworkEdge): void {
    this.edges.update(edge);
  }

  public removeNode(nodeId: number): void {
    this.nodes.remove(nodeId);
  }

  public removeEdge(edgeId: number): void {
    this.edges.remove(edgeId);
  }

  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  public getNodes(): NetworkNode[] {
    return this.nodes.get();
  }

  public getEdges(): NetworkEdge[] {
    return this.edges.get();
  }

  public on(event: NetworkEvents, callback: (params: any) => void): void {
    this.network?.on(event, callback);
  }

  public off(event: NetworkEvents, callback: (params: any) => void): void {
    this.network?.off(event, callback);
  }
} 