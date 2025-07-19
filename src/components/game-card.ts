import { DisplayedFaction } from '../models/faction';
import { ActorType } from '../models/constants';
import gameCardStyles from '../styles/components/game-card.css?inline';

interface GameCardAttributes {
  bg?: string;
  border?: string;
}

export class GameCard extends HTMLElement {
  private _factions: DisplayedFaction[] = [];

  static get observedAttributes() {
    return ['bg', 'border'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // Геттер и сеттер для фракций
  get factions(): DisplayedFaction[] {
    return this._factions;
  }

  set factions(value: DisplayedFaction[]) {
    this._factions = value;
    this.render();
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.render();
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) return;
    this.updateStyles();
  }

  private getAttributes(): GameCardAttributes {
    return {
      bg: this.getAttribute('bg') || undefined,
      border: this.getAttribute('border') || undefined,
    };
  }

  private updateStyles() {
    const { bg, border } = this.getAttributes();
    if (bg) this.style.setProperty('--bg', bg);
    if (border) this.style.setProperty('--border', border);
  }

  private getFactionLogo(faction: DisplayedFaction): string {
    switch (faction.type) {
      case ActorType.CIVILIAN:
        return '/factions/peaceful.svg';
      case ActorType.MILITARY:
        return '/factions/military.svg';
      case ActorType.TERRORIST:
        return '/factions/terrorist.svg';
      default:
        return '/factions/default.svg';
    }
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private render() {
    if (!this.shadowRoot) return;
    
    const isChat = this.id === 'chat';
    const isFactions = this.id === 'app_factions';
    const isMap = this.id === 'app_map';
    
    this.shadowRoot.innerHTML = `
      <style>
        ${gameCardStyles}
        ${isMap ? `
          #app_map_canvas {
            width: 100%;
            height: 100%;
            min-width: 600px;
            display: block;
            box-sizing: border-box;
          }
        ` : ''}
        ${isFactions ? '.card { height: auto; }' : ''}
      </style>
      <div class="card">
        ${isChat ? '<chat-events></chat-events>' : ''}
        ${isFactions ? this._factions.map(faction => `
          <faction-panel
            name="${this.escapeAttribute(faction.name)}"
            logo="${this.getFactionLogo(faction)}"
            ${faction.active ? 'active' : ''}
            ${faction.attack ? 'attack' : ''}
            ${faction.defence ? 'defence' : ''}
            ${faction.war ? 'war' : ''}
            ${faction.wreckage ? 'wreckage' : ''}
            ${faction.peace ? 'peace' : ''}
            ${faction.diplomacy ? 'diplomacy' : ''}
            ${faction.spy ? 'spy' : ''}
            ${faction.trade ? 'trade' : ''}
            ${faction.capture ? 'capture' : ''}
          ></faction-panel>
        `).join('') : ''}
        ${isMap ? '<div id="app_map_canvas"></div>' : ''}
      </div>
    `;

    this.updateStyles();
  }
}

customElements.define('game-card', GameCard);