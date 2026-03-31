
const API_URL_BASE = window.location.origin || "http://127.0.0.1:5000";

const urlParam = new URLSearchParams(window.location.search)
const movieId = urlParam.get("id");

async function getMovieActors() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL_BASE}/api/getActors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ movieId })
        });
        if (response.ok) {
            const data = await response.json();
            console.log("displaying actors");
            displayActors(data);
        }
        else {
            console.error("An error occured fetching movie actors");
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
};
const actorBody = document.getElementById("actorBody");

function displayActors(details) {
    details.forEach(detail => {
        const actorBox = document.createElement("div");
        actorBox.classList.add("actorBox");

        actorBox.innerHTML = `
            <div>
                <div class="actor-pic" backgroundImg='url(/public/profile.png)' ></div>
                <h2><span class="actorName">${detail.actorName}</span></h2>
                <h3><span class="aliasName">${detail.aliasName}</span></h3>
                <h5>Role: <span class="actRole">${detail.actorRole}</span></h5>
                <h6>Screen Time: <span class="screenTime">${detail.playTime}</span></h6>
                <h4>WORDS</h4>
                <p class="words">${detail.actorWords}</p>
                <button class="edit-words" data-Id="${detail.actorId}">Edit words</button>
                <div class="stars" ${detail.stars}><i class="fa-solid fa-star" id="1"></i><i class="fa-solid fa-star" id="2"></i><i class="fa-solid fa-star" id="3"></i><i class="fa-solid fa-star" id="4"></i><i class="fa-solid fa-star" id="5"></i></div>
            </div>
        `;
        actorBody.appendChild(actorBox);
    })
    const buttons = actorBody.querySelectorAll(".edit-words");
    buttons.forEach(button => {
        button.onclick = (e) => {
            const actorId = e.target.dataset.id;
            if (!actorId) {
                console.error("Can not edit unknown actor.");
                console.log(actorId)
                return
            }
            displayEditModal(actorId);
        }
    });

};

const editModal = document.getElementById("editModal");
editModal.addEventListener("click", (e) => {
    if (e.target.id === "editModal") {
        editModal.style.display = "none"
    }
    else {
        return
    }
});

function displayEditModal(id) {
    editModal.style.display = "block";
    fillDetails(id);
}

const displayName = document.getElementById("displayedName");
const displayedWords = document.getElementById("displayedWords");

async function fillDetails(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL_BASE}/api/getActorWords`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });
        if (response.ok) {
            const details = await response.json()
            console.log("Fetching actor words.");
            displayName.textContent = details.actorName;
            displayedWords.value = details.actorWords;
            sessionStorage.setItem("actorId", id);
        }
        else {
            console.error("Error occured fetching words");
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
};

async function saveEdits() {
    const actorid = sessionStorage.getItem("actorId");
    const id = parseInt(actorid)
    const token = sessionStorage.getItem("token");
    const worrds = document.getElementById("displayedWords");
    const wordsValue = worrds.value;
    try {
        const response = await fetch(`${API_URL_BASE}/api/saveEdits`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id, words: wordsValue })
        });
        if (response.ok) {
            console.log("Edit made succesfully.");
            alert("Edits saved succesfully.");
            editModal.style.display = "none";

        }
        else {
            console.error("Error saving edits.");
            alert("Edits save failed.");
            return;
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
}

document.getElementById("saveEdit").addEventListener("click", (e) => {
    e.preventDefault();
    const actorWords = document.getElementById("displayedWords");
    const words = actorWords.value;
    if (!words) {
        alert("An actor can not have zero words.");
        return;
    }
    saveEdits();
})

async function findMovieName() {
    const token = sessionStorage.getItem("token");
    const mId = parseInt(sessionStorage.getItem("movieId"));

    if (!mId) {
        console.error("Invalid movie ID");
        return;
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/findMovieName`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ movieId: mId })
        });

        if (!response.ok) {
            console.error("Error occurred fetching movie name.");
            return;
        }

        const data = await response.json();
        const movieName = data?.results?.[0]?.title;

        if (movieName) {
            sessionStorage.setItem("movieName", movieName);
        } else {
            console.error("Movie name not found in response.");
        }

    } catch (error) {
        console.error("Network error", error);
        throw error;
    }
}

const actorName = document.getElementById("actorName");
const alias = document.getElementById("aliasName");
const actorRole = document.getElementById("actorRole");
const playTime = document.getElementById("playTime");
const wording = document.getElementById("actorWords");

async function saveNewActor() {
    const token = sessionStorage.getItem("token");
    const moviename = sessionStorage.getItem("movieName");

    const name = actorName.value.trim();
    const aliasname = alias.value.trim();
    const role = actorRole.value.trim();
    const playtime = playTime.value.trim();
    const words = wording.value.trim();

    if (![name, aliasname, role, playtime, words].every(Boolean)) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/addnewactor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                aliasname,
                moviename,
                role,
                playtime,
                words,
                movieId
            })
        });

        if (!response.ok) {
            console.error("Failed to add actor.");
            return;
        }

        alert("Actor successfully added.");
        actorModal.style.display = "none";

    } catch (error) {
        console.error("Network error", error);
        throw error;
    }
}

const actorModal = document.getElementById("actorsModal");
const modalContent = document.getElementById("modal-content");

document.getElementById("add-characters").addEventListener("click", (e) => {
    e.preventDefault();
    actorModal.style.display = "flex";
});

actorModal.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
        actorModal.style.display = "none";
    }
});

document.getElementById("addActor").addEventListener("click", (e) => {
    e.preventDefault();
    saveNewActor();
});



/*
async function findMovieName() {
    const token = sessionStorage.getItem("token")
    const mId = parseInt(sessionStorage.getItem("movieId"));
    if (!mId) {
        console.error("Invalid movie ID");
        return;
    }
    try {
        const response = await fetch(`${API_URL_BASE}/api/findMovieName`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ movieId: movieId })
        });
        if (response.ok) {
            const data = await response.json();
            const movieName = data.results[0].title;
            sessionStorage.setItem("movieName", movieName);
        }
        else {
            console.error("Error occured fetching movie name.")
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
};

const actorName = document.getElementById("actorName");
const alias = document.getElementById("aliasName");
const actorRole = document.getElementById("actorRole");
const playTime = document.getElementById("playTime");
const wording = document.getElementById("actorWords");

async function saveNewActor() {
    const token = sessionStorage.getItem("token");
    const moviename = sessionStorage.getItem("movieName");

    const name = actorName.value;
    const aliasname = alias.value;
    const role = actorRole.value;
    const playtime = playTime.value;
    const words = wording.value;

    if (!name || !aliasname || !role || !playtime || !words) {
        alert("Please fill in all fields.");
        return
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/addnewactor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, aliasname, moviename, role, playtime, words, movieId })
        })
        if (response.ok) {
            alert("Actor succesfully added.");
            actorModal.style.display = "none"
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
}

const actorModal = document.getElementById("actorsModal");
const modalContent = document.getElementById("modal-content");

document.getElementById("add-characters").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("actorsModal").style.display = "flex";
})

actorModal.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
        actorModal.style.display = "none";
    }
});

document.getElementById("addActor").addEventListener("click", (e) => {
    e.preventDefault();
    saveNewActor()
})
*/
document.addEventListener("DOMContentLoaded", async () => {
    await getMovieActors()
    await findMovieName()
})
