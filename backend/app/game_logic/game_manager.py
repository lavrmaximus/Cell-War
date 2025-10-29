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

    # Устанавливаем стартовые позиции игроков (если карта не кастомная)
    if not map_data:
        game.cells[2][2].owner_id = player1.id
        game.cells[2][2].defense = 10
        game.cells[grid_size - 3][grid_size - 3].owner_id = player2.id
        game.cells[grid_size - 3][grid_size - 3].defense = 10

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
    income = 10 # Базовый доход
    farm_count = sum(1 for row in game.cells for cell in row if cell.owner_id == current_player.id and cell.building == 'farm')
    income += farm_count * 5 # Доход от ферм
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

def perform_action(game_id: str, action_data: dict) -> GameState | None:
    """Обрабатывает действие игрока."""
    game = get_game_state(game_id)
    if not game:
        return None

    action_type = action_data.get('type')
    player_id = action_data.get('playerId')
    
    if player_id != game.current_player_id:
        return game

    player = game.players[player_id]
    cell_coords = action_data.get('cell')
    if not cell_coords:
        return game
        
    x, y = cell_coords['x'], cell_coords['y']
    cell = game.cells[x][y]

    if action_type == 'CAPTURE':
        # Логика захвата
        if player.gold >= 10 and cell.owner_id != player_id:
            player.gold -= 10
            cell.owner_id = player_id

    elif action_type == 'BUILD_FARM':
        # Логика постройки фермы
        if cell.owner_id == player_id and not cell.building and player.gold >= 25:
            player.gold -= 25
            cell.building = 'farm'

    elif action_type == 'UPGRADE_DEFENSE':
        # Логика улучшения защиты
        if cell.owner_id == player_id and player.gold >= 15:
            player.gold -= 15
            cell.defense += 5

    return game
