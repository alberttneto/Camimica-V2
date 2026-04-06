/**
 * CAMIMICA - Lógica do Jogo
 * JavaScript principal com funcionalidades do jogo de mímica
 */

// ===== ESTADO DO JOGO =====
const Game = {
  teams: [],
  currentTeamIndex: 0,
  currentPlayerIndex: 0,
  roundNumber: 1,
  currentWord: null,
  currentCategory: null,
  timer: null,
  timeRemaining: 0,
  isPaused: false,
  isPlaying: false,
  skipsRemaining: 0,
  hitsInRound: 0,
  wordsUsed: [],
  availableWords: {},
  gameConfig: {},
  scores: {},
  playersInRound: [], // Controle de jogadores que já jogaram na rodada atual
  totalPlayersPlayed: 0, // Total de jogadores que já jogaram em todas as rodadas
  playerOrder: [], // Ordem fixa dos jogadores para alternância entre times
  wordShown: false, // Controla se a palavra já foi mostrada
  turnStarted: false // Controla se a vez do jogador já começou
};

// ===== UTILITÁRIOS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
});

async function initializeGame() {
  try {
    // Recupera dados do localStorage
    loadGameData();
    
    // Carrega palavras das categorias selecionadas
    await loadWords();
    
    // Inicializa controle de rodadas
    initializeRoundControl();
    
    // Define o primeiro jogador baseado na ordem
    if (Game.playerOrder.length > 0) {
      const firstPlayer = Game.playerOrder[0];
      Game.currentTeamIndex = firstPlayer.teamIndex;
      Game.currentPlayerIndex = firstPlayer.playerIndex;
      console.log(`Primeiro jogador: ${firstPlayer.playerName} (${firstPlayer.teamName})`);
    }
    
    // Inicializa interface
    updateScoreBoard();
    updateCurrentPlayer();
    updateGameStatus();
    
    // Esconde loading e mostra jogo
    setTimeout(() => {
      $('#loadingScreen').classList.add('hidden');
      $('#gameContainer').classList.remove('hidden');
    }, 1500);
    
  } catch (error) {
    console.error('Erro ao inicializar jogo:', error);
    showNotification('Erro ao carregar o jogo. Tente novamente.', 'error');
  }
}

function loadGameData() {
  // Carrega times
  const savedTeams = localStorage.getItem('camimica_teams');
  if (savedTeams) {
    Game.teams = JSON.parse(savedTeams);
  }
  
  // Carrega configurações
  const savedConfig = localStorage.getItem('camimica_gameConfig');
  if (savedConfig) {
    Game.gameConfig = JSON.parse(savedConfig);
  }
  
  // Inicializa pontuações
  Game.teams.forEach((team, index) => {
    Game.scores[index] = 0;
  });
  
  // Configura pulos disponíveis
  Game.skipsRemaining = Game.gameConfig.skipsPerRound;
}

function initializeRoundControl() {
  // Inicializa arrays de controle
  Game.playersInRound = [];
  Game.totalPlayersPlayed = 0;
  
  // Cria ordem fixa alternada entre times
  createPlayerOrder();
  
  // Calcula total de jogadores
  const totalPlayers = Game.teams.reduce((total, team) => total + team.players.length, 0);
  console.log(`Total de jogadores: ${totalPlayers}, Total de rodadas: ${Game.gameConfig.totalRounds}`);
  console.log('Ordem dos jogadores:', Game.playerOrder);
}

function createPlayerOrder() {
  Game.playerOrder = [];
  
  // Encontra o número máximo de jogadores em qualquer time
  const maxPlayers = Math.max(...Game.teams.map(team => team.players.length));
  
  // Cria ordem alternada: Time 1, Time 2, Time 1, Time 2, etc.
  for (let i = 0; i < maxPlayers; i++) {
    for (let teamIndex = 0; teamIndex < Game.teams.length; teamIndex++) {
      if (Game.teams[teamIndex].players[i]) {
        Game.playerOrder.push({
          teamIndex: teamIndex,
          playerIndex: i,
          playerName: Game.teams[teamIndex].players[i],
          teamName: Game.teams[teamIndex].name
        });
      }
    }
  }
  
  console.log('Ordem de jogo criada:', Game.playerOrder);
}

