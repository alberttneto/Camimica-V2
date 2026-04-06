/**
 * CAMIMICA - Jogo de Mímica
 * JavaScript principal com funcionalidades do jogo
 */

// ===== ESTADO GLOBAL DO JOGO =====
const GameState = {
  currentPage: 'home',
  teams: [],
  playersPerTeam: 2,
  numberOfTeams: 2,
  currentTeamIndex: 0,
  currentPlayerIndex: 0,
  scores: {},
  gameStarted: false,
  gameConfig: {
    roundTime: 60,
    pointsPerHit: 1,
    totalRounds: 3,
    pointsType: 'fixed', // 'fixed' ou 'random'
    minRandomPoints: 1,
    maxRandomPoints: 5,
    skipsPerRound: 2,
    categories: ['acoes', 'animais', 'famosos', 'objetos']
  }
};

// ===== UTILITÁRIOS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ===== NAVEGAÇÃO =====
function goToConfig() {
  // Salva estado atual
  localStorage.setItem('camimica_gameState', JSON.stringify(GameState));
  // Redireciona para página de configuração
  window.location.href = 'configurar-times.html';
}

function goBack() {
  window.history.back();
}

function goToNames() {
  localStorage.setItem('camimica_gameState', JSON.stringify(GameState));
  window.location.href = 'nomes-times.html';
}

function goToGameConfig() {
  // Salva estado atual com times e jogadores
  localStorage.setItem('camimica_gameState', JSON.stringify(GameState));
  window.location.href = 'configuracoes-jogo.html';
}

function startGame() {
  // Salva configurações finais
  localStorage.setItem('camimica_teams', JSON.stringify(GameState.teams));
  localStorage.setItem('camimica_gameConfig', JSON.stringify(GameState.gameConfig));
  localStorage.setItem('camimica_gameStarted', 'true');
  
  // Redireciona para página do jogo
  window.location.href = 'jogo.html';
}

// ===== CONFIGURAÇÃO DE TIMES =====
function incrementTeams() {
  const currentValue = GameState.numberOfTeams;
  if (currentValue < 4) {
    GameState.numberOfTeams = currentValue + 1;
    updateTeamsDisplay();
    updateSummary();
  }
}

function decrementTeams() {
  const currentValue = GameState.numberOfTeams;
  if (currentValue > 2) {
    GameState.numberOfTeams = currentValue - 1;
    updateTeamsDisplay();
    updateSummary();
  }
}

function incrementPlayers() {
  const currentValue = GameState.playersPerTeam;
  if (currentValue < 4) {
    GameState.playersPerTeam = currentValue + 1;
    updatePlayersDisplay();
    updateSummary();
  }
}

function decrementPlayers() {
  const currentValue = GameState.playersPerTeam;
  if (currentValue > 1) {
    GameState.playersPerTeam = currentValue - 1;
    updatePlayersDisplay();
    updateSummary();
  }
}

function updateTeamsDisplay() {
  const teamsValue = $('#teamsValue');
  const teamPreview = $$('.preview-dot');
  const teamsInput = $('#teamsInput');
  
  if (teamsValue) teamsValue.textContent = GameState.numberOfTeams;
  if (teamsInput) teamsInput.value = GameState.numberOfTeams;
  
  // Atualiza preview dots
  teamPreview.forEach((dot, index) => {
    dot.classList.toggle('active', index < GameState.numberOfTeams);
  });
}

function updatePlayersDisplay() {
  const playersValue = $('#playersValue');
  const playersPreview = $$('.player-icon');
  const playersInput = $('#playersInput');
  
  if (playersValue) playersValue.textContent = GameState.playersPerTeam;
  if (playersInput) playersInput.value = GameState.playersPerTeam;
  
  // Atualiza preview icons
  playersPreview.forEach((icon, index) => {
    icon.classList.toggle('active', index < GameState.playersPerTeam);
  });
}

