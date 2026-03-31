// auth.js
const API_BASE = window.location.origin;

async function checkAuth() {
    const token = sessionStorage.getItem("token");

    // Select elements once to avoid repetitive document.getElementById calls
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("LogoutBtn");
    const profileDiv = document.getElementById("profile");
    const profileGif = document.getElementById("profileGif");

    if (!token) {
        handleLogoutUI();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const profileData = await response.json();

            // Update UI - checking if elements exist before setting values
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "block";

            // Set Profile Photos
            const photoUrl = profileData.profilePhoto ? profileData.profilePhoto : "/profile.png";
            const pro = document.getElementById("profile");
            pro.style.display = "block";
            document.getElementsByClassName("profile")[0].style.backgroundImage = `url('${photoUrl}') || url('profile.png')`;
            if (profileGif) profileGif.style.backgroundImage = `url('${photoUrl}')`;
            if (profileDiv) {
                profileDiv.style.display = "block";
                profileDiv.style.backgroundImage = `url('${photoUrl}')`;
            }

            // Update other profile-specific fields if they exist on the page
            updateTextContent("userName", profileData.username);
            updateTextContent("level", profileData.level);
            // ... add others as needed

        } else {
            handleLogoutUI();
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        handleLogoutUI();
    }
}

function updateTextContent(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
}

function handleLogoutUI() {
    // Hide profile/logout, show login
    const elementsToHide = ["profile", "LogoutBtn", "askbtn"];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.style.display = "block";
}


document.addEventListener("DOMContentLoaded",()=>{
    checkAuth();
});
// Add event listener for profile photo for easy redirection to profile page
const profilelink = document.getElementById("profile");
if (profilelink) {
    profilelink.addEventListener("click", () => {
        window.location.href = `${window.location.origin}/profile.html`;
    });
};