async function loadWords() {
  const categories = Game.gameConfig.categories;
  Game.availableWords = {};
  
  for (const category of categories) {
    try {
      const response = await fetch(`assets/json/${category}JSON.json`);
      const data = await response.json();
      const categoryKey = Object.keys(data)[0];
      Game.availableWords[category] = data[categoryKey];
    } catch (error) {
      console.error(`Erro ao carregar categoria ${category}:`, error);
      Game.availableWords[category] = [];
    }
  }
}

// ===== LÓGICA DO JOGO =====
function showWord() {
  if (Game.wordShown) return;
  
  // Seleciona palavra aleatória
  selectRandomWord();
  
  // Mostra palavra
  Game.wordShown = true;
  updateWordDisplay();
  
  // Mostra botões de pular e começar vez
  $('#showWordButton').classList.add('hidden');
  $('#skipWordButton').classList.remove('hidden');
  $('#startTurnButton').classList.remove('hidden');
  
  // Atualiza contador de pulos
  updateSkipButton();
  
  showNotification('Palavra mostrada! Você pode pular ou começar a vez.', 'info');
}

function skipWord() {
  console.log('skipWord chamado');
  console.log('Game.skipsRemaining:', Game.skipsRemaining);
  console.log('Game.wordShown:', Game.wordShown);
  console.log('Game.turnStarted:', Game.turnStarted);
  
  if (Game.skipsRemaining <= 0 || !Game.wordShown || Game.turnStarted) {
    console.log('skipWord bloqueado - condições não atendidas');
    return;
  }
  
  Game.skipsRemaining--;
  updateSkipButton();
  
  // Seleciona nova palavra
  selectRandomWord();
  updateWordDisplay();
  
  console.log('Nova palavra selecionada:', Game.currentWord);
  console.log('Nova categoria:', Game.currentCategory);
  
  showNotification(`Palavra pulada! Restam ${Game.skipsRemaining} pulo(s)`, 'warning');
}

function startTurn() {
  if (!Game.wordShown || Game.turnStarted) return;
  
  // Inicia timer
  Game.turnStarted = true;
  Game.isPlaying = true;
  Game.timeRemaining = Game.gameConfig.roundTime;
  
  // Esconde botões de preparação
  $('#skipWordButton').classList.add('hidden');
  $('#startTurnButton').classList.add('hidden');
  
  // Mostra botão de encerrar
  $('#endTurnButton').classList.remove('hidden');
  
  // Atualiza interface
  updateTimerDisplay();
  updateButtons();
  
  // Inicia contagem regressiva
  Game.timer = setInterval(() => {
    if (!Game.isPaused) {
      Game.timeRemaining--;
      updateTimerDisplay();
      
      if (Game.timeRemaining <= 0) {
        endTurn();
      }
    }
  }, 1000);
  
  showNotification('Vez iniciada! Boa sorte!', 'success');
}

function endTurn() {
  if (!Game.turnStarted) return;
  
  clearInterval(Game.timer);
  Game.isPlaying = false;
  Game.isPaused = false;
  Game.turnStarted = false;

  // Registra que este jogador jogou na rodada atual
  const currentPlayerId = `${Game.currentTeamIndex}-${Game.currentPlayerIndex}`;
  console.log(!Game.playersInRound.includes(currentPlayerId));
  if (!Game.playersInRound.includes(currentPlayerId)) {
    Game.playersInRound.push(currentPlayerId);
    Game.totalPlayersPlayed++;
  }
  
  // Esconde botão de encerrar
  $('#endTurnButton').classList.add('hidden');
  
  // Mostra modal de resultado
  showRoundResult();
  updateButtons();
}