function updateSummary() {
  const totalTeams = $('#totalTeams');
  const totalPlayers = $('#totalPlayers');
  const estimatedTime = $('#estimatedTime');
  
  if (totalTeams) totalTeams.textContent = GameState.numberOfTeams;
  
  const totalPlayersCount = GameState.numberOfTeams * GameState.playersPerTeam;
  if (totalPlayers) totalPlayers.textContent = totalPlayersCount;
  
  // Estimativa de tempo (2 minutos por jogador)
  const estimatedMinutes = Math.round(totalPlayersCount * 2);
  if (estimatedTime) {
    if (estimatedMinutes < 20) {
      estimatedTime.textContent = `${estimatedMinutes-5}-${estimatedMinutes}`;
    } else {
      estimatedTime.textContent = `${estimatedMinutes-10}-${estimatedMinutes}`;
    }
  }
}

function resetConfig() {
  GameState.numberOfTeams = 2;
  GameState.playersPerTeam = 2;
  updateTeamsDisplay();
  updatePlayersDisplay();
  updateSummary();
}

// ===== CARREGAMENTO DE TEMAS =====
async function loadThemesFromJSON() {
  const themeFiles = [
    { key: 'acoes', file: 'acoesJSON.json', name: 'Acoes' },
    { key: 'animais', file: 'animaisJSON.json', name: 'Animais' },
    { key: 'famosos', file: 'famososJSON.json', name: 'Famosos' },
    { key: 'objetos', file: 'objetosJSON.json', name: 'Objetos' }
  ];
  
  const themes = {};
  
  for (const theme of themeFiles) {
    try {
      const response = await fetch(`assets/json/${theme.file}`);
      const data = await response.json();
      const categoryKey = Object.keys(data)[0];
      const items = data[categoryKey];
      
      // Pega as primeiras palavras para nomes dos times
      themes[theme.key] = items.slice(0, 4).map((item, index) => 
        `${theme.name} ${index + 1}`
      );
    } catch (error) {
      console.error(`Erro ao carregar tema ${theme.name}:`, error);
      // Fallback para nomes genéricos
      themes[theme.key] = [`${theme.name} 1`, `${theme.name} 2`, `${theme.name} 3`, `${theme.name} 4`];
    }
  }
  
  return themes;
}

async function initializeThemeOptions() {
  const themes = await loadThemesFromJSON();
  const themeOptionsContainer = $('.theme-options');
  
  if (!themeOptionsContainer) return;
  
  const themeEmojis = {
    acoes: '🏃',
    animais: '🦁',
    famosos: '⭐',
    objetos: '📦'
  };
  
  const themeNames = {
    acoes: 'Acoes',
    animais: 'Animais',
    famosos: 'Famosos',
    objetos: 'Objetos'
  };
  
  let optionsHTML = '';
  
  for (const [key, name] of Object.entries(themeNames)) {
    optionsHTML += `
      <button type="button" class="theme-option" onclick="applyTheme('${key}')">
        <span class="theme-emoji">${themeEmojis[key]}</span>
        <span class="theme-name">${name}</span>
      </button>
    `;
  }
  
  themeOptionsContainer.innerHTML = optionsHTML;
  
  // Armazena temas para uso posterior
  window.availableThemes = themes;
}

// ===== CONFIGURAÇÃO DE NOMES =====
function initializeTeamsPage() {
  const teamsContainer = $('#teamsContainer');
  if (!teamsContainer) return;
  
  // Recupera configurações da página anterior
  const savedState = localStorage.getItem('camimica_gameState');
  if (savedState) {
    const state = JSON.parse(savedState);
    GameState.numberOfTeams = state.numberOfTeams;
    GameState.playersPerTeam = state.playersPerTeam;
    console.log(GameState.numberOfTeams)
    console.log(GameState.playersPerTeam)
  }
  
  // Gera cards para cada time
  let teamsHTML = '';
  const teamColors = ['#FF6B6B', '#4e89cd', '#FFD93D', '#6BCF7F'];
  const teamNames = ['Time 1', 'Time 2', 'Time 3', 'Time 4'];
  
  for (let i = 0; i < GameState.numberOfTeams; i++) {
    teamsHTML += generateTeamCard(i, teamColors[i], teamNames[i]);
  }
  
  teamsContainer.innerHTML = teamsHTML;
  
  // Adiciona eventos aos inputs
  addTeamInputEvents();
  
  // Inicializa opções de temas
  initializeThemeOptions();
}

