import { COLORS, SIZES } from './theme';

export const styles = {
  gameContainer: `
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: ${COLORS.background.primary};
      margin: 0 auto;
      box-sizing: border-box;
      overflow: hidden;
      aspect-ratio: 393/852;
    }
    .game-container-main {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      height: 100%;
      min-height: 0;
    }
    .top-card {
      flex: 1 1 0;
      min-height: 0;
    }
    .cards-container {
      display: flex;
      flex-direction: row;
      width: 100%;
      flex: 1 1 0;
      box-sizing: border-box;
      min-height: 0;
      height: 100%;
      gap: 8px;
    }
    .cards-container > game-card {
      flex: 1 1 0;
      min-width: 0;
      box-sizing: border-box;
      margin-bottom: 0;
      margin-right: 0;
      overflow-y: auto;
    }
    @media (max-width: 600px) {
      .cards-container {
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 8px;
        overflow-y: auto;
      }
      .cards-container > game-card {
        margin-bottom: 0;
        overflow-y: unset;
      }
    }
    /* Стилизация скроллбаров */
    .cards-container, .card {
      scrollbar-width: thin;
      scrollbar-color: #444a transparent;
    }
    .cards-container::-webkit-scrollbar, .card::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }
    .cards-container::-webkit-scrollbar-thumb, .card::-webkit-scrollbar-thumb {
      background: #444a;
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .cards-container::-webkit-scrollbar-thumb:hover, .card::-webkit-scrollbar-thumb:hover {
      background: #666a;
    }
    .cards-container::-webkit-scrollbar-corner, .card::-webkit-scrollbar-corner {
      background: transparent;
    }
  `,

  gameHeader: `
    :host {
      display: flex;
      width: 100%;
      height: ${SIZES.header.height};
      min-height: ${SIZES.header.minHeight};
      background: ${COLORS.background.primary};
      align-items: center;
      padding: 0 4px;
      box-sizing: border-box;
    }
    .logo {
      width: ${SIZES.header.logo.width};
      height: ${SIZES.header.logo.height};
      object-fit: cover;
    }
    .title {
      margin-left: 6px;
      color: ${COLORS.text.primary};
      font-size: clamp(10px, 3vw, 12px);
      font-weight: normal;
      white-space: nowrap;
    }
    .help-button {
      margin-left: auto;
      width: ${SIZES.header.helpButton.width};
      height: ${SIZES.header.helpButton.height};
      background: ${COLORS.button.background};
      border-radius: ${SIZES.header.helpButton.borderRadius};
      border: none;
      color: ${COLORS.text.secondary};
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      min-width: ${SIZES.header.helpButton.width};
    }
  `,

  gameCard: `
    :host {
      display: block;
      box-sizing: border-box;
    }
    .card {
      width: 100%;
      height: 100%;
      background: var(--bg, ${COLORS.background.secondary});
      border: 1px solid var(--border, ${COLORS.border.primary});
      box-sizing: border-box;
    }
  `,

  factionPanel: `
    .faction-panel {
      display: flex;
      align-items: center;
      background: ${COLORS.background.quaternary};
      border-radius: 12px;
      padding: 12px 16px;
      margin: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1.5px solid ${COLORS.border.tertiary};
      height: 56px;
    }

    .logo-container {
      margin-right: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      object-fit: cover;
    }

    .content {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;
      justify-content: space-between;
      gap: 16px;
    }

    .name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      padding-right: 20px;
      flex: 1;
    }

    .name::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to right, transparent, ${COLORS.background.quaternary});
    }

    .icons-container {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      margin-left: auto;
    }

    .icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      filter: grayscale(100%);
      opacity: 0.5;
    }

    .icon.active {
      opacity: 1;
      filter: none;
    }

    .icon:hover {
      transform: scale(1.1);
    }

    .icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `,
};