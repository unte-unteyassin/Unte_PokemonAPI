# Pokémon REST API + Frontend

A full-stack Pokémon CRUD application built with **Python Flask, SQLite, HTML, CSS, and JavaScript**.

The project consists of a REST API backend and a browser-based frontend that communicates with the API using the JavaScript **Fetch API**.

## Features

### Backend

* Get all Pokémon
* Get a single Pokémon by ID
* Create a Pokémon
* Update a Pokémon
* Delete a Pokémon
* Request validation
* `400 Bad Request` handling
* `404 Not Found` handling
* SQLite database

### Frontend

* Display all Pokémon
* View individual Pokémon
* Add new Pokémon
* Edit existing Pokémon
* Delete Pokémon
* Display API validation errors
* Handle missing Pokémon
* Loading state while retrieving data
* Uses JavaScript `fetch()` to communicate with the API

---

## Technologies Used

* Python
* Flask
* SQLite
* Flask-CORS
* HTML
* CSS
* JavaScript
* Fetch API
* Git
* GitHub

---

# Project Structure

```text
Unte_PokemonAPI/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

The `pokemon.db` database is created locally when the Flask application is started and is not included in the repository.

---

# Backend Setup

## 1. Clone the repository

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL
cd Unte_PokemonAPI
```

## 2. Create a virtual environment

On Windows:

```powershell
python -m venv venv
```

## 3. Activate the virtual environment

```powershell
venv\Scripts\activate
```

If PowerShell prevents activation because of its execution policy, the virtual environment can still be used directly:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 4. Install dependencies

```powershell
pip install -r requirements.txt
```

## 5. Start the Flask API

```powershell
python app.py
```

The API will run at:

```text
http://127.0.0.1:5000
```

---

# Frontend Setup

Open a **second terminal** while the Flask server is running.

Navigate to the frontend folder:

```powershell
cd frontend
```

Start the frontend using Python's built-in HTTP server:

```powershell
py -m http.server 5500
```

The frontend will be available at:

```text
http://127.0.0.1:5500
```

Keep both servers running while using the application.

### Backend

```text
http://127.0.0.1:5000
```

### Frontend

```text
http://127.0.0.1:5500
```

---

# API Endpoints

## GET `/pokemon`

Returns all Pokémon.

```text
GET http://127.0.0.1:5000/pokemon
```

Response:

```json
[
  {
    "id": 1,
    "name": "Bulbasaur",
    "type": "Grass/Poison",
    "hp": 52,
    "attack": 61,
    "defense": 55
  }
]
```

---

## GET `/pokemon/<id>`

Returns one Pokémon using its ID.

Example:

```text
GET http://127.0.0.1:5000/pokemon/1
```

If the Pokémon does not exist:

```json
{
  "error": "Pokemon not found"
}
```

Status:

```text
404 Not Found
```

---

## POST `/pokemon`

Creates a new Pokémon.

Example request:

```json
{
  "name": "Mimikyu",
  "type": "Ghost/Fairy",
  "hp": 55,
  "attack": 90,
  "defense": 80
}
```

Successful response:

```text
201 Created
```

---

## PUT `/pokemon/<id>`

Updates an existing Pokémon.

Example:

```text
PUT http://127.0.0.1:5000/pokemon/16
```

Request:

```json
{
  "name": "Mimikyu",
  "type": "Ghost/Fairy",
  "hp": 55,
  "attack": 100,
  "defense": 90
}
```

Successful response:

```text
200 OK
```

---

## DELETE `/pokemon/<id>`

Deletes a Pokémon.

Example:

```text
DELETE http://127.0.0.1:5000/pokemon/16
```

Successful response:

```text
200 OK
```

---

# Validation

The API requires the following fields when creating or updating a Pokémon:

```text
name
type
hp
attack
defense
```

The numeric fields must be integers and cannot be negative.

For example, leaving a required field empty can produce a `400 Bad Request` response such as:

```json
{
  "error": "Field cannot be empty: hp"
}
```

The frontend displays the validation message returned by the API.

---

# HTTP Status Codes

| Status Code       | Meaning                                      |
| ----------------- | -------------------------------------------- |
| `200 OK`          | Successful GET, PUT, or DELETE               |
| `201 Created`     | Pokémon successfully created                 |
| `400 Bad Request` | Invalid or missing request data              |
| `404 Not Found`   | Pokémon with the specified ID does not exist |

---

# Frontend CRUD Operations

The frontend communicates with the backend using JavaScript's `fetch()` function.

| Operation      | HTTP Method | Endpoint        |
| -------------- | ----------- | --------------- |
| List Pokémon   | GET         | `/pokemon`      |
| View Pokémon   | GET         | `/pokemon/<id>` |
| Add Pokémon    | POST        | `/pokemon`      |
| Edit Pokémon   | PUT         | `/pokemon/<id>` |
| Delete Pokémon | DELETE      | `/pokemon/<id>` |

---

# Running the Complete Application

### Terminal 1 — Backend

```powershell
.\venv\Scripts\python.exe app.py
```

The API runs at:

```text
http://127.0.0.1:5000
```

### Terminal 2 — Frontend

```powershell
cd frontend
py -m http.server 5500
```

The frontend runs at:

```text
http://127.0.0.1:5500
```

Open the frontend URL in a browser.

---

# Testing

The application was tested locally for:

* GET all Pokémon
* GET a single Pokémon
* POST a new Pokémon
* PUT/update a Pokémon
* DELETE a Pokémon
* `400 Bad Request` validation
* `404 Not Found`
* Frontend loading state
* Frontend error handling

---\

## Author

**Unte, Yassin L.**
