const API_URL = "http://127.0.0.1:5000";

const pokemonList = document.getElementById("pokemonList");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const statusBox = document.getElementById("status");
const pokemonForm = document.getElementById("pokemonForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const editingId = document.getElementById("editingId");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const detailForm = document.getElementById("detailForm");
const detailResult = document.getElementById("detailResult");

function showStatus(message, type = "success") {
    statusBox.textContent = message;
    statusBox.className = `status ${type}`;
}

function clearStatus() {
    statusBox.textContent = "";
    statusBox.className = "status";
}

async function getErrorMessage(response) {
    try {
        const data = await response.json();
        return data.error || `Request failed with status ${response.status}.`;
    } catch {
        return `Request failed with status ${response.status}.`;
    }
}

async function loadPokemon() {
    loading.classList.remove("hidden");
    pokemonList.innerHTML = "";
    emptyState.classList.add("hidden");
    clearStatus();

    try {
        const response = await fetch(`${API_URL}/pokemon`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const pokemon = await response.json();

        if (pokemon.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }

        pokemonList.innerHTML = pokemon.map(createPokemonCard).join("");
    } catch (error) {
        showStatus(`Could not load Pokémon: ${error.message}`, "error");
    } finally {
        loading.classList.add("hidden");
    }
}

function createPokemonCard(pokemon) {
    return `
        <article class="pokemon-card">
            <p class="pokemon-id">#${pokemon.id}</p>
            <h3>${escapeHtml(pokemon.name)}</h3>
            <span class="type-badge">${escapeHtml(pokemon.type)}</span>

            <div class="stats">
                <div class="stat"><strong>${pokemon.hp}</strong><span>HP</span></div>
                <div class="stat"><strong>${pokemon.attack}</strong><span>ATTACK</span></div>
                <div class="stat"><strong>${pokemon.defense}</strong><span>DEFENSE</span></div>
            </div>

            <div class="card-actions">
                <button class="secondary-btn" type="button" onclick="viewPokemon(${pokemon.id})">View</button>
                <button class="secondary-btn" type="button" onclick="startEdit(${pokemon.id})">Edit</button>
                <button class="danger-btn" type="button" onclick="deletePokemon(${pokemon.id})">Delete</button>
            </div>
        </article>
    `;
}

async function viewPokemon(id) {
    detailResult.textContent = "Loading...";
    detailResult.className = "detail-card muted";

    try {
        const response = await fetch(`${API_URL}/pokemon/${id}`);

        if (response.status === 404) {
            const message = await getErrorMessage(response);
            detailResult.textContent = message;
            showStatus(message, "error");
            return;
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const pokemon = await response.json();

        detailResult.className = "detail-card";
        detailResult.innerHTML = `
            <p class="pokemon-id">#${pokemon.id}</p>
            <h3>${escapeHtml(pokemon.name)}</h3>
            <span class="type-badge">${escapeHtml(pokemon.type)}</span>
            <div class="detail-stats">
                <span>HP: <strong>${pokemon.hp}</strong></span>
                <span>Attack: <strong>${pokemon.attack}</strong></span>
                <span>Defense: <strong>${pokemon.defense}</strong></span>
            </div>
        `;
        clearStatus();
    } catch (error) {
        detailResult.textContent = error.message;
        showStatus(`Could not load Pokémon: ${error.message}`, "error");
    }
}

detailForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("detailId").value;
    if (id) viewPokemon(id);
});

async function startEdit(id) {
    try {
        const response = await fetch(`${API_URL}/pokemon/${id}`);

        if (response.status === 404) {
            showStatus(await getErrorMessage(response), "error");
            return;
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const pokemon = await response.json();

        editingId.value = pokemon.id;
        document.getElementById("name").value = pokemon.name;
        document.getElementById("type").value = pokemon.type;
        document.getElementById("hp").value = pokemon.hp;
        document.getElementById("attack").value = pokemon.attack;
        document.getElementById("defense").value = pokemon.defense;

        formTitle.textContent = `Edit Pokémon #${pokemon.id}`;
        submitBtn.textContent = "Save Changes";
        cancelEditBtn.classList.remove("hidden");

        document.getElementById("name").focus();
        window.scrollTo({ top: document.getElementById("pokemonForm").offsetTop - 80, behavior: "smooth" });
    } catch (error) {
        showStatus(`Could not load Pokémon for editing: ${error.message}`, "error");
    }
}

pokemonForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    const id = editingId.value;
    const payload = {
        name: document.getElementById("name").value,
        type: document.getElementById("type").value,
        hp: Number(document.getElementById("hp").value),
        attack: Number(document.getElementById("attack").value),
        defense: Number(document.getElementById("defense").value)
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/pokemon/${id}` : `${API_URL}/pokemon`;

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = id ? "Saving..." : "Adding...";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const saved = await response.json();
        showStatus(
            id
                ? `${saved.name} was updated successfully.`
                : `${saved.name} was added successfully.`,
            "success"
        );

        resetForm();
        await loadPokemon();
    } catch (error) {
        showStatus(error.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId.value ? "Save Changes" : "Add Pokémon";
    }
});

async function deletePokemon(id) {
    if (!confirm(`Delete Pokémon #${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/pokemon/${id}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            showStatus(await getErrorMessage(response), "error");
            return;
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const result = await response.json();
        showStatus(result.message, "success");

        if (editingId.value === String(id)) {
            resetForm();
        }

        await loadPokemon();
    } catch (error) {
        showStatus(`Could not delete Pokémon: ${error.message}`, "error");
    }
}

cancelEditBtn.addEventListener("click", resetForm);
document.getElementById("refreshBtn").addEventListener("click", loadPokemon);

function resetForm() {
    pokemonForm.reset();
    editingId.value = "";
    formTitle.textContent = "Add Pokémon";
    submitBtn.textContent = "Add Pokémon";
    cancelEditBtn.classList.add("hidden");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadPokemon();
