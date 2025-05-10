import { COLORS, SIZES } from './theme';

export const styles = {
  gameContainer: `
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
    main {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
    }
    .cards-container {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      overflow-y: auto;
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
      flex: 1;
      height: 100%;
      min-width: ${SIZES.card.minWidth};
      box-sizing: border-box;
    }
    .card {
      height: 100%;
      background: var(--bg, ${COLORS.background.secondary});
      border: 1px solid var(--border, ${COLORS.border.primary});
      box-sizing: border-box;
    }
  `
} as const; 