# CAMIMICA 🎭

Jogo de mímica interativo desenvolvido com tecnologias web modernas, totalmente responsivo e otimizado para a melhor experiência de usuário.

## � Sobre o Jogo

CAMIMICA é um jogo de mímica multiplayer onde os jogadores se dividem em times para competir através de gestos e expressões. O jogo oferece um sistema completo de configuração de times, categorias de palavras, e controle de rodadas com pontuação dinâmica.

### 🌟 Características Principais

- **📱 Totalmente Responsivo**: Interface adaptativa para desktop, tablet e mobile
- **� Sistema de Turnos**: Controle alternado entre times com ordem fixa
- **🎯 Múltiplas Categorias**: Ações, Animais, Famosos e Objetos
- **⚙️ Configurações Flexíveis**: Tempo por rodada, pontos, pulos e tipo de pontuação
- **🏆 Sistema de Rodadas**: Jogo definido por número de rodadas em vez de pontuação
- **� Design Moderno**: Interface intuitiva com animações suaves e feedback visual

## 🛠️ Tecnologias Utilizadas

### Frontend Puro (Sem Frameworks)
- **HTML5 Semântico**: Estrutura acessível e bem organizada
- **CSS3 Moderno**: Grid Layout, Flexbox, Variáveis CSS, Animações
- **JavaScript ES6+**: Lógica modular, async/await, Local Storage API

### Arquitetura do Projeto
```
camimica-v2/
├── index.html                 # Página inicial
├── nomes-times.html           # Configuração de times
├── configuracoes-jogo.html    # Configurações do jogo
├── jogo.html                 # Interface principal do jogo
├── css/
│   └── style.css            # Estilos completos e responsivos
├── js/
│   ├── main.js              # Lógica de configuração e navegação
│   └── game.js              # Motor do jogo
└── assets/
    └── json/
        ├── acoesJSON.json     # Palavras de ações
        ├── animaisJSON.json   # Palavras de animais
        ├── famososJSON.json   # Palavras de famosos
        └── objetosJSON.json   # Palavras de objetos
```

### Funcionalidades Técnicas

#### Sistema de Estado
- **GameState**: Objeto global para gerenciamento de configurações
- **Game**: Objeto de estado do jogo em tempo real
- **LocalStorage**: Persistência de dados entre sessões

#### Sistema de Componentes
- **Modular**: Código organizado em funções reutilizáveis
- **Event-Driven**: Sistema baseado em eventos DOM
- **Responsive Design**: Media queries para múltiplos dispositivos

#### Sistema de Dados
- **JSON Estruturado**: Categorias organizadas por tipo
- **Carregamento Assíncrono**: Fetch API para palavras
- **Cache Inteligente**: Controle de palavras usadas

## 🎮 Fluxo do Jogo

### 1. Configuração
1. **Definição de Times**: 2-4 times com 1-4 jogadores cada
2. **Personalização**: Nomes dos times e jogadores
3. **Temas Visuais**: Cores diferenciadas para cada time

### 2. Configurações do Jogo
- **⏱️ Tempo por Rodada**: 30, 60, 90 ou 120 segundos
- **🎯 Sistema de Pontos**: Fixo ou aleatório dentro de intervalos
- **🔄 Pulos por Rodada**: 1-5 pulos permitidos
- **📚 Categorias**: Seleção múltipla de temas de palavras
- **🔢 Total de Rodadas**: 1-10 rodadas definidas

### 3. Mecânica do Jogo
1. **Ordem Alternada**: Time 1 → Time 2 → Time 1...
2. **Proteção de Palavra**: Apenas jogador da vez vê a palavra
3. **Controle de Pulos**: Limitado por configuração
4. **Timer Progressivo**: Contagem regressiva com encerramento manual
5. **Sistema de Acerto**: Escolha entre "Acertou" e "Errou"
6. **Avanço por Rodadas**: Todos jogam em cada rodada

### 4. Sistema de Pontuação
- **Pontos Dinâmicos**: Conforme configuração (fixo ou aleatório)
- **Acumulação por Time**: Soma total ao final das rodadas
- **Vencedor por Pontos**: Time com maior pontuação total