function initializeGameConfigPage() {
  // Recupera estado salvo
  const savedState = localStorage.getItem('camimica_gameState');
  if (savedState) {
    const state = JSON.parse(savedState);
    GameState.teams = state.teams || [];
    GameState.numberOfTeams = state.numberOfTeams || 2;
    GameState.playersPerTeam = state.playersPerTeam || 2;
  }
  
  // Recupera configurações salvas
  const savedConfig = localStorage.getItem('camimica_gameConfig');
  if (savedConfig) {
    GameState.gameConfig = JSON.parse(savedConfig);
  }

  console.log(GameState.gameConfig)
  
  // Atualiza displays
  updateRoundTimeDisplay();
  updatePointsDisplay();
  updateTotalRoundsDisplay();
  updateSkipsDisplay();
  
  // Carrega resumo dos times
  loadTeamsSummary();
  
  // Atualiza categorias
  const categoryCheckboxes = $$('input[name="categories"]');
  categoryCheckboxes.forEach(cb => {
    cb.checked = GameState.gameConfig.categories.includes(cb.value);
  });
  
  // Adiciona event listeners para categorias
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCategories);
  });
  
  // Atualiza botões de tempo
  const timeButtons = $$('.time-button');
  timeButtons.forEach(button => {
    button.classList.toggle('active', parseInt(button.dataset.time) === GameState.gameConfig.roundTime);
  });
  
  // Configura tipo de pontuação
  const pointsTypeRadios = $$('input[name="pointsType"]');
  pointsTypeRadios.forEach(radio => {
    radio.checked = radio.value === GameState.gameConfig.pointsType;
  });
  
  // Configura inputs de pontos aleatórios
  const minRandomPointsInput = $('#minRandomPoints');
  const maxRandomPointsInput = $('#maxRandomPoints');
  if (minRandomPointsInput) minRandomPointsInput.value = GameState.gameConfig.minRandomPoints;
  if (maxRandomPointsInput) maxRandomPointsInput.value = GameState.gameConfig.maxRandomPoints;
  
  // Mostra/esconde grupos conforme tipo
  togglePointsType();
  
  // Força atualização do display de rodadas
  console.log('Quantidade de rodadas configurada:', GameState.gameConfig.totalRounds);
  updateTotalRoundsDisplay();
}

function generateTeamCard(index, color, defaultName) {
  let playersInputs = '';
  for (let i = 0; i < GameState.playersPerTeam; i++) {
    playersInputs += `
      <input 
        type="text" 
        class="player-input" 
        placeholder="Jogador ${i + 1}" 
        data-team="${index}" 
        data-player="${i}"
        maxlength="20"
      >
    `;
  }
  
  return `
    <div class="team-card" data-team-index="${index}">
      <div class="team-header">
        <div class="team-color" style="background-color: ${color}">
          ${index + 1}
        </div>
        <h3 class="team-title">${defaultName}</h3>
        <input 
          type="text" 
          class="team-name-input" 
          placeholder="Nome do Time" 
          data-team="${index}"
          maxlength="15"
          value="${defaultName}"
        >
      </div>
      <div class="players-grid">
        ${playersInputs}
      </div>
    </div>
  `;
}

function addTeamInputEvents() {
  // Eventos para inputs de nomes dos times
  const teamInputs = $$('.team-name-input');
  teamInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const teamIndex = parseInt(e.target.dataset.team);
      updateTeamName(teamIndex, e.target.value);
    });
  });
  
  // Eventos para inputs de nomes dos jogadores
  const playerInputs = $$('.player-input');
  playerInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const teamIndex = parseInt(e.target.dataset.team);
      const playerIndex = parseInt(e.target.dataset.player);
      updatePlayerName(teamIndex, playerIndex, e.target.value);
    });
  });
}

function updateTeamName(teamIndex, name) {
  if (!GameState.teams[teamIndex]) {
    GameState.teams[teamIndex] = {
      name: '',
      players: []
    };
  }
  GameState.teams[teamIndex].name = name;
}

