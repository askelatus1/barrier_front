class GameCard extends HTMLElement {
  static get observedAttributes() {
    return ['width', 'height', 'bg', 'border'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const width = this.getAttribute('width') || '100%';
    const height = this.getAttribute('height') || '100%';
    const bg = this.getAttribute('bg') || '#333333';
    const border = this.getAttribute('border') || '#1a1a1a';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
          height: ${height};
          box-sizing: border-box;
        }
        .card {
          width: 100%;
          height: 100%;
          background: ${bg};
          border: 1px solid ${border};
          box-sizing: border-box;
        }
      </style>
      <div class="card"></div>
    `;
  }
}

customElements.define('game-card', GameCard);