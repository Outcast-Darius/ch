
const API_URLL = 'http://localhost:5000' || "http://127.0.0.1:5000";

const urlParam = new URLSearchParams(window.location.search);
const movieId = urlParam.get("id");

async function getMovieDetails() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URLL}/api/getMovieDetails`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ movieId })
        });
        if (response.ok) {
            const data = await response.json();
            console.log("fetching movie details...")
            displayMovieEdits(data);
            sessionStorage.setItem("movieId", movieId)
        }
        else {
            console.error("Error fecthing movie details.")
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
}

const mname = document.getElementById("moviename");
const director = document.getElementById("director");
const producer = document.getElementById("producer");
const runtime = document.getElementById("runtime");
const topic = document.getElementById("topic");
const age = document.getElementById("ageRating");
const release = document.getElementById("releasedate")

function displayMovieEdits(details) {
    mname.value = details.title || "OUTCAST";
    director.value = details.director || "OUTCAST";
    producer.value = details.producer || "OUTCAST";
    runtime.value = details.runtime || "0000HRS";
    topic.value = details.topic || "GENERAL";
    age.value = details.age || "PG";
    release.value = "2026-11-29"
}

function validateMovieEdit(releasedate, moviename, director, producer, topic, age, runtime) {
    if (!releasedate || !moviename || !director || !producer || !topic || !age || !runtime) {
        console.error("All field are required.");
        return false
    }
    return true;
}

async function saveMovieEdits() {
    const token = sessionStorage.getItem("token");
    const movie_id = sessionStorage.getItem("movieId")
    const movieId = parseInt(movie_id);
    const releasedate = document.getElementById("releasedate").value;
    const moviename = document.getElementById("moviename").value;
    const director = document.getElementById("director").value;
    const producer = document.getElementById("producer").value;
    const topic = document.getElementById("topic").value;
    const age = document.getElementById("ageRating").value;
    const runtime = document.getElementById("runtime").value;

    if (!(validateMovieEdit(releasedate, moviename, director, producer, topic, age, runtime))) {
        alert("Please Fill in all fields.");
        return;
    }
    try {
        const response = await fetch(`${API_URLL}/api/saveMovieEdits`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ releasedate, moviename, director, producer, topic, age, runtime, movieId })
        });
        if (response.ok) {
            console.log("Movie edits succesfully saved.");
            alert("Movie edits succesfully saved.");
            window.location.href = "dashboard.html";
        }
        else {
            console.error("Error saving movie edits.");
            alert("Error saving movie edits.");
        }
    }
    catch (error) {
        console.error("Network Error ", error);
        throw error;
    }
}

document.getElementById("saveEdits").addEventListener("click", (e) => {
    e.preventDefault();
    saveMovieEdits();
})

document.addEventListener("DOMContentLoaded", () => {
    getMovieDetails();
})
