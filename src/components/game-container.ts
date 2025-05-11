import gameContainerStyles from '../styles/components/game-container.css?inline';

class GameContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${gameContainerStyles}
      </style>
      <game-header></game-header>
      <main class="game-container-main">
        <slot name="map"></slot>
        <div class="cards-container">
          <slot name="chat"></slot>
          <slot name="factions"></slot>
        </div>
      </main>
    `;
  }
}

customElements.define('game-container', GameContainer);