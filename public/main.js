

// animation scroll and carousel position
let slideIndex = 1;
let slideTimer;

function startTimer() {
    slideTimer = setInterval(function () {
        slidePlus(1)
    }, 3000)
}
function slidePlus(n) {
    showSlides(slideIndex += n);
}

//shows the position of current slide whenever carousel button is clicked
function currentSlide(n) {
    clearInterval(slideTimer)
    showSlides(slideIndex = n);
    startTimer()
}

//slides the images accross the screen
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slides");
    let carousel = document.getElementsByClassName("carousel");

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < carousel.length; i++) {
        carousel[i].className = carousel[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";
    carousel[slideIndex - 1].className += " active";
}

// grabbing of all required id's and classes
const loginEmail = document.getElementById("LoginEmail");
const loginPassword = document.getElementById("LoginPassword");

const successDialoge = document.getElementById("successDialoge");
const passwordStrength = document.getElementById("passwordStrength");
const passwordMatch = document.getElementById("passwordMatch");

const responseTag = document.getElementById("response");
const adminTag = document.getElementById("dashboard");
const eventPoster = document.getElementById("eventPoster");
const eventUser = document.getElementById("user");
const eventPhone = document.getElementById("phonenumber");
const eventVenue = document.getElementById("eVenue");
const eventDate = document.getElementById("eDate");
const eventType = document.getElementById("eType");
const eventCategory = document.getElementById("eCategory");
const eventDescription = document.getElementById("eDescription");
const HireBtn = document.getElementById("bookingBtn");
const upcomingTitle = document.getElementById("eventTitle");
const upcomingDate = document.getElementById("eventTime");
const upcomingVenue = document.getElementById("eventVenue");
const applicationName = document.getElementById("fullName");
const applicationEmail = document.getElementById("applicationEmail");
const applicationPhone = document.getElementById("applicationPhone");
const applicationExperience = document.getElementById("applicationExperience");
const applicationRole = document.getElementById("applicationRole");
const submitBtn = document.getElementById("submitBtn");
const askBtn = document.getElementById("askbtn");
const askForm = document.getElementById("askform");
const applicationPhoto = document.getElementById("photo");
const logoutBtn = document.getElementById("LogOutBtn");
const requestSent = document.getElementById("joinRequests");
const userLevel = document.getElementById("level");
const userRole = document.getElementById("role");
const dateJoined = document.getElementById("dateJoined");
const profileName = document.getElementById("userName");
const profileGif = document.getElementById("profileGif");
const moreBtn = document.getElementById("moreMovies");
const adminBody = document.getElementById("adminsBody");
const memmbersBody = document.getElementById("membersBody");
const usersBody = document.getElementById("usersBody");
const movieBody = document.getElementById("movieBody");
const postPhoto = document.getElementById("postPhoto");
const postDate = document.getElementById("epostDate");
const postTime = document.getElementById("etime");
const postTitle = document.getElementById("eTitle");
const postVenue = document.getElementById("eVenue");
const postBtn = document.getElementById("postBtn");
const profileSign = document.getElementsByClassName("profile");
const userPassword = document.getElementById("password1");
const admindash=document.getElementById("admindash");
const moviesContainer = document.getElementsByClassName("movie");
const notificationContainer = document.getElementsByClassName("notificationContainer");
const notificationWrapper = document.getElementsByClassName("notificationWrapper");
const pendingSection = document.getElementsByClassName("pendingSection");
const approvedSection = document.getElementsByClassName("approvedSection");
const settledSection = document.getElementsByClassName("settledSection");
const recents = document.getElementsByClassName("recents");
const cultureFilms = document.getElementsByClassName("cultureFilms");
const educationFilms = document.getElementsByClassName("educationFilms");
const politicsFilms = document.getElementsByClassName("politicsFilms");
const relationships = document.getElementsByClassName("relationshipsFilms");
const parentingFilms = document.getElementsByClassName("parentingFilms");
const handoverFilms = document.getElementsByClassName("handoversFilms");
const ReceivedRequests = document.getElementsByClassName("joinRequests");
const requestTag = document.getElementById("request");
const complaints = document.getElementsByClassName("complaints");
const complements = document.getElementsByClassName("complements");
const suggestion = document.getElementsByClassName("suggestions");
const growth = document.getElementsByClassName("growth");
const posting = document.getElementsByClassName("post");
const moviePosting = document.getElementsByClassName("moviePost");

const API_BASE_URL = window.location.origin

//function to validate email ensuring the email id of correct type
function validateEmailAndPassword(email, password) {
    if (!email || !password) {

        return { valid: false, message: "⚠️ All fields are required" }
    }
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
        return { valid: false, message: "⚠️ INVALID EMAIL FORMAT" };
    }

    if (password.length < 6) {
        return { valid: false, message: "⚠️ PASSWORD MUST BE ATLEAST 6 CHARACTERS" }
    }

    return { valid: true };
};

