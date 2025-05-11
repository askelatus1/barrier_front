import factionPanelStyles from '../styles/components/faction-panel.css?inline';

class FactionPanel extends HTMLElement {
  static get observedAttributes() {
    return [
      'name', 'logo', 'active', 'attack', 'defence', 'war',
      'wreckage', 'peace', 'diplomacy', 'spy', 'trade', 'capture'
    ];
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
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;
    
    const name = this.getAttribute('name') || 'Unknown Faction';
    const logo = this.getAttribute('logo') || '/factions/default.svg';
    
    const isActive = this.hasAttribute('active');
    const hasAttack = this.hasAttribute('attack');
    const hasDefence = this.hasAttribute('defence');
    const hasWar = this.hasAttribute('war');
    const hasWreckage = this.hasAttribute('wreckage');
    const hasPeace = this.hasAttribute('peace');
    const hasDiplomacy = this.hasAttribute('diplomacy');
    const hasSpy = this.hasAttribute('spy');
    const hasTrade = this.hasAttribute('trade');
    const hasCapture = this.hasAttribute('capture');
    
    this.shadowRoot.innerHTML = `
      <style>${factionPanelStyles}</style>
      
      <div class="faction-panel">
        <div class="logo-container">
          <img class="logo" src="${logo}" alt="${name} logo">
        </div>
        <div class="content">
          <span class="name">${name}</span>
          <div class="icons-container">
            <div class="icon ${hasAttack ? 'active' : 'hidden'}" title="Attack">
              <img src="/icons/attack.svg" alt="Attack">
            </div>
            <div class="icon ${hasDefence ? 'active' : 'hidden'}" title="Defence">
              <img src="/icons/defence.svg" alt="Defence">
            </div>
            <div class="icon ${hasWar ? 'active' : 'hidden'}" title="War">
              <img src="/icons/war.svg" alt="War">
            </div>
            <div class="icon ${hasWreckage ? 'active' : 'hidden'}" title="Wreckage">
              <img src="/icons/wreckage.svg" alt="Wreckage">
            </div>
            <div class="icon ${hasPeace ? 'active' : 'hidden'}" title="Peace">
              <img src="/icons/peace.svg" alt="Peace">
            </div>
            <div class="icon ${hasDiplomacy ? 'active' : 'hidden'}" title="Diplomacy">
              <img src="/icons/diplomacy.svg" alt="Diplomacy">
            </div>
            <div class="icon ${hasSpy ? 'active' : 'hidden'}" title="Spy">
              <img src="/icons/spy.svg" alt="Spy">
            </div>
            <div class="icon ${hasTrade ? 'active' : 'hidden'}" title="Trade">
              <img src="/icons/trade.svg" alt="Trade">
            </div>
            <div class="icon ${hasCapture ? 'active' : 'hidden'}" title="Capture">
              <img src="/icons/capture.svg" alt="Capture">
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('faction-panel', FactionPanel); 