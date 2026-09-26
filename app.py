from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "pokemon.db"

# DATABASE

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS pokemon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            hp INTEGER NOT NULL,
            attack INTEGER NOT NULL,
            defense INTEGER NOT NULL
        )
    """)
    count = conn.execute(
        "SELECT COUNT(*) FROM pokemon"
    ).fetchone()[0]

    if count == 0:

        pokemon_data = [
            ("Bulbasaur", "Grass/Poison", 52, 61, 55),
            ("Charmander", "Fire", 42, 58, 39),
            ("Squirtle", "Water", 48, 51, 68),
            ("Pikachu", "Electric", 38, 63, 42),
            ("Jigglypuff", "Normal/Fairy", 108, 48, 25),
            ("Meowth", "Normal", 43, 52, 37),
            ("Psyduck", "Water", 54, 57, 50),
            ("Growlithe", "Fire", 61, 76, 48),
            ("Magnemite", "Electric/Steel", 31, 41, 76),
            ("Gastly", "Ghost/Poison", 36, 43, 34),
            ("Eevee", "Normal", 58, 59, 53),
            ("Dratini", "Dragon", 46, 69, 49),
            ("Snorlax", "Normal", 155, 116, 72),
            ("Gengar", "Ghost/Poison", 65, 72, 66),
            ("Lucario", "Fighting/Steel", 76, 118, 78)
        ]

        conn.executemany("""
            INSERT INTO pokemon
            (name, type, hp, attack, defense)
            VALUES (?, ?, ?, ?, ?)
        """, pokemon_data)

    conn.commit()
    conn.close()

# HELPER FUNCTIONS

def pokemon_to_dict(pokemon):
    return {
        "id": pokemon["id"],
        "name": pokemon["name"],
        "type": pokemon["type"],
        "hp": pokemon["hp"],
        "attack": pokemon["attack"],
        "defense": pokemon["defense"]
    }


def validate_pokemon(data):

    if not isinstance(data, dict):
        return "Request body must be a JSON object"

    required_fields = [
        "name",
        "type",
        "hp",
        "attack",
        "defense"
    ]
    for field in required_fields:

        if field not in data:
            return f"Missing required field: {field}"

        if data[field] is None:
            return f"Field cannot be empty: {field}"

        if isinstance(data[field], str) and not data[field].strip():
            return f"Field cannot be empty: {field}"

    numeric_fields = [
        "hp",
        "attack",
        "defense"
    ]

    for field in numeric_fields:

        if type(data[field]) is not int:
            return f"{field} must be an integer"

        if data[field] < 0:
            return f"{field} cannot be negative"

    return None


# HOME

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "name": "Pokemon REST API",
        "description": "A Flask and SQLite REST API for handcrafted Pokemon data.",
        "endpoints": {
            "GET all Pokemon": "GET /pokemon",
            "GET one Pokemon": "GET /pokemon/<id>",
            "Create Pokemon": "POST /pokemon",
            "Update Pokemon": "PUT /pokemon/<id>",
            "Delete Pokemon": "DELETE /pokemon/<id>"
        }
    }), 200


# GET /pokemon
# Get all Pokémon

@app.route("/pokemon", methods=["GET"])
def get_pokemon():

    conn = get_db()

    pokemon = conn.execute(
        "SELECT * FROM pokemon ORDER BY id"
    ).fetchall()

    conn.close()

    return jsonify([
        pokemon_to_dict(item)
        for item in pokemon
    ]), 200


# GET /pokemon/<id>
# Get one Pokemon

@app.route("/pokemon/<int:pokemon_id>", methods=["GET"])
def get_single_pokemon(pokemon_id):

    conn = get_db()

    pokemon = conn.execute(
        "SELECT * FROM pokemon WHERE id = ?",
        (pokemon_id,)
    ).fetchone()

    conn.close()

    if pokemon is None:

        return jsonify({
            "error": "Pokemon not found"
        }), 404

    return jsonify(
        pokemon_to_dict(pokemon)
    ), 200


# POST /pokemon
# Create a new Pokemon

@app.route("/pokemon", methods=["POST"])
def create_pokemon():

    data = request.get_json(silent=True)

    if data is None:

        return jsonify({
            "error": "Request body must contain JSON data"
        }), 400

    error = validate_pokemon(data)

    if error:

        return jsonify({
            "error": error
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO pokemon
        (name, type, hp, attack, defense)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["name"].strip(),
        data["type"].strip(),
        data["hp"],
        data["attack"],
        data["defense"]
    ))

    conn.commit()

    new_id = cursor.lastrowid

    pokemon = conn.execute(
        "SELECT * FROM pokemon WHERE id = ?",
        (new_id,)
    ).fetchone()

    conn.close()

    return jsonify(
        pokemon_to_dict(pokemon)
    ), 201


# PUT /pokemon/<id>
# Update an existing Pokémon

@app.route("/pokemon/<int:pokemon_id>", methods=["PUT"])
def update_pokemon(pokemon_id):

    data = request.get_json(silent=True)

    if data is None:

        return jsonify({
            "error": "Request body must contain JSON data"
        }), 400

    error = validate_pokemon(data)

    if error:

        return jsonify({
            "error": error
        }), 400

    conn = get_db()

    existing = conn.execute(
        "SELECT * FROM pokemon WHERE id = ?",
        (pokemon_id,)
    ).fetchone()

    if existing is None:

        conn.close()

        return jsonify({
            "error": "Pokemon not found"
        }), 404

    # update the Pokemon
    conn.execute("""
        UPDATE pokemon
        SET name = ?,
            type = ?,
            hp = ?,
            attack = ?,
            defense = ?
        WHERE id = ?
    """, (
        data["name"].strip(),
        data["type"].strip(),
        data["hp"],
        data["attack"],
        data["defense"],
        pokemon_id
    ))

    conn.commit()

    updated = conn.execute(
        "SELECT * FROM pokemon WHERE id = ?",
        (pokemon_id,)
    ).fetchone()

    conn.close()

    return jsonify(
        pokemon_to_dict(updated)
    ), 200


# DELETE /pokemon/<id>
# Delete a Pokémon

@app.route("/pokemon/<int:pokemon_id>", methods=["DELETE"])
def delete_pokemon(pokemon_id):

    conn = get_db()

    existing = conn.execute(
        "SELECT * FROM pokemon WHERE id = ?",
        (pokemon_id,)
    ).fetchone()

    if existing is None:

        conn.close()

        return jsonify({
            "error": "Pokemon not found"
        }), 404

    conn.execute(
        "DELETE FROM pokemon WHERE id = ?",
        (pokemon_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": f"Pokemon with id {pokemon_id} deleted successfully"
    }), 200


# START SERVER

if __name__ == "__main__":

    init_db()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )