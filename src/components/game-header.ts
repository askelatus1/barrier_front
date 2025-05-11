import gameHeaderStyles from '../styles/components/game-header.css?inline';

class GameHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.render();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const helpButton = this.shadowRoot?.querySelector('.help-button');
    helpButton?.addEventListener('click', this.handleHelpClick);
  }

  private handleHelpClick = () => {
    // TODO: Implement help functionality
    console.log('Help button clicked');
  };

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${gameHeaderStyles}
      </style>
      <img class="logo" alt="Game logo" src="/image-1.png">
      <span class="title">BARRIER GAME</span>
      <button class="help-button">?</button>
    `;
  }
}

customElements.define('game-header', GameHeader);