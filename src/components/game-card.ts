import gameCardStyles from '../styles/components/game-card.css?inline';

interface GameCardAttributes {
  bg?: string;
  border?: string;
}

class GameCard extends HTMLElement {
  static get observedAttributes() {
    return ['bg', 'border'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

  private render() {
    if (!this.shadowRoot) return;
    
    const isChat = this.id === 'chat';
    const isFactions = this.id === 'factions';
    const isMap = this.id === 'app_map';
    
    const factions = [
      {
        name: 'Галактическая Империя',
        logo: '/factions/empire.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Альянс Свободных Планет',
        logo: '/factions/alliance.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Конфедерация Независимых Систем',
        logo: '/factions/cis.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Мандалорский Клан',
        logo: '/factions/mandalore.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Торговая Федерация',
        logo: '/factions/trade-federation.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Орден Джедаев',
        logo: '/factions/jedi.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Ситхи',
        logo: '/factions/sith.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Хаттский Картель',
        logo: '/factions/hutt.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Клан Вуки',
        logo: '/factions/wookie.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      },
      {
        name: 'Гильдия Наемников',
        logo: '/factions/bounty-hunters.svg',
        active: Math.random() > 0.5,
        attack: Math.random() > 0.7,
        defence: Math.random() > 0.7,
        war: Math.random() > 0.8,
        wreckage: Math.random() > 0.9,
        peace: Math.random() > 0.7,
        diplomacy: Math.random() > 0.7,
        spy: Math.random() > 0.8,
        trade: Math.random() > 0.7,
        capture: Math.random() > 0.9
      }
    ];
    
    this.shadowRoot.innerHTML = `
      <style>
        ${gameCardStyles}
        #app_map_canvas {
          width: 100%;
          height: 100%;
          min-width: 600px;
          display: block;
          box-sizing: border-box;
        }
        ${isFactions ? '.card{height: auto;}' : ''}
      </style>
      <div class="card">
        ${isChat ? '<chat-events></chat-events>' : ''}
        ${isFactions ? factions.map(faction => `
          <faction-panel
            name="${faction.name}"
            logo="${faction.logo}"
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