function updatePlayerName(teamIndex, playerIndex, name) {
  if (!GameState.teams[teamIndex]) {
    GameState.teams[teamIndex] = {
      name: '',
      players: []
    };
  }
  GameState.teams[teamIndex].players[playerIndex] = name;
}

// ===== AÇÕES RÁPIDAS =====
function generateRandomNames() {
  const randomTeamNames = [
    'Tubarões', 'Águias', 'Leões', 'Tigres', 'Fênix', 'Dragões',
    'Guerreiros', 'Campeões', 'Mestres', 'Lendários', 'Invencíveis'
  ];
  
  const randomPlayerNames = [
    'Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe',
    'Gabriela', 'Henrique', 'Isabela', 'João', 'Karina',
    'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro'
  ];
  
  // Gera nomes aleatórios para os times
  const teamInputs = $$('.team-name-input');
  teamInputs.forEach((input, index) => {
    const randomName = randomTeamNames[Math.floor(Math.random() * randomTeamNames.length)];
    input.value = randomName;
    updateTeamName(index, randomName);
  });
  
  // Gera nomes aleatórios para os jogadores
  const playerInputs = $$('.player-input');
  playerInputs.forEach((input) => {
    const randomName = randomPlayerNames[Math.floor(Math.random() * randomPlayerNames.length)];
    input.value = randomName;
    const teamIndex = parseInt(input.dataset.team);
    const playerIndex = parseInt(input.dataset.player);
    updatePlayerName(teamIndex, playerIndex, randomName);
  });
}