//helper function
function showError(msg) {
    const errorbody = document.getElementById("errorbody");
    errorbody.style.display = "block";
    errorbody.innerHTML = msg;
    console.warn(msg);
}

//login api
async function signIn(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/getUser`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({ email, password }),

        });
        return await response.json();
        if (!response.ok) {
            const errortext = await response.text();
            throw new Error(`SERVER ERROR:${response.status}-${errortext}`)
        }

        const result = await signIn(email, password);

        if (result.success) {
            // You MUST save the token you just received
            sessionStorage.setItem("token", result.token);
            console.log("Login successful, token saved!");
        }
        const data = await response.json();
        return {
            success: response.ok,
            data: data,
            status: response.status
        }

    }
    catch (error) {
        console.error("Network error ", error);
        return { success: false, message: "Network connection failed" }
    }
}

//account creation api
async function register(username, email, phone, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/registerUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, phone, password })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SERVER ERROR: ${response.status}-${errorText}`);
        }

        const data = await response.json();
        return {
            success: response.ok,
            data: data,
            status: response.status
        };

    }
    catch (error) {
        console.error("Network Error ", error);
        return { success: false, message: "Network connection failed" };
    }
}

//function for disabling button during log in
function toggleLoading(isLoading) {
    signInBtn.disabled = isLoading;
    signInBtn.innerHTML = isLoading ? "Authenticating.." : "Sign In";
}
const signInBtn = document.getElementById("signInbtn");
const mybtn = document.getElementById("signInbtn");

async function checkAuth() {
    const token = sessionStorage.getItem("token");
    const userdetails=atob(token.split(".")[1]);
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "AUTHORIZATION": `Bearer ${token}`
                }
            })
            if (response.ok) {
                const profileData = await response.json();
                dateJoined.textContent = `Date Joined: ${profileData.dateJoined}`;
                userRole.textContent = `Role: ${profileData.role}`;
                userLevel.textContent = `Level: ${profileData.level}`;
                userName.textContent = profileData.username;

                if (logInBtn) logInBtn.style.display = "none";
                if (profileSign) profileSign.style.display = "block";
                if(userdetails.role==="admin"){
                adminBody.style.display="block";
                }
            } else {
                console.error("Failed to fetch profile data");
            }
        }
        catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }

};

//sign in button to call the api
if (mybtn) {
    mybtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const errorbody = document.getElementById("errorbody");
        const userEmail = loginEmail.value.trim()
        const userPassword = loginPassword.value.trim()
        const validate = validateEmailAndPassword(userEmail, userPassword);
        if (!validate.valid) {
            errorbody.style.display = "block";
            errorbody.innerHTML = validate.message;
            console.warn(validate.message)
        }
        else {
            errorbody.style.display = "none";
            console.log("Proceed to login");

            toggleLoading(true);
            const result = await signIn(userEmail, userPassword);
            if (result.success) {
                sessionStorage.setItem("token", result.token);
                //checkAuth();
                window.location.href = "profile.html";
                checkAuth();
            }
            else {
                toggleLoading(false);
                errorbody.style.display = "block";
                errorbody.innerHTML = result.message || "Sign in failed";
            }
        }

    });
};


//sign up button to call the api
const signupBtn = document.getElementById("signupbtn");
const dialog=document.getElementById("successDialog");
if (signupBtn) {
    signupBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        const errorbody = document.getElementById("errorbody");
        const regestrationEmail = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const userPhone = document.getElementById("phoneNumber").value.trim();
        const confirmPassword = document.getElementById("passwordConfirm").value.trim();
        const validate = validateEmailAndPassword(regestrationEmail, confirmPassword)

        if (!username || !userPhone) {
            console.warn("all fields are required");
            showError("ALL FIELDS ARE REQUIRED");
            return;
        }
        if (!validate.valid) {
            showError(validate.message);
            return;
        }
        try {
            console.log("Proceed with signup");
            errorbody.style.display = "none";
            const results = await register(username, regestrationEmail, userPhone, confirmPassword);
            console.log("Sign up succesful");
            alert("Account succesfully created.")
            window.location.href = "login.html";
            
        }
        catch (error) {
            showError("Registration failed please try again.");
            console.error(error)
        }
    });
};

