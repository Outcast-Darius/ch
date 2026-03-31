
const API_URL = 'window.location.origin;' || "http://127.0.0.1:5000";

const container = document.getElementById("requestSection");
const approvedContainer = document.querySelector(".approvedSection")
const pendingContainer = document.querySelector(".pendingSection")
const settledContainer = document.querySelector(".settledSection")
const cancelledContainer=document.querySelector(".cancelledSection")

function displayUserRequests(requests) {
    //container.innerHTML = "";
    pendingContainer.innerHTML = "";
    approvedContainer.innerHTML = "";
    settledContainer.innerHTML = "";
    cancelledContainer.innerHTML="";

    requests.forEach(request => {
        const reqBox = document.createElement("div");
        reqBox.classList.add("reqBox");
        const eventDate =new Date(request.eventDate).toLocaleDateString()
        const sentDate = new Date(request.sentDate).toLocaleDateString()
        const status = request.status ? request.status.toLowerCase() : "pending";
        reqBox.innerHTML = `
            <div class="requestBox">
                <div class="status-div">${request.status || 'PENDING'}</div>
                <p class="eType">${request.eventType}</p>
                <p >Happening On <span class="eDate">${eventDate}</span></p>
                <p >Venue: <span class="location">${request.eventVenue}</span></p>
                <p class="description">${request.description ||" "}</p>
                <p>sent on: <span class="datesent">${sentDate}</span></p>
            </div>
        `;

        if (status === "pending") {
            pendingContainer.appendChild(reqBox)
            
        }
        else if (status === "approved") {
            approvedContainer.appendChild(reqBox)
        }
        else if(status==="settled"){
            settledContainer.appendChild(reqBox)
        }
        else {
            cancelledContainer.appendChild(reqBox)
        }
        //container.appendChild(reqBox);
    });
    checkEmpty(pendingContainer, "No pending requests found.");
    checkEmpty(approvedContainer, "No approved requests yet.");
    checkEmpty(settledContainer, "No past or settled requests.");
    checkEmpty(cancelledContainer, "No past or cancelled requests.");

};

function checkEmpty(container, message) {
    if (container.children.length === 0) {
        container.innerHTML = `<p class="empty-msg">${message}</p>`;
        
    }
}

async function getUserRequests() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/userHires`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json()
            console.log("getting user hire requests");
            displayUserRequests(data.results);
        }
        else {
            const errorText = await response.json();
            console.error("An error occured ", errorText);
        }
    }
    catch (error) {
        console.error("An error occured fetching hire requests ", error);
        throw error;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    getUserRequests();
})