import './components/game-header';
import './components/game-card';
import './components/game-container';
import './components/chat-event';
import './components/chat-events';

const template = document.createElement('template');
template.innerHTML = `
  <game-container></game-container>
`;

document.getElementById("app")?.appendChild(template.content.cloneNode(true));