//send join request initiator

async function sendJoinRequest() {
    const app_name = applicationName.value;
    const app_email = applicationEmail.value;
    const app_phone = applicationPhone.value;
    const app_role = applicationRole.value;
    const app_ex = applicationExperience.value;
    const token = sessionStorage.getItem("token");
    if (!app_email || !app_name || !app_phone || !app_role) {
        alert(`All fields with asterisk "*" are required.`);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/sendJoinRequest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ app_name, app_email, app_phone, app_role, app_ex })
        });
        if (response.ok) {
            console.log("Request sent succesfuly");
            alert("Request succesfully sent");
        }
        else {
            const errorText = await response.json();
            console.log("Error occured ", errorText)
        }
    }
    catch (error) {
        console.log("Error occured sending request ", error);
        throw error;
    }
};

//const profileContainer = document.getElementById("profileContainer");
if (askForm) {
    askForm.addEventListener("click", (e) => {
        if (e.target.id === "submitBtn" || e.target.id === "profileContainer" || e.target.id === "esc") {
            e.preventDefault()
            sendJoinRequest();
            askForm.style.display = "none";
        }
        else {
            askForm.style.display = "block";
        }

    }
    );
}

if (askBtn) {
    askBtn.addEventListener("click", (e) => {
        e.preventDefault();
        askForm.style.display = "block";

    });
}


async function savePoster(title, venue, photo, date, time, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/saveEventPoster`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({ title, venue, photo, date, time, description })
        });
        const data = await response.json();
        console.log("Poster saved:", data);
    }
    catch (error) {
        console.error("Error saving poster:", error);
    }
}

function displayAdminsLinks() {
    const token = sessionStorage.getItem("token");
    if (token) {
        const payload = atob(token.split(".")[1]);
        const parsedPayload = JSON.parse(payload);
        if (parsedPayload.role === "admin") {
            adminTag.style.display = "block";
            responseTag.style.display = "block";
            admindash.style.display="block";
        }
    else {
        adminTag.style.display = "none";
        requestTag.style.display = "block";
        responseTag.style.display = "none";
        admindash.style.display="none";
    }
}
}

const pass=document.getElementById("password1");
if(pass){
document.getElementById("password1").addEventListener("input",(e)=>{
    const passtext=pass.value;
    if(passtext.length<=6){
        passwordStrength.textContent="Weak password";
        passwordStrength.style.color="red";
        passwordStrength.style.display="block";
        setTimeout(()=>{
            passwordStrength.style.display="none"
        },500);
    }
    else{
        passwordStrength.textContent="Strong Password";
        passwordStrength.style.color="green"
        passwordStrength.style.display="block";
        setTimeout(()=>{
            passwordStrength.style.display="none"
        },800);
    }
});
}

const createAccBtn=document.getElementById("signupbtn")
const passconfirm=document.getElementById("passwordConfirm");
if(passconfirm){
document.getElementById("passwordConfirm").addEventListener("input",()=>{
    const passtext1=pass.value;
    const passtext2=passconfirm.value;
    
    if(!(passtext1===passtext2)){
        passwordMatch.textContent="Passwords don't match";
        passwordMatch.style.color="red";
        passwordMatch.style.display="block";
        createAccBtn.style.opacity="0.2"
        createAccBtn.disabled=true;
        setTimeout(()=>{
            passwordMatch.style.display="none"
        },1500);
        
    }
    else{
        passwordMatch.textContent="Password match";
        passwordMatch.style.color="green";
        passwordMatch.style.display="block"
        createAccBtn.style.opacity="1";
        createAccBtn.disabled=false
        setTimeout(()=>{
            passwordMatch.style.display="none"
        },1000);
        
    }
});
}

const closeBtn=document.getElementById("closeDialog");
if(closeBtn){
closeBtn.addEventListener('click', () => {
    dialog.close();
});
}

document.addEventListener("DOMContentLoaded",displayAdminsLinks);
