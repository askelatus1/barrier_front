class GameContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background: #232325;
          margin: 0 auto;
          box-sizing: border-box;
          overflow: hidden;
          aspect-ratio: 393/852;
        }
        main {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          box-sizing: border-box;
        }
        .cards-container {
          display: flex;
          width: 100%;
          flex: 1;
          box-sizing: border-box;
        }
      </style>
      <game-header></game-header>
      <main>
        <game-card 
          class="top-card"
          height="50%"
          width="100%"
          bg="#333333"
          border="#1a1a1a">
        </game-card>
        <div class="cards-container">
          <game-card
            width="50%"
            height="100%"
            bg="#2a2a2a"
            border="#151515">
          </game-card>
          <game-card
            width="50%"
            height="100%"
            bg="#3d3d3d"
            border="#1f1f1f">
          </game-card>
        </div>
      </main>
    `;
  }
}

customElements.define('game-container', GameContainer);