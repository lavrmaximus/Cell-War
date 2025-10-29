from flask import Flask
from flask_cors import CORS
from app.api.game_routes import game_api_blueprint

app = Flask(__name__)
# Настраиваем CORS для всех доменов и маршрутов
CORS(app)

# Регистрируем Blueprint
app.register_blueprint(game_api_blueprint)

@app.route('/')
def index():
    return "Hello, Cell War Backend is running!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
