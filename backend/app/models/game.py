from typing import Dict, Tuple, List

# Пока это просто заглушки, в будущем они будут содержать больше логики и полей

class Player:
    def __init__(self, id: str, name: str, color: str):
        self.id = id
        self.name = name
        self.color = color
        self.gold = 10  # Начальное золото
        self.income = 0 # Начальный доход

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "gold": self.gold,
            "income": self.income,
        }

class Cell:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
        self.owner_id: str | None = None
        self.type = 'plain' # 'plain', 'mountain', 'water', etc.
        self.building: str | None = None # 'farm', etc.
        self.defense = 0

    def to_dict(self):
        return {
            "x": self.x,
            "y": self.y,
            "ownerId": self.owner_id,
            "type": self.type,
            "building": self.building,
            "defense": self.defense,
        }

class GameState:
    def __init__(self):
        self.players: Dict[str, Player] = {}
        self.cells: List[List[Cell]] = []
        self.current_player_id: str | None = None
        self.turn_number = 0
        self.game_status = 'waiting' # 'waiting', 'active', 'finished'

    def to_dict(self):
        return {
            "players": {p_id: p.to_dict() for p_id, p in self.players.items()},
            "cells": [[cell.to_dict() for cell in row] for row in self.cells],
            "currentPlayerId": self.current_player_id,
            "turnNumber": self.turn_number,
            "gameStatus": self.game_status,
        }
