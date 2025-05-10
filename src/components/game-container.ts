import { styles } from '../styles/components';
import { COLORS } from '../styles/theme';

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
        ${styles.gameContainer}
      </style>
      <game-header></game-header>
      <main>
        <game-card 
          class="top-card"
          height="50%"
          width="100%"
          bg="${COLORS.background.secondary}"
          border="${COLORS.border.primary}">
        </game-card>
        <div class="cards-container">
          <game-card
            height="100%"
            bg="${COLORS.background.tertiary}"
            border="${COLORS.border.secondary}">
          </game-card>
          <game-card
            height="100%"
            bg="${COLORS.background.quaternary}"
            border="${COLORS.border.tertiary}">
          </game-card>
        </div>
      </main>
    `;
  }
}

customElements.define('game-container', GameContainer);