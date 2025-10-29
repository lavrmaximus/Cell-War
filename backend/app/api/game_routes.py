from flask import Blueprint, jsonify, request
from app.game_logic import game_manager

# Создаем Blueprint для игровых маршрутов
game_api_blueprint = Blueprint('game_api', __name__)

@game_api_blueprint.route('/api/game', methods=['POST'])
def create_game():
    """Создает новую игру."""
    map_options = request.get_json() or {}
    game_id, new_game = game_manager.create_new_game(map_options)
    response_data = new_game.to_dict()
    response_data['gameId'] = game_id # Добавляем ID игры в ответ
    return jsonify(response_data), 201

@game_api_blueprint.route('/api/game/<game_id>', methods=['GET'])
def get_game(game_id: str):
    """Получает состояние игры по ID."""
    game = game_manager.get_game_state(game_id)
    if game:
        return jsonify(game.to_dict())
    return jsonify({"error": "Game not found"}), 404

@game_api_blueprint.route('/api/game/<game_id>/end_turn', methods=['POST'])
def end_player_turn(game_id: str):
    """Завершает ход текущего игрока."""
    game = game_manager.end_turn(game_id)
    if game:
        return jsonify(game.to_dict())
    return jsonify({"error": "Game not found"}), 404

@game_api_blueprint.route('/api/game/<game_id>/action', methods=['POST'])
def handle_action(game_id: str):
    """Обрабатывает действие игрока."""
    action_data = request.get_json()
    if not action_data:
        return jsonify({"error": "Invalid action data"}), 400

    game = game_manager.perform_action(game_id, action_data)
    if game:
        return jsonify(game.to_dict())
    return jsonify({"error": "Game not found"}), 404