function handleResult(result) {
  if (result === 'hit') {
    // Calcula pontos
    let points = Game.gameConfig.pointsPerHit;
    if (Game.gameConfig.pointsType === 'random') {
      const min = Game.gameConfig.minRandomPoints;
      const max = Game.gameConfig.maxRandomPoints;
      points = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Adiciona pontos ao time atual
    Game.scores[Game.currentTeamIndex] += points;
    updateScoreBoard();
    
    showNotification(`+${points} ponto${points > 1 ? 's' : ''} para ${Game.teams[Game.currentTeamIndex].name}!`, 'success');
  } else {
    showNotification(`${Game.teams[Game.currentTeamIndex].name} não pontuou nesta vez.`, 'info');
  }
  
  // Fecha modal e vai para próximo jogador
  closeRoundResult();
  nextRound();
}

function selectRandomWord() {
  const categories = Object.keys(Game.availableWords);
  const availableWords = [];
  
  console.log('Categorias disponíveis:', categories);
  console.log('Palavras usadas:', Game.wordsUsed);
  
  // Coleta todas as palavras disponíveis
  for (const category of categories) {
    for (const word of Game.availableWords[category]) {
      if (!Game.wordsUsed.includes(word)) {
        availableWords.push({ word, category });
      }
    }
  }
  
  console.log('Palavras disponíveis:', availableWords.length);
  
  if (availableWords.length === 0) {
    // Todas as palavras foram usadas, reseta
    console.log('Todas as palavras usadas, resetando...');
    Game.wordsUsed = [];
    return selectRandomWord();
  }
  
  // Seleciona palavra aleatória
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const selected = availableWords[randomIndex];
  
  console.log('Palavra selecionada:', selected);
  
  Game.currentWord = selected.word;
  Game.currentCategory = selected.category;
  Game.wordsUsed.push(selected.word);
}

function pauseRound() {
  if (!Game.isPlaying || Game.isPaused) return;
  
  Game.isPaused = true;
  updateButtons();
  showNotification('Jogo pausado', 'info');
}

function resumeRound() {
  if (!Game.isPlaying || !Game.isPaused) return;
  
  Game.isPaused = false;
  updateButtons();
  showNotification('Jogo retomado', 'info');
}

function stopRound() {
  if (!Game.isPlaying) return;
  
  clearInterval(Game.timer);
  Game.isPlaying = false;
  Game.isPaused = false;
  
  updateButtons();
  showNotification('Rodada parada', 'info');
}

// function endRound() {
//   clearInterval(Game.timer);
//   Game.isPlaying = false;
//   Game.isPaused = false;
  
//   // Registra que este jogador jogou na rodada atual
//   const currentPlayerId = `${Game.currentTeamIndex}-${Game.currentPlayerIndex}`;
//   console.log(!Game.playersInRound.includes(currentPlayerId));
//   if (!Game.playersInRound.includes(currentPlayerId)) {
//     Game.playersInRound.push(currentPlayerId);
//     Game.totalPlayersPlayed++;
//   }
  
//   // Mostra resultado da rodada
//   showRoundResult();
//   updateButtons();
// }

function stopRound() {
  if (!Game.isPlaying) return;
  
  clearInterval(Game.timer);
  Game.isPlaying = false;
  Game.isPaused = false;
  
  updateButtons();
  showNotification('Rodada parada', 'info');
}

// function endRound() {
//   clearInterval(Game.timer);
//   Game.isPlaying = false;
//   Game.isPaused = false;
  
//   // Mostra resultado da rodada
//   showRoundResult();
//   updateButtons();
// }

function skipWord() {
  console.log(Game.skipsRemaining);
  console.log(!Game.isPlaying);
  console.log(Game.isPaused);
  console.log(Game.skipsRemaining <= 0 || !Game.isPlaying || Game.isPaused);
  // if (Game.skipsRemaining <= 0 || !Game.isPlaying || Game.isPaused) return;
  if (Game.skipsRemaining <= 0 || Game.isPaused) return;
  Game.skipsRemaining--;
  updateSkipButton();
  
  // Seleciona nova palavra
  selectRandomWord();
  updateWordDisplay();
  
  showNotification(`Palavra pulada! Restam ${Game.skipsRemaining} pulo(s)`, 'warning');
}

function hitWord() {
  if (!Game.isPlaying || Game.isPaused) return;
  
  // Calcula pontos
  let points = Game.gameConfig.pointsPerHit;
  if (Game.gameConfig.pointsType === 'random') {
    const min = Game.gameConfig.minRandomPoints;
    const max = Game.gameConfig.maxRandomPoints;
    points = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Adiciona pontos ao time atual
  Game.scores[Game.currentTeamIndex] += points;
  Game.hitsInRound++;
  
  // Seleciona nova palavra
  selectRandomWord();
  updateWordDisplay();
  updateScoreBoard();
  
  showNotification(`+${points} ponto${points > 1 ? 's' : ''}!`, 'success');
}

// ===== ATUALIZAÇÃO DE INTERFACE =====
function updateScoreBoard() {
  const teamsScore = $('#teamsScore');
  if (!teamsScore) return;
  
  let scoreHTML = '';
  Game.teams.forEach((team, index) => {
    const score = Game.scores[index] || 0;
    const isCurrentTeam = index === Game.currentTeamIndex;
    const teamColor = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F'][index];
    
    scoreHTML += `
      <div class="team-score-card ${isCurrentTeam ? 'current' : ''}">
        <div class="team-score-header">
          <div class="team-score-color" style="background-color: ${teamColor}">
            ${index + 1}
          </div>
          <h4 class="team-score-name">${team.name}</h4>
        </div>
        <div class="team-score-points">
          <span class="score-value">${score}</span>
          <span class="score-label">pontos</span>
        </div>
      </div>
    `;
  });
  
  teamsScore.innerHTML = scoreHTML;
}

function updateCurrentPlayer() {
  const playerName = $('#playerName');
  const playerTeam = $('#playerTeam');
  
  if (!playerName || !playerTeam) return;
  
  const currentTeam = Game.teams[Game.currentTeamIndex];
  const currentPlayer = currentTeam.players[Game.currentPlayerIndex];
  
  playerName.textContent = currentPlayer || 'Jogador';
  playerTeam.textContent = currentTeam.name || 'Time';
}

function updateGameStatus() {
  const roundNumber = $('#roundNumber');
  const totalRoundsDisplay = $('#totalRoundsDisplay');
  const currentCategory = $('#currentCategory');
  
  if (roundNumber) roundNumber.textContent = `${Game.roundNumber}/${Game.gameConfig.totalRounds}`;
  if (totalRoundsDisplay) totalRoundsDisplay.textContent = Game.gameConfig.totalRounds;
  if (currentCategory) currentCategory.textContent = getCategoryDisplayName(Game.currentCategory) || '-';
}

function updateWordDisplay() {
  const wordText = $('#wordText');
  const wordCategory = $('#wordCategory');
  
  console.log('updateWordDisplay chamado');
  console.log('Game.wordShown:', Game.wordShown);
  console.log('Game.currentWord:', Game.currentWord);
  console.log('Game.currentCategory:', Game.currentCategory);
  
  if (!wordText || !wordCategory) {
    console.log('Elementos não encontrados');
    return;
  }
  
  if (Game.wordShown && Game.currentWord) {
    wordText.textContent = Game.currentWord;
    wordCategory.textContent = getCategoryDisplayName(Game.currentCategory) || '-';
    console.log('Palavra exibida:', Game.currentWord);
  } else {
    wordText.textContent = 'Clique em "Mostrar Palavra" para ver';
    wordCategory.textContent = '-';
    console.log('Palavra oculta');
  }
}

function updateTimerDisplay() {
  const timerValue = $('#timerValue');
  if (!timerValue) return;
  
  timerValue.textContent = Math.max(0, Game.timeRemaining);
  
  // Muda cor quando está acabando
  if (Game.timeRemaining <= 10) {
    timerValue.classList.add('warning');
  } else {
    timerValue.classList.remove('warning');
  }
}

function updateButtons() {
  const showWordButton = $('#showWordButton');
  const skipWordButton = $('#skipWordButton');
  const startTurnButton = $('#startTurnButton');
  const endTurnButton = $('#endTurnButton');
  
  // Estado inicial: mostrar palavra
  if (!Game.wordShown) {
    showWordButton.classList.remove('hidden');
    skipWordButton.classList.add('hidden');
    startTurnButton.classList.add('hidden');
    endTurnButton.classList.add('hidden');
  }
  // Palavra mostrada, pode pular ou começar
  else if (Game.wordShown && !Game.turnStarted) {
    showWordButton.classList.add('hidden');
    skipWordButton.classList.remove('hidden');
    startTurnButton.classList.remove('hidden');
    endTurnButton.classList.add('hidden');
    
    // Habilita/desabilita botão de pular
    skipWordButton.disabled = Game.skipsRemaining <= 0;
  }
  // Vez iniciada, pode encerrar
  else if (Game.turnStarted) {
    showWordButton.classList.add('hidden');
    skipWordButton.classList.add('hidden');
    startTurnButton.classList.add('hidden');
    endTurnButton.classList.remove('hidden');
  }
}

function updateSkipButton() {
  const skipCount = $('#skipCount');
  const skipWordButton = $('#skipWordButton');
  
  if (!skipCount || !skipWordButton) return;
  
  skipCount.textContent = Game.skipsRemaining;
  
  if (Game.skipsRemaining <= 0) {
    skipWordButton.disabled = true;
    skipWordButton.classList.add('disabled');
  } else {
    skipWordButton.disabled = false;
    skipWordButton.classList.remove('disabled');
  }
}

// ===== MODAIS =====
function showRoundResult() {
  const modal = $('#roundResultModal');
  
  if (!modal) return;
  
  // Mostra modal de resultado
  modal.classList.remove('hidden');
}

function closeRoundResult() {
  const modal = $('#roundResultModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function nextRound() {
  closeRoundResult();
  
  // Verifica se todos os jogadores já jogaram na rodada atual
  const totalPlayers = Game.teams.reduce((total, team) => total + team.players.length, 0);
  console.log(totalPlayers)
  if (Game.playersInRound.length >= totalPlayers) {
    // Todos jogaram, avança para próxima rodada
    Game.roundNumber++;
    Game.playersInRound = [];
    
    // Verifica se atingiu o número total de rodadas
    if (Game.roundNumber > Game.gameConfig.totalRounds) {
      showGameOver();
      return;
    }
    
    showNotification(`Iniciando Rodada ${Game.roundNumber}!`, 'info');
  }
  
  // Próximo jogador que ainda não jogou nesta rodada
  nextAvailablePlayer();
  
  // Reseta estado da vez do jogador
  Game.currentWord = null;
  Game.currentCategory = null;
  Game.isPlaying = false;
  Game.isPaused = false;
  Game.turnStarted = false;
  Game.wordShown = false;
  Game.skipsRemaining = Game.gameConfig.skipsPerRound;
  Game.hitsInRound = 0;
  
  // Atualiza interface
  updateCurrentPlayer();
  updateGameStatus();
  updateWordDisplay();
  updateButtons();
  
  // Reseta botões para estado inicial
  $('#showWordButton').classList.remove('hidden');
  $('#skipWordButton').classList.add('hidden');
  $('#startTurnButton').classList.add('hidden');
  $('#endTurnButton').classList.add('hidden');
  
  const currentTeam = Game.teams[Game.currentTeamIndex];
  const currentPlayer = currentTeam.players[Game.currentPlayerIndex];
  showNotification(`Vez de ${currentPlayer} (${currentTeam.name})`, 'info');
}

function nextAvailablePlayer() {
  // Procura o próximo jogador na ordem fixa que ainda não jogou nesta rodada
  for (let i = 0; i < Game.playerOrder.length; i++) {
    const player = Game.playerOrder[i];
    const playerId = `${player.teamIndex}-${player.playerIndex}`;
    console.log(player)
    console.log(!Game.playersInRound.includes(playerId))
    if (!Game.playersInRound.includes(playerId)) {
      // Encontrou jogador disponível, atualiza estado
      Game.currentTeamIndex = player.teamIndex;
      Game.currentPlayerIndex = player.playerIndex;
      console.log(`Próximo jogador: ${player.playerName} (${player.teamName})`);
      return;
    }
  }
  
  // Se não encontrou (não deveria acontecer), reinicia
  console.log('Nenhum jogador disponível encontrado, reiniciando...');
  Game.playersInRound = [];
  Game.currentTeamIndex = 0;
  Game.currentPlayerIndex = 0;
}

function nextPlayer() {
  // Próximo jogador no mesmo time
  Game.currentPlayerIndex++;
  
  // Se acabaram os jogadores do time atual, vai para o próximo time
  if (Game.currentPlayerIndex >= Game.teams[Game.currentTeamIndex].players.length) {
    Game.currentPlayerIndex = 0;
    Game.currentTeamIndex++;
    
    // Se acabaram os times, volta para o primeiro
    if (Game.currentTeamIndex >= Game.teams.length) {
      Game.currentTeamIndex = 0;
    }
  }
}

function checkWinner() {
  for (let i = 0; i < Game.teams.length; i++) {
    if (Game.scores[i] >= Game.gameConfig.winningScore) {
      return Game.teams[i];
    }
  }
  return null;
}

function showGameOver() {
  const modal = $('#gameOverModal');
  const winnerContent = $('#winnerContent');
  
  if (!modal || !winnerContent) return;
  
  // Encontra o time com maior pontuação
  let maxScore = -1;
  let winner = null;
  let winnerIndex = -1;
  
  Game.teams.forEach((team, index) => {
    const score = Game.scores[index] || 0;
    if (score > maxScore) {
      maxScore = score;
      winner = team;
      winnerIndex = index;
    }
  });
  
  const teamColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F'];
  
  winnerContent.innerHTML = `
    <div class="winner-announcement">
      <div class="winner-trophy">🏆</div>
      <h2 class="winner-title">Parabéns, ${winner.name}!</h2>
      <p class="winner-subtitle">Vocês venceram o jogo com ${Game.scores[winnerIndex]} pontos!</p>
      <p class="winner-subtitle">Jogo concluído em ${Game.gameConfig.totalRounds} rodadas</p>
      
      <div class="final-scores">
        <h3 class="final-scores-title">Placar Final</h3>
        ${Game.teams.map((team, index) => `
          <div class="final-score-item">
            <div class="final-team-color" style="background-color: ${teamColors[index]}">
              ${index + 1}
            </div>
            <div class="final-team-info">
              <span class="final-team-name">${team.name}</span>
              <span class="final-team-score">${Game.scores[index]} pontos</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function newGame() {
  // Limpa dados do jogo
  localStorage.removeItem('camimica_gameStarted');
  window.location.href = 'index.html';
}

// ===== UTILITÁRIOS =====
function getCategoryDisplayName(category) {
  const names = {
    'acoes': 'Ações',
    'animais': 'Animais',
    'famosos': 'Famosos',
    'objetos': 'Objetos'
  };
  return names[category] || category;
}

function getAveragePoints() {
  if (Game.gameConfig.pointsType === 'random') {
    return Math.floor((Game.gameConfig.minRandomPoints + Game.gameConfig.maxRandomPoints) / 2);
  }
  return Game.gameConfig.pointsPerHit;
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

function goBack() {
  window.location.href = 'configuracoes-jogo.html';
}

function goToConfig() {
  window.location.href = 'index.html';
}
