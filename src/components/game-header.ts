class GameHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          width: 100%;
          height: 51px;
          min-height: 51px;
          background: #232325;
          align-items: center;
          padding: 0 4px;
          box-sizing: border-box;
        }
        .logo {
          width: 42px;
          height: 42px;
          object-fit: cover;
        }
        .title {
          margin-left: 6px;
          color: #ffd988;
          font-size: clamp(10px, 3vw, 12px);
          font-weight: normal;
          white-space: nowrap;
        }
        .help-button {
          margin-left: auto;
          width: 22px;
          height: 22px;
          background: #424242;
          border-radius: 11px;
          border: none;
          color: #d9c48d;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          min-width: 22px;
        }
      </style>
      <img class="logo" alt="Game logo" src="/image-1.png">
      <span class="title">BARRIER GAME</span>
      <button class="help-button">?</button>
    `;
  }
}

customElements.define('game-header', GameHeader);