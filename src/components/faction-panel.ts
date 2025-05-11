import { COLORS } from '../styles/theme';
import { styles } from '../styles/components';

class FactionPanel extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'logo', 'active', 'attack', 'defence', 'war', 'wreckage', 'peace', 'diplomacy', 'spy', 'trade', 'capture'];
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
    const name = this.getAttribute('name') || '';
    const logo = this.getAttribute('logo') || '';

    const statuses = [
      { name: 'active', icon: '/icons/active.svg' },
      { name: 'attack', icon: '/icons/attack.svg' },
      { name: 'defence', icon: '/icons/defence.svg' },
      { name: 'war', icon: '/icons/war.svg' },
      { name: 'wreckage', icon: '/icons/wreckage.svg' },
      { name: 'peace', icon: '/icons/peace.svg' },
      { name: 'diplomacy', icon: '/icons/diplomacy.svg' },
      { name: 'spy', icon: '/icons/spy.svg' },
      { name: 'trade', icon: '/icons/trade.svg' },
      { name: 'capture', icon: '/icons/capture.svg' }
    ];

    const statusTitles: Record<string, string> = {
      active: 'Активен',
      attack: 'Атака',
      defence: 'Оборона',
      war: 'Война',
      wreckage: 'Обломки',
      peace: 'Мир',
      diplomacy: 'Дипломатия',
      spy: 'Шпионаж',
      trade: 'Торговля',
      capture: 'Захват',
    };

    this.shadowRoot.innerHTML = `
      <style>${styles.factionPanel}</style>
      <div class="faction-panel">
        <div class="logo-container">
          <img class="logo" src="${logo}" alt="Faction logo" />
        </div>
        <div class="content">
          <span class="name" title="${name}">${name}</span>
          <div class="icons-container">
            ${statuses.map(status => `
              <div class="icon ${this.hasAttribute(status.name) ? 'active' : ''}">
                <img src="${status.icon}" alt="${statusTitles[status.name] || status.name}" title="${statusTitles[status.name] || status.name}" />
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('faction-panel', FactionPanel); 