function useTeamThemes() {
  const modal = $('#themeModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeThemeModal() {
  const modal = $('#themeModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function applyTheme(theme) {
  const selectedTheme = window.availableThemes?.[theme];
  
  if (!selectedTheme) {
    console.error(`Tema ${theme} não encontrado`);
    return;
  }
  
  const teamInputs = $$('.team-name-input');
  teamInputs.forEach((input, index) => {
    if (selectedTheme[index]) {
      input.value = selectedTheme[index];
      updateTeamName(index, selectedTheme[index]);
    }
  });
  
  closeThemeModal();
}

function clearAllNames() {
  // Limpa todos os inputs
  const allInputs = $$('input[type="text"]');
  allInputs.forEach(input => {
    input.value = '';
  });
  
  // Limpa estado do jogo
  GameState.teams = [];
}

// ===== CONFIGURAÇÕES DO JOGO =====
function setRoundTime(time) {
  GameState.gameConfig.roundTime = time;
  updateRoundTimeDisplay();
  
  // Atualiza botões
  const timeButtons = $$('.time-button');
  timeButtons.forEach(button => {
    button.classList.toggle('active', parseInt(button.dataset.time) === time);
  });
}

function updateRoundTimeDisplay() {
  const roundTimeValue = $('#roundTimeValue');
  const roundTimeInput = $('#roundTimeInput');
  
  if (roundTimeValue) roundTimeValue.textContent = `${GameState.gameConfig.roundTime} segundos`;
  if (roundTimeInput) roundTimeInput.value = GameState.gameConfig.roundTime;
}

function incrementPoints() {
  const currentValue = GameState.gameConfig.pointsPerHit;
  if (currentValue < 5) {
    GameState.gameConfig.pointsPerHit = currentValue + 1;
    updatePointsDisplay();
  }
}

function decrementPoints() {
  const currentValue = GameState.gameConfig.pointsPerHit;
  if (currentValue > 1) {
    GameState.gameConfig.pointsPerHit = currentValue - 1;
    updatePointsDisplay();
  }
}

function updatePointsDisplay() {
  const pointsValue = $('#pointsValue');
  const pointsPerHit = $('#pointsPerHit');
  const pointsInput = $('#pointsInput');
  const maxRandomPointsInput = $('#maxRandomPoints');
  
  if (pointsValue) {
    if (GameState.gameConfig.pointsType === 'fixed') {
      pointsValue.textContent = `${GameState.gameConfig.pointsPerHit} ponto${GameState.gameConfig.pointsPerHit > 1 ? 's' : ''}`;
    } else {
      pointsValue.textContent = `${GameState.gameConfig.minRandomPoints}-${GameState.gameConfig.maxRandomPoints} pontos`;
    }
  }
  
  if (pointsPerHit) pointsPerHit.textContent = GameState.gameConfig.pointsPerHit;
  if (pointsInput) pointsInput.value = GameState.gameConfig.pointsPerHit;
  if (maxRandomPointsInput) maxRandomPointsInput.value = GameState.gameConfig.maxRandomPoints;
}

function togglePointsType() {
  const selectedType = $$('input[name="pointsType"]:checked')[0].value;
  GameState.gameConfig.pointsType = selectedType;
  
  const fixedGroup = $('#fixedPointsGroup');
  const randomGroup = $('#randomPointsGroup');
  const pointsTypeInput = $('#pointsTypeInput');

  if (selectedType === 'fixed') {
    fixedGroup.classList.remove('hidden');
    randomGroup.classList.add('hidden');
  } else {
    fixedGroup.classList.add('hidden');
    randomGroup.classList.remove('hidden');
  }
  
  if (pointsTypeInput) pointsTypeInput.value = selectedType;
  updatePointsDisplay();
}

function updateRandomPointsRange() {
  const minInput = $('#minRandomPoints');
  const maxInput = $('#maxRandomPoints');
  const minRandomPointsInput = $('#minRandomPointsInput');
  const maxRandomPointsInput = $('#maxRandomPointsInput');
  
  if (minInput && maxInput) {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);
    
    // Validação: min não pode ser maior que max
    if (minVal >= maxVal) {
      minVal = maxVal - 1;
      minInput.value = minVal;
    }
    
    // Validação: max não pode ser menor que min
    if (maxVal <= minVal) {
      maxVal = minVal + 1;
      maxInput.value = maxVal;
    }
    
    // Limites
    minVal = Math.max(1, Math.min(10, minVal));
    maxVal = Math.max(2, Math.min(20, maxVal));
    
    GameState.gameConfig.minRandomPoints = minVal;
    GameState.gameConfig.maxRandomPoints = maxVal;
    
    if (minRandomPointsInput) minRandomPointsInput.value = minVal;
    if (maxRandomPointsInput) maxRandomPointsInput.value = maxVal;
    
    updatePointsDisplay();
  }
}

function incrementSkips() {
  const currentValue = GameState.gameConfig.skipsPerRound;
  if (currentValue < 5) {
    GameState.gameConfig.skipsPerRound = currentValue + 1;
    updateSkipsDisplay();
  }
}

function decrementSkips() {
  const currentValue = GameState.gameConfig.skipsPerRound;
  if (currentValue > 1) {
    GameState.gameConfig.skipsPerRound = currentValue - 1;
    updateSkipsDisplay();
  }
}

function updateSkipsDisplay() {
  const skipsValue = $('#skipsValue');
  const skipsPerRound = $('#skipsPerRound');
  const skipsPerRoundInput = $('#skipsPerRoundInput');

  console.log(GameState.gameConfig.skipsPerRound);
  
  if (skipsValue) skipsValue.textContent = `${GameState.gameConfig.skipsPerRound} pulo${GameState.gameConfig.skipsPerRound > 1 ? 's' : ''}`;
  if (skipsPerRound) skipsPerRound.textContent = GameState.gameConfig.skipsPerRound;
  if (skipsPerRoundInput) skipsPerRoundInput.value = GameState.gameConfig.skipsPerRound;
}

function incrementTotalRounds() {
  const currentValue = GameState.gameConfig.totalRounds;
  if (currentValue < 10) {
    GameState.gameConfig.totalRounds = currentValue + 1;
    updateTotalRoundsDisplay();
  }
}

function decrementTotalRounds() {
  const currentValue = GameState.gameConfig.totalRounds;
  if (currentValue > 1) {
    GameState.gameConfig.totalRounds = currentValue - 1;
    updateTotalRoundsDisplay();
  }
}

function updateTotalRoundsDisplay() {
  const totalRoundsValue = $('#totalRoundsValue');
  const totalRounds = $('#totalRounds');
  const totalRoundsInput = $('#totalRoundsInput');

  console.log(totalRoundsValue, totalRounds, totalRoundsInput);
  
  console.log('Atualizando display de rodadas:', GameState.gameConfig.totalRounds);
  
  if (totalRoundsValue) {
    const text = `${GameState.gameConfig.totalRounds} rodada${GameState.gameConfig.totalRounds > 1 ? 's' : ''}`;
    totalRoundsValue.textContent = text;
    console.log('totalRoundsValue atualizado para:', text);
  }
  if (totalRounds) {
    totalRounds.textContent = GameState.gameConfig.totalRounds;
    console.log('totalRounds atualizado para:', GameState.gameConfig.totalRounds);
  }
  if (totalRoundsInput) {
    totalRoundsInput.value = GameState.gameConfig.totalRounds;
    console.log('totalRoundsInput atualizado para:', GameState.gameConfig.totalRounds);
  }
}

function updateCategories() {
  const categoryCheckboxes = $$('input[name="categories"]:checked');
  GameState.gameConfig.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
  console.log(GameState.gameConfig.categories)
}

function loadTeamsSummary() {
  const teamsSummary = $('#teamsSummary');
  if (!teamsSummary) return;
  
  let summaryHTML = '';
  
  GameState.teams.forEach((team, index) => {
    const teamColor = ['#FF6B6B', '#4e89cd', '#FFD93D', '#6BCF7F'][index];
    summaryHTML += `
      <div class="team-summary-card">
        <div class="team-summary-header">
          <div class="team-color" style="background-color: ${teamColor}">
            ${index + 1}
          </div>
          <h4 class="team-name">${team.name || `Time ${index + 1}`}</h4>
        </div>
        <div class="players-list">
          ${team.players.map((player, playerIndex) => 
            `<div class="player-item">
              <span class="player-number">${playerIndex + 1}</span>
              <span class="player-name">${player || `Jogador ${playerIndex + 1}`}</span>
            </div>`
          ).join('')}
        </div>
      </div>
    `;
  });
  
  teamsSummary.innerHTML = summaryHTML;
}

// ===== AÇÕES RÁPIDAS DAS CONFIGURAÇÕES =====
function resetToDefaults() {
  GameState.gameConfig = {
    roundTime: 60,
    pointsPerHit: 1,
    totalRounds: 3,
    pointsType: 'fixed',
    minRandomPoints: 1,
    maxRandomPoints: 5,
    skipsPerRound: 2,
    categories: ['acoes', 'animais', 'famosos', 'objetos']
  };
  
  updateRoundTimeDisplay();
  updatePointsDisplay();
  updateTotalRoundsDisplay();
  updateSkipsDisplay();
  
  // Reseta categorias
  const categoryCheckboxes = $$('input[name="categories"]');
  categoryCheckboxes.forEach(cb => {
    cb.checked = GameState.gameConfig.categories.includes(cb.value);
  });
  
  // Reseta tipo de pontuação
  const pointsTypeRadios = $$('input[name="pointsType"]');
  pointsTypeRadios.forEach(radio => {
    radio.checked = radio.value === GameState.gameConfig.pointsType;
  });
  
  // Reseta inputs de pontos aleatórios
  const minRandomPointsInput = $('#minRandomPoints');
  const maxRandomPointsInput = $('#maxRandomPoints');
  if (minRandomPointsInput) minRandomPointsInput.value = GameState.gameConfig.minRandomPoints;
  if (maxRandomPointsInput) maxRandomPointsInput.value = GameState.gameConfig.maxRandomPoints;
  
  // Mostra/esconde grupos conforme tipo
  togglePointsType();
  
  showNotification('Configurações redefinidas para os padrões', 'success');
}

function randomizeSettings() {
  GameState.gameConfig.roundTime = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
  GameState.gameConfig.pointsPerHit = Math.floor(Math.random() * 3) + 1;
  GameState.gameConfig.totalRounds = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
  GameState.gameConfig.pointsType = ['fixed', 'random'][Math.floor(Math.random() * 2)];
  GameState.gameConfig.skipsPerRound = Math.floor(Math.random() * 5) + 1;
  
  // Gera intervalo aleatório para pontos aleatórios
  if (GameState.gameConfig.pointsType === 'random') {
    GameState.gameConfig.minRandomPoints = Math.floor(Math.random() * 5) + 1;
    GameState.gameConfig.maxRandomPoints = GameState.gameConfig.minRandomPoints + Math.floor(Math.random() * 10) + 2;
    
    // Garante que max não ultrapasse 20
    if (GameState.gameConfig.maxRandomPoints > 20) {
      GameState.gameConfig.maxRandomPoints = 20;
    }
  }
  
  // Seleciona categorias aleatórias (pelo menos 2)
  const allCategories = ['acoes', 'animais', 'famosos', 'objetos'];
  const numCategories = Math.floor(Math.random() * 3) + 2;
  GameState.gameConfig.categories = [];
  
  while (GameState.gameConfig.categories.length < numCategories) {
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
    if (!GameState.gameConfig.categories.includes(randomCategory)) {
      GameState.gameConfig.categories.push(randomCategory);
    }
  }
  
  updateRoundTimeDisplay();
  updatePointsDisplay();
  updateTotalRoundsDisplay();
  updateSkipsDisplay();
  
  // Atualiza checkboxes
  const categoryCheckboxes = $$('input[name="categories"]');
  categoryCheckboxes.forEach(cb => {
    cb.checked = GameState.gameConfig.categories.includes(cb.value);
  });
  
  // Atualiza tipo de pontuação
  const pointsTypeRadios = $$('input[name="pointsType"]');
  pointsTypeRadios.forEach(radio => {
    radio.checked = radio.value === GameState.gameConfig.pointsType;
  });
  
  // Atualiza inputs de pontos aleatórios
  const minRandomPointsInput = $('#minRandomPoints');
  const maxRandomPointsInput = $('#maxRandomPoints');
  if (minRandomPointsInput) minRandomPointsInput.value = GameState.gameConfig.minRandomPoints;
  if (maxRandomPointsInput) maxRandomPointsInput.value = GameState.gameConfig.maxRandomPoints;
  
  // Mostra/esconde grupos conforme tipo
  togglePointsType();
  
  showNotification('Configurações aleatórias aplicadas!', 'success');
}

function savePreset() {
  const presetName = prompt('Digite um nome para esta predefinição:');
  if (presetName) {
    const presets = JSON.parse(localStorage.getItem('camimica_presets') || '{}');
    presets[presetName] = GameState.gameConfig;
    localStorage.setItem('camimica_presets', JSON.stringify(presets));
    showNotification(`Predefinição "${presetName}" salva com sucesso!`, 'success');
  }
}

// ===== VALIDAÇÃO =====
function validateNamesForm() {
  const teamInputs = $$('.team-name-input');
  const playerInputs = $$('.player-input');
  
  let isValid = true;
  let errorMessage = '';
  
  // Verifica se todos os times têm nomes
  for (let i = 0; i < GameState.numberOfTeams; i++) {
    const teamName = teamInputs[i]?.value?.trim();
    if (!teamName) {
      errorMessage = `Por favor, dê um nome ao Time ${i + 1}`;
      isValid = false;
      break;
    }
  }
  
  // Verifica se todos os jogadores têm nomes
  if (isValid) {
    for (let input of playerInputs) {
      if (!input.value.trim()) {
        errorMessage = 'Por favor, preencha o nome de todos os jogadores';
        isValid = false;
        break;
      }
    }
  }
  
  if (!isValid) {
    showNotification(errorMessage, 'error');
  }
  
  return isValid;
}

function validateGameConfig() {
  // Verifica se pelo menos uma categoria está selecionada
  const selectedCategories = $$('input[name="categories"]:checked');
  if (selectedCategories.length === 0) {
    showNotification('Selecione pelo menos uma categoria de palavras', 'error');
    return false;
  }
  
  // Verifica se os times estão configurados
  if (!GameState.teams || GameState.teams.length === 0) {
    showNotification('Configure os times antes de iniciar o jogo', 'error');
    return false;
  }
  
  // Verifica se todos os times têm nomes e jogadores
  for (let i = 0; i < GameState.teams.length; i++) {
    const team = GameState.teams[i];
    if (!team.name || !team.players || team.players.length === 0) {
      showNotification(`Complete a configuração do Time ${i + 1}`, 'error');
      return false;
    }
    
    // Verifica se todos os jogadores têm nomes
    for (let j = 0; j < team.players.length; j++) {
      if (!team.players[j] || team.players[j].trim() === '') {
        showNotification(`Preencha o nome do Jogador ${j + 1} do Time ${i + 1}`, 'error');
        return false;
      }
    }
  }
  
  return true;
}

function showNotification(message, type = 'info') {
  // Remove notificações existentes
  const existingNotification = $('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Cria nova notificação
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  // Estilos
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: '9999',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px'
  });
  
  // Cor baseada no tipo
  const colors = {
    success: '#6BCF7F',
    error: '#FF5252',
    warning: '#FFA726',
    info: '#42A5F5'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(notification);
  
  // Anima entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove após 5 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// ===== EVENTOS =====
document.addEventListener('DOMContentLoaded', function() {
  // Detecta página atual
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('configurar-times.html')) {
    initializeConfigPage();
  } else if (currentPath.includes('nomes-times.html')) {
    initializeTeamsPage();
  } else if (currentPath.includes('configuracoes-jogo.html')) {
    initializeGameConfigPage();
  }
  
  // Adiciona eventos globais
  addGlobalEvents();
});

function initializeConfigPage() {
  // Recupera estado salvo
  const savedState = localStorage.getItem('camimica_gameState');
  if (savedState) {
    const state = JSON.parse(savedState);
    GameState.numberOfTeams = state.numberOfTeams || 2;
    GameState.playersPerTeam = state.playersPerTeam || 2;
  }
  
  // Atualiza displays
  updateTeamsDisplay();
  updatePlayersDisplay();
  updateSummary();
  
  // Adiciona evento ao formulário
  const configForm = $('#configForm');
  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      goToNames();
    });
  }
}

