import { COLORS } from '../styles/theme';
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
          <game-card 
            id="chat"
            bg="${COLORS.background.tertiary}"
            border="${COLORS.border.secondary}">
          </game-card>
          <game-card
            id="factions"
            bg="${COLORS.background.quaternary}"
            border="${COLORS.border.tertiary}">
          </game-card>
        </div>
      </main>
    `;
  }
}

customElements.define('game-container', GameContainer);