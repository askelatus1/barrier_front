import { styles } from '../styles/components';

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
    this.shadowRoot.innerHTML = `
      <style>
        ${styles.gameCard}
      </style>
      <div class="card"></div>
    `;
    this.updateStyles();
  }
}

customElements.define('game-card', GameCard);