function addGlobalEvents() {
  // Fecha modal ao clicar fora
  document.addEventListener('click', (e) => {
    const modal = $('#themeModal');
    if (modal && e.target === modal) {
      closeThemeModal();
    }
  });
  
  // Fecha modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeThemeModal();
    }
  });
  
  // Formulário de nomes
  const namesForm = $('#namesForm');
  if (namesForm) {
    namesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (validateNamesForm()) {
        goToGameConfig();
      }
    });
  }
  
  // Formulário de configurações do jogo
  const gameConfigForm = $('#gameConfigForm');
  if (gameConfigForm) {
    gameConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (validateGameConfig()) {
        startGame();
      }
    });
  }
}

// ===== ANIMAÇÕES =====
function animateButton(button) {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 150);
}

// Adiciona efeito de clique aos botões
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
    const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
    animateButton(button);
  }
});

// ===== STORAGE =====
function saveGameState() {
  localStorage.setItem('camimica_gameState', JSON.stringify(GameState));
}

function loadGameState() {
  const saved = localStorage.getItem('camimica_gameState');
  if (saved) {
    const savedState = JSON.parse(saved);
    Object.assign(GameState, savedState);
  }
}

function clearGameState() {
  localStorage.removeItem('camimica_gameState');
  localStorage.removeItem('camimica_teams');
  localStorage.removeItem('camimica_gameStarted');
}

// Exporta funções para uso global
window.Camimica = {
  GameState,
  goToConfig,
  goBack,
  goToNames,
  goToGameConfig,
  startGame,
  incrementTeams,
  decrementTeams,
  incrementPlayers,
  decrementPlayers,
  resetConfig,
  generateRandomNames,
  useTeamThemes,
  closeThemeModal,
  applyTheme,
  clearAllNames,
  setRoundTime,
  incrementPoints,
  decrementPoints,
  incrementTotalRounds,
  decrementTotalRounds,
  togglePointsType,
  updateRandomPointsRange,
  incrementSkips,
  decrementSkips,
  resetToDefaults,
  randomizeSettings,
  savePreset,
  showNotification
};
