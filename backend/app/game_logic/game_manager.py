import uuid
import random
from typing import Dict, Any
from app.models.game import GameState, Player, Cell

# Временное хранилище игр в памяти
games: Dict[str, GameState] = {}

def create_new_game(map_options: Dict[str, Any] = {}) -> GameState:
    """Создает новую игру, инициализирует состояние и сохраняет ее."""
    game_id = str(uuid.uuid4())
    game = GameState()
    game.game_status = 'active'

    # Создаем двух игроков
    player1 = Player(id="player1", name="Player 1", color="blue")
    player2 = Player(id="player2", name="Player 2", color="red")
    game.players = {player1.id: player1, player2.id: player2}
    game.current_player_id = player1.id

    # --- Логика создания карты ---
    map_type = map_options.get('type', 'standard')
    map_data = map_options.get('data')

    if map_data:
        # Загрузка карты из данных редактора
        game.cells = [[Cell(**cell_data) for cell_data in row] for row in map_data]
        grid_size = len(game.cells)
    else:
        grid_size = 30 if map_type == 'large' else 20
        game.cells = [[Cell(x, y) for y in range(grid_size)] for x in range(grid_size)]

        if map_type != 'empty': # 'empty' - пустая карта
            # Генерируем горы
            for _ in range(int(grid_size * 0.75)):
                x, y = random.randint(0, grid_size - 1), random.randint(0, grid_size - 1)
                game.cells[x][y].type = 'mountain'

            # Генерируем реку
            river_y = random.randint(5, grid_size - 6)
            for x in range(grid_size):
                if game.cells[x][river_y].type == 'plain':
                    game.cells[x][river_y].type = 'water'
                if random.random() > 0.7:
                    river_y += random.choice([-1, 1])
                    river_y = max(0, min(grid_size - 1, river_y))

    # Устанавливаем стартовые позиции игроков (3x3) (если карта не кастомная)
    if not map_data:
        # Player 1 start area
        for i in range(3):
            for j in range(3):
                px, py = 1 + i, 1 + j
                game.cells[px][py].owner_id = player1.id
                game.cells[px][py].type = 'plain' # Очищаем местность

        # Player 2 start area
        for i in range(3):
            for j in range(3):
                px, py = (grid_size - 4) + i, (grid_size - 4) + j
                game.cells[px][py].owner_id = player2.id
                game.cells[px][py].type = 'plain' # Очищаем местность

    games[game_id] = game
    return game_id, game

def get_game_state(game_id: str) -> GameState | None:
    """Возвращает состояние игры по ее ID."""
    return games.get(game_id)

def end_turn(game_id: str) -> GameState | None:
    """Завершает ход текущего игрока и передает его следующему."""
    game = get_game_state(game_id)
    if not game:
        return None

    # Рассчитываем доход для текущего игрока перед завершением хода
    current_player = game.players[game.current_player_id]
    farm_count = sum(1 for row in game.cells for cell in row if cell.owner_id == current_player.id and cell.building == 'farm')
    income = farm_count # Доход от ферм по правилам
    current_player.gold += income

    # Передаем ход следующему игроку
    player_ids = list(game.players.keys())
    current_index = player_ids.index(game.current_player_id)
    next_index = (current_index + 1) % len(player_ids)
    game.current_player_id = player_ids[next_index]

    # Увеличиваем номер хода, если круг прошел
    if next_index == 0:
        game.turn_number += 1

    return game

def is_adjacent(game: GameState, x: int, y: int, player_id: str) -> bool:
    """Проверяет, является ли ячейка (x, y) соседней с территорией игрока."""
    grid_size = len(game.cells)
    for dx in [-1, 0, 1]:
        for dy in [-1, 0, 1]:
            if dx == 0 and dy == 0:
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < grid_size and 0 <= ny < grid_size:
                if game.cells[nx][ny].owner_id == player_id:
                    return True
    return False

def perform_action(game_id: str, action_data: dict) -> GameState | None:
    """Обрабатывает действие игрока."""
    game = get_game_state(game_id)
    if not game:
        return None

    action_type = action_data.get('type')
    player_id = action_data.get('playerId')
    
    if player_id != game.current_player_id:
        return game # Не ход этого игрока

    player = game.players[player_id]
    cell_coords = action_data.get('cell')
    if not cell_coords:
        return game
        
    x, y = cell_coords['x'], cell_coords['y']
    cell = game.cells[x][y]

    if action_type == 'CAPTURE':
        # 1. Проверка на непроходимость
        if cell.type in ['mountain', 'water']:
            return game # Нельзя захватывать

        # 2. Проверка на соседство (кроме самого первого хода, когда у игрока может не быть клеток)
        player_cell_count = sum(1 for row in game.cells for c in row if c.owner_id == player_id)
        if player_cell_count > 0 and not is_adjacent(game, x, y, player_id):
            return game # Не соседняя клетка

        # 3. Расчет стоимости
        cost = 1 # Базовая стоимость для нейтральной клетки
        if cell.owner_id and cell.owner_id != player_id:
            cost += cell.defense # + защита для вражеской
        if cell.type == 'hill':
            cost += 1 # +1 за холм

        # 4. Проверка золота и выполнение захвата
        if player.gold >= cost and cell.owner_id != player_id:
            player.gold -= cost
            cell.owner_id = player_id

    elif action_type == 'BUILD_FARM':
        # Логика постройки фермы по правилам
        farm_count = sum(1 for row in game.cells for c in row if c.owner_id == player_id and c.building == 'farm')
        cost = (farm_count // 10) + 1
        
        if cell.owner_id == player_id and not cell.building and player.gold >= cost:
            player.gold -= cost
            cell.building = 'farm'

    elif action_type == 'UPGRADE_DEFENSE':
        # Логика улучшения защиты по правилам
        amount = action_data.get('amount', 1) # Фронтенд должен присылать 'amount'
        if not (1 <= amount <= 9):
            amount = 1 # Ограничение

        if cell.owner_id == player_id and not cell.building and player.gold >= amount:
            player.gold -= amount
            cell.defense += amount

    return game