## 🎨 Interface do Usuário

### Design System
- **Cores Variáveis**: CSS Custom Properties para tema consistente
- **Tipografia Hierárquica**: Tamanhos e pesos bem definidos
- **Espaçamento Uniforme**: Sistema de spacing baseado em rem
- **Sombras e Depth**: Efeitos visuais modernos

### Layout Responsivo
#### Desktop (>1024px)
- **Grid 3 Colunas**: current-turn | game-area | score-board
- **Altura Consistente**: game-area e score-board com mesma altura
- **Informações Laterais**: Jogador atual e placar sempre visíveis

#### Mobile (<1024px)
- **Single Column**: Layout empilhado verticalmente
- **Ordem Lógica**: current-turn → game-area → score-board → game-status
- **Otimização Touch**: Botões maiores e espaçamento adequado

### Componentes Interativos
- **Botões Animados**: Hover effects e transições suaves
- **Modais Centrais**: Resultados e fim de jogo
- **Feedback Visual**: Notificações e indicadores de estado
- **Timer Dinâmico**: Mudança de cor quando acabando

## 🚀 Como Executar

### Desenvolvimento Local
```bash
# Clone o repositório
git clone <seu-repositorio>
cd camimica-v2

# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js
npx serve .

# Opção 3: VS Code Live Server
# Instale extensão "Live Server"
# Botão direito em index.html > "Open with Live Server"
- **Ações rápidas**:
  - 🎲 Gerar nomes aleatórios
  - 🎨 Aplicar temas pré-definidos
  - 🗑️ Limpar todos os campos
- **Instruções** das próximas etapas
- **Validação** de formulário antes de iniciar

## 🎨 Tecnologias Utilizadas

### Frontend Puro
- **HTML5 Semântico**: Estrutura acessível e bem organizada
- **CSS3 Moderno**: 
  - Variáveis CSS para design system
  - Flexbox e Grid para layouts responsivos
  - Animações e transições suaves
  - Gradientes e sombras modernas
- **JavaScript ES6+**:
  - Módulos e classes organizadas
  - LocalStorage para persistência de dados
  - Eventos modernos e validações
  - Código limpo e manutenível

### Design e UX
- **Google Fonts**: Fredoka (divertido) + Inter (legibilidade)
- **Cores Vibrantes**: Paleta inspirada em jogos e diversão
- **Iconografia**: SVGs e emojis para comunicação visual
- **Responsividade**: Mobile-first com breakpoints otimizados

## 📂 Estrutura do Projeto

```
CAMIMICA V2/
├── index.html              # Página inicial
├── configurar-times.html   # Configuração de times
├── nomes-times.html        # Nomeação de times/jogadores
├── css/
│   └── style.css          # Estilos completos
├── js/
│   └── main.js           # Lógica do jogo
├── assets/
│   └── icons/
│       └── favicon.svg   # Favicon personalizado
└── README.md             # Este arquivo
```

## 🎯 Como Jogar

### 1. Configuração Inicial
- Acesse a página inicial e clique em "Começar Jogo"
- Escolha o número de times (2-4)
- Defina quantos jogadores por time (1-4)
- Clique em "Avançar"

### 2. Personalização
- Dê nomes criativos para cada time
- Insira o nome de todos os jogadores
- Use as ações rápidas para ajuda (nomes aleatórios, temas)
- Clique em "Iniciar Jogo"

### 3. Durante o Jogo
- Um jogador de cada vez faz as mímicas
- Os outros integrantes tentam adivinhar
- Cada acerto vale pontos para o time
- O time com mais pontos vence!

## 🌐 Publicando no GitHub Pages

### Método Automático
1. **Faça upload** do projeto para um repositório GitHub
2. **Vá para Settings** do repositório
3. **Role até "Pages"** na seção "Code and automation"
4. **Selecione a branch** (geralmente `main` ou `master`)
5. **Escolha a pasta** `/ (root)`
6. **Clique em Save**

### Método Manual com GitHub CLI
```bash
gh repo create camimica --public --source=. --remote=origin --push
```

## 📱 Responsividade

O CAMIMICA foi projetado com uma abordagem mobile-first:

### 📱 Celulares (< 480px)
- Layout único com elementos empilhados
- Botões grandes para fácil toque
- Texto otimizado para telas pequenas
- Navegação simplificada

### 📱 Tablets (480px - 768px)
- Grid adaptativo com 2 colunas
- Espaçamento otimizado
- Toques e interações melhoradas

### 💻 Desktops (> 768px)
- Layout completo com múltiplas colunas
- Animações e efeitos avançados
- Experiência completa do jogo

## 🎨 Personalização

### Cores
Edite as variáveis CSS no início do arquivo `css/style.css`:
```css
:root {
  --primary-color: #FF6B6B;    /* Cor principal */
  --secondary-color: #4ECDC4;  /* Cor secundária */
  --accent-color: #FFD93D;      /* Cor de destaque */
  /* ... outras variáveis */
}
```

### Fontes
As fontes são carregadas do Google Fonts. Para alterar:
1. Escolha fontes no [Google Fonts](https://fonts.google.com/)
2. Atualize os links no `<head>` das páginas HTML
3. Altere as variáveis `--font-family-primary` e `--font-family-secondary`

### Temas
Adicione novos temas na função `applyTheme()` em `js/main.js`:
```javascript
const themes = {
  novoTema: ['Nome1', 'Nome2', 'Nome3', 'Nome4']
  // ...
};
```

## 🔧 Funcionalidades Técnicas

### Estado do Jogo
- **Persistência Local**: Usa localStorage para salvar configurações
- **Gerenciamento de Estado**: Objeto GameState centralizado
- **Navegação**: Fluxo controlado entre páginas

### Validação
- **Validação em Tempo Real**: Feedback imediato nos formulários
- **Validação de Regras**: Limites de times e jogadores
- **Tratamento de Erros**: Mensagens amigáveis ao usuário

### Performance
- **CSS Otimizado**: Variáveis reutilizáveis e código eficiente
- **JavaScript Leve**: Sem dependências externas
- **Lazy Loading**: Carregamento otimizado de recursos

## 🐛 Troubleshooting

### Formulário Não Envia
- Verifique se todos os campos estão preenchidos
- Confirme se não há mensagens de erro
- Tente recarregar a página

### Responsividade Problemas
- Limpe o cache do navegador
- Verifique se está usando um navegador moderno
- Teste em diferentes tamanhos de tela

### Animações Não Funcionam
- Verifique se o JavaScript está habilitado
- Confirme se não há erros no console (F12)
- Tente recarregar a página

## 🚀 Melhorias Futuras

- [ ] **Timer Integrado**: Contador regressivo para cada rodada
- [ ] **Banco de Palavras**: Categorias diferentes de palavras
- [ ] **Placar Online**: Acompanhamento de pontuação em tempo real
- [ ] **Modos de Jogo**: Diferentes regras e desafios
- [ ] **Sons e Efeitos**: Áudio para melhor imersão
- [ ] **Dark Mode**: Tema escuro para jogar à noite
- [ ] **Multiplayer Online**: Jogar com amigos remotamente

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. **Faça um fork** do projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit suas mudanças** (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push para a branch** (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request`

### Diretrizes
- **Código Limpo**: Siga as convenções existentes
- **Responsividade**: Teste em diferentes dispositivos
- **Acessibilidade**: Inclua atributos ARIA quando necessário
- **Performance**: Mantenha o código otimizado

## 📝 Licença

Este projeto está sob licença MIT. Sinta-se à vontade para usar, modificar e distribuir.

## 📞 Suporte

Se tiver dúvidas ou precisar de ajuda:

- 📧 **Email**: contato@camimica.com
- 🐛 **Issues**: Abra uma issue no GitHub
- 📖 **Documentação**: Consulte este README detalhado

---

**Desenvolvido com ❤️ para momentos inesquecíveis de diversão!**

**CAMIMICA - Onde cada gesto conta uma história!** 🎭✨
