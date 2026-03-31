

const API_URL = 'http://localhost:5000' || "http://127.0.0.1:5000";

async function displayAdmins() {
    try {
        const response = await fetch(`${API_URL}/api/admins`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const admins = await response.json();

        const adminList = document.getElementById('adminsBody');
        adminList.innerHTML = '';
        let id = 1;
        admins.forEach(admin => {

            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${id}</td>
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td>${admin.phone}</td>
            <td>${admin.role}</td>
            <td>${admin.level}</td>
            <td><button class="btn btn-danger" data-email="${admin.email}" data-uid="${admin.adminId}" >More</button></td>
        `;
            id++;
            adminList.appendChild(tr);
        });
        const buttons = adminList.querySelectorAll('.btn-danger');
        buttons.forEach(btn => {
            btn.onclick = (e) => {
                const email = e.target.dataset.email;
                const uuid = e.target.dataset.uid;
                if (!uuid || uuid === "undefined") {
                    console.error("Critical: UUID is missing for", email);
                    alert("Cannot perform action: User ID missing.");
                    return;
                }
                displayAdminSelectMenu(email, uuid);
            };
        });
    }
    catch (error) {
        console.error('Error fetching admins:', error);
    }
};

async function displayMembers() {
    try {
        const response = await fetch(`${API_URL}/api/members`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const members = await response.json();
        const memberList = document.getElementById('membersBody');
        memberList.innerHTML = '';
        let id = 1;
        members.forEach(member => {
            const tr = document.createElement('tr');
            const joinDate = member.datejoined ? new Date(member.datejoined).toLocaleDateString() : 'N/A';
            tr.innerHTML = `
            <td>${id}</td>
            <td>${member.username}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.role}</td>
            <td>${member.level}</td>
            <td>${joinDate}</td>
            <td><button class="btn btn-upgrade" data-email="${member.email}" data-uid="${member.memberId}">More</button></td>
        `;
            id++;
            memberList.appendChild(tr);
        });
        const buttons = memberList.querySelectorAll(".btn-upgrade");
        buttons.forEach(button => {
            button.onclick = (e) => {
                const email = e.target.dataset.email;
                const uuid = e.target.dataset.uid;
                if (!uuid || uuid === "undefined") {
                    alert("Cannot perform action missing id.")
                    return false;
                }

                displaySelectMenu(email, uuid);
            }
        })
    }
    catch (error) {
        console.error('Error fetching members:', error);
    }

}

async function displayUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const users = await response.json();
        const userList = document.getElementById('usersBody');
        userList.innerHTML = '';
        let id = 1;
        users.forEach(user => {
            const tr = document.createElement('tr');
            const joinDate = user.datejoined ? new Date(user.datejoined).toLocaleDateString() : 'N/A';
            tr.innerHTML = `
            <td>${id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.role}</td>
            <td>${user.level}</td>
            <td>${joinDate}</td>
            <td><button class="btn btn-action" data-email="${user.email}" data-uuid="${user.userId}">More</button></td>
        `;
            id++;
            userList.appendChild(tr);
        });
        const buttons = userList.querySelectorAll('.btn-action');
        buttons.forEach(btn => {
            btn.onclick = (e) => {
                const { email, uuid } = e.target.dataset;
                if (!uuid || uuid === "undefined") {
                    console.error("userId missing ");
                    alert("cannot perfom action user id missing");
                    return;
                }
                displayUsersSelectMenu(email, uuid)
            }
        });

    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function displayMovies() {
    try {
        const response = await fetch(`${API_URL}/api/movies`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const movies = await response.json();
        const movieList = document.getElementById('movieBody');
        movieList.innerHTML = '';
        let id = 1;

        movies.forEach(movie => {
            const movieDate = new Date(movie.releaseDate);
            const moviedate = movieDate.toLocaleDateString();
            const tr = document.createElement('tr');
            const movieage = (movie.age).toUpperCase();
            tr.innerHTML = `
            <td>${id}</td>
            <td>${movie.title}</td>
            <td>${movie.director}</td>
            <td>${movie.producer}</td>
            <td>${movie.runtime}</td>
            <td>${movie.topic}</td>
            <td>${movieage}</td>
            <td>${moviedate}</td>
            <td><button class="btn-movie" data-id="${movie.id}">ACTIONS</button></td>
        `;
            id++;
            movieList.appendChild(tr);
        });
        const buttons = movieList.querySelectorAll(".btn-movie");
        buttons.forEach(button => {
            button.onclick = (e) => {
                const id = e.target.dataset.id;
                if (!id || id === "undefined") {
                    console.error("Missing id.");
                    alert("Cannot perfom action.")
                    return;
                }
                displayMovieMenu(id, e);
            }
        })
    }
    catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function postEventPoster() {
    const formData = new FormData();
    if (!document.getElementById('poster').files[0]) {
        alert("Please select an image file first.");
        return;
    }
    formData.append('title', document.getElementById('title').value);
    formData.append('venue', document.getElementById('venue').value);
    formData.append('poster', document.getElementById('poster').files[0]);
    formData.append('date', document.getElementById('date').value);
    formData.append('time', document.getElementById('time').value);
    formData.append('description', document.getElementById('description').value);


    try {
        const response = await fetch(`${API_URL}/api/saveEventPoster`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: formData

        })

        if (response.ok) {
            alert("Event poster uploaded successfully!");
            document.getElementById('eventForm').reset();
        } else {
            const errorData = await response.json();
            alert("Failed to upload event poster.");
            console.error('Error uploading event poster:', response.statusText, errorData);
        }

    } catch (error) {
        console.error('Error uploading event poster:', error);
        throw error;
    };
};

const postEventBtn = document.getElementById('postEventBtn');
if (postEventBtn) {
    postEventBtn.addEventListener('click', (e) => {
        e.preventDefault();
        postEventPoster();
    });
};

const upgrade = document.getElementById("membersUpgrade");

function displayMovieMenu(id, e) {
    console.log("Displaying menu")
    const movieMenu = document.createElement("div");
    movieMenu.classList.add("movieMenu");
    if (movieMenu) movieMenu.remove();

    movieMenu.innerHTML = `
    <div>
        <li class="add-poster" id="opt-addPoster">Add Poster</li>
        <li class="edit-movie" id="opt-editMovie">Edit</li>
        <li class="view-actors" id="opt-actors">Characters</li>
        <li class="delete-movie" id="opt-delete">DELETE</li>
    </div>
    `;
    movieMenu.style.left = `${e.clientX}px`;
    movieMenu.style.top = `${e.clientY}px`;

    movieMenu.querySelector("#opt-addPoster").onclick = () => {
        displayMovieUploadModal(id)
        movieMenu.remove();
    };
    movieMenu.querySelector("#opt-editMovie").onclick = () => {
        editMovie(id);
        movieMenu.remove();
    };
    movieMenu.querySelector("#opt-actors").onclick = () => {
        viewActors(id);
        movieMenu.remove();
    }
    movieMenu.querySelector("#opt-delete").onclick = () => {
        displayConfirm(id);
        movieMenu.remove();
    }
    setTimeout(() => {
        document.addEventListener("click", () => movieMenu.remove(), { once: true })
    }, 0);
    document.body.appendChild(movieMenu);
}

function displaySelectMenu(email, uuid) {

    const pickMenu = document.createElement("div");
    pickMenu.classList.add("pickMenu");
    if (pickMenu) pickMenu.remove();
    pickMenu.innerHTML = `
    <div>
        <li class="make-admin" id="opt-admin">Make Admin</li>
        <li class="make-newLevel" id="opt-level">Change Level</li>
        <li class="make-newChat" id="opt-chat">Send Text</li>
        <li class="remove-member" id="opt-remove">Remove Member</li>
    </div>
    `;
    pickMenu.querySelector("#opt-chat").onclick = () => {
        sendText(uuid);
        pickMenu.remove();
    };
    pickMenu.querySelector("#opt-remove").onclick = () => {
        removeMember(email);
        pickMenu.remove();
    };
    pickMenu.querySelector("#opt-admin").onclick = () => {
        upgradeToAdmin(email);
        pickMenu.remove();
    };

    pickMenu.querySelector("#opt-level").onclick = () => {
        inputNewLevel(email);
        pickMenu.remove();
    };

    // Close menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', () => pickMenu.remove(), { once: true });
    }, 0);

    document.body.appendChild(pickMenu)
};


function displayAdminSelectMenu(email, uuid) {
    const adminPickMenu = document.createElement("div");
    adminPickMenu.classList.add("adminPickMenu");
    if (adminPickMenu) adminPickMenu.remove();

    adminPickMenu.innerHTML = `
    <div>
        <li class="make-newLevel" id="opt-newLevel">Update Level</li>
        <li class="make-remove" id="opt-remove">Revoke Admin</li>
        <li class="make-newChat" id="opt-newChat">Send Text</li>
    `;
    adminPickMenu.querySelector("#opt-newLevel").onclick = () => {
        inputNewLevel(email);
        adminPickMenu.remove();
    }
    adminPickMenu.querySelector("#opt-remove").onclick = () => {
        confirmRemove(email);
        adminPickMenu.remove();
    };
    adminPickMenu.querySelector("#opt-newChat").onclick = () => {
        startChatting(uuid);
        adminPickMenu.remove();
    }
    setTimeout(() => {
        document.addEventListener("click", () => adminPickMenu.remove(), { once: true });
    }, 0);
    document.body.appendChild(adminPickMenu)
};

function displayUsersSelectMenu(email, uuid) {
    const UpickMenu = document.createElement("div");
    UpickMenu.classList.add("UpickMenu");
    if (UpickMenu) UpickMenu.remove();

    UpickMenu.innerHTML = `
        <div>
            <li class="make-member" id="opt-member">Make Member</li>
            <li class="make-newChat" id="opt-newChat">Send Text</li>
        </div>
    `;
    UpickMenu.querySelector("#opt-member").onclick = () => {
        upgradeToMember(email);
        UpickMenu.remove();
    }
    UpickMenu.querySelector("#opt-newChat").onclick = () => {
        startChatting(uuid);
        UpickMenu.remove()
    }
    setTimeout(() => {
        document.addEventListener("click", (e) => UpickMenu.remove(), { once: true })
    }, 0);
    document.body.appendChild(UpickMenu)
};

async function upgradeToAdmin(email) {
    if (!email) return console.error("No email found");

    const token = sessionStorage.getItem("token")
    try {
        const response = await fetch(`${API_URL}/api/makeNewAdmin`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: email })
        });
        if (response.ok) {
            console.log("member succesfully made admin");
            alert(`user ${email} is officialy site admin`);

        }
        else {
            const errorText = await response.text()
            console.error("error occured ", errorText);
        }
    }
    catch (error) {
        console.error("error occured upgrading ", error);
        throw error;
    }
}

async function upgradeToMember(email) {
    if (!email) return console.error("No email found");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/makeNewMember`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        if (response.ok) {
            console.log("User suucesfully made member");
            alert(`User ${email} is officially crew member`);
        }
        else {
            const errorText = response.text();
            console.error("An error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error occured upgrading to member ", error);
        throw error;
    }
}

async function removeMember(email) {
    if (!email) console.error("no email found");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/removeUserMember`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: email })
        });
        if (response.ok) {
            console.log("Member succesfully removed from members");
            alert(`${email} succesfully removed from crew members`);

        }
        else {
            const errorText = await response.text();
            console.error("error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error removing member ", error);
        throw error;
    }
};

function confirmRemove(email) {
    let newConfirm = confirm("Are you sure you want to remove this admin?");
    if (newConfirm) {
        removeAdmin(email);
    }
    else {
        return
    }
}

async function removeAdmin(email) {
    if (!email) console.error("no email found");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/removeUserAdmin`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: email })
        });
        if (response.ok) {
            console.log("Member succesfully removed from admins");
            alert(`${email} succesfully removed from admins`);

        }
        else {
            const errorText = await response.text();
            console.error("error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error removing admin ", error);
        throw error;
    }
}

function inputNewLevel(email) {
    let newProm = prompt("Enter new User level");
    if (newProm) {
        updateUserLevel(email, newProm);
    }
    else {
        return
    }
}

async function updateUserLevel(email, newLevel) {
    if (!email || !newLevel) return console.error("Both email and new level are required");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/updateUserLevel`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ newLevel: newLevel, email: email })
        });
        if (response.ok) {
            console.log("New level succesfully updated");
            alert(`${email}'s new level is ${newLevel}`);
        }
        else {
            const errorText = await response.text();
            console.error("An error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error updating level ", error);
        throw error;
    }
};

async function startChatting(uuid) {
    console.log(uuid);
    if (!uuid) return console.error("No userId found");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/findChatPartner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ uuid })
        });
        if (response.ok) {
            console.log("User found. Redirecting to chatbox");
            sessionStorage.setItem("partnerId", uuid)
            window.location.href = `notification.html?uuid=${encodeURIComponent(uuid)}`;
        }
        else {
            const errorText = await response.json().catch(() => ({ message: "Unknown error" }));
            console.error("Error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error starting chat ", error);
        throw error;
    }
};

async function sendText(uuid) {

    const token = sessionStorage.getItem("token")
    try {
        const response = await fetch(`${API_URL}/api/findChatPartner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ uuid })
        });
        if (response.ok) {
            console.log("User found. Redirecting to chatbox");
            sessionStorage.setItem("partnerId", uuid);
            window.location.href = `notification.html?uuid=${encodeURIComponent(uuid)}`;
        }
        else {
            const errorText = await response.json().catch(() => ({ message: "Unknown error" }));
            console.error("Error occured ", errorText);
        }
    }
    catch (error) {
        console.error("Error starting chat ", error);
        throw error;
    }
}

// Keep track of the current page for pagination
let currentPage = 0;

async function handleSearch() {
    const query = document.getElementById('searchInput').value;
    const userList = document.getElementById('usersBody');
    const limit = 20;
    const offset = currentPage * limit;

    // Show a loading state (optional but helpful)
    userList.innerHTML = '<tr><td colspan="8">Searching...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/users/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                query: query,
                limit: limit,
                offset: offset
            })
        });

        if (!response.ok) throw new Error('Search failed');

        const users = await response.json();

        // Clear table and render new results
        renderUserTable(users);

    } catch (error) {
        console.error('Search Error:', error);
        userList.innerHTML = '<tr><td colspan="8">Error loading users.</td></tr>';
    }
}

// Helper function to render the rows (reusing your logic)
function renderUserTable(users) {
    const userList = document.getElementById('usersBody');
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = '<tr><td colspan="8">No users found.</td></tr>';
        return;
    }
    let id = 1;
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        // If your search join provides bookingStatus, you might want to show it
        const status = user.bookingStatus || 'No Booking';
        const joinDate = user.eventDate ? new Date(user.eventDate).toLocaleDateString() : 'N/A';

        tr.innerHTML = `
            <td>${id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phoneNumber}</td>
            <td>${status}</td>
            <td>${user.level || 'N/A'}</td>
            <td>${joinDate}</td>
            <td>
                <button class="btn btn-action" 
                        data-email="${user.email}" 
                        data-uid="${user.uuid}">More</button>
            </td>
        `;
        id++;
        userList.appendChild(tr);
    });

    // Re-attach the "More" button listeners
    attachActionListeners();
}

function attachActionListeners() {
    const buttons = document.querySelectorAll('.btn-action');
    buttons.forEach(btn => {
        btn.onclick = (e) => {
            const { email, uid } = e.target.dataset; // Note: using 'uid' from data-uid
            if (!uid || uid === "undefined") {
                alert("Cannot perform action: user ID missing");
                return;
            }
            displayUsersSelectMenu(email, uid);
        };
    });
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 0; // Reset to first page on new search
        handleSearch();
    }
});
const hireContainer = document.querySelector(".eventRequests");

function displayHireRequests(requests) {
    hireContainer.innerHTML = "";
    requests.forEach(request => {
        const hireBox = document.createElement("div");
        hireBox.classList.add("hireBox");
        const date = new Date(request.eventDate).toLocaleDateString()
        hireBox.innerHTML = `
            <div class="eventContent">
                <div class="status-div">${request.status}</div>
                <p>BY: <span class="sender">${request.username}</span></p>
                <p>Cell: <span class="phone">${request.phoneNumber}</span></p>
                <p>Type: <span class="kind">${request.eventType}</span></p>
                <p>Perfomance:<span class="category">${request.eventCategory}</span></p>
                <p>Venue: <span class="venue">${request.eventVenue}</span></p>
                <p>Date :<span class="eventdate">${date}</span></p>
                <p class="description">${request.description}</p>
                <button class="btn-response" data-uid="${request.id}">Upadate</button>
                <p>

            </div>
        `;
        hireContainer.appendChild(hireBox);
    });

    const btns = hireContainer.querySelectorAll(".btn-response");
    btns.forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.uid
            if (!id) {
                console.error("Missing userid")
                alert("Cannot perfom action, missing email");
                return;
            };
            displayUpdateMenu(e, id)
        }
    })
};

const joinContainer = document.querySelector(".joinRequests");

function displayJoinRequests(requests) {
    joinContainer.innerHTML = "";
    requests.forEach(request => {
        const joinBox = document.createElement("div");
        joinBox.classList.add("joinBox");
        joinBox.innerHTML = `
        <div>            
            <div class="applyPhoto" style="background-image: url('${request.profilePhoto || '../public/profile.png'}');"></div>
            <p>Username: <span class="applyname">${request.username}</span></p>
            <p><span class="applyEmail">${request.email}</span></p>
            <p><span class="applyphone">${request.phone}</span></p>
            <p>Request role: <span class="applyrole">${request.role}</span></p>
            <p class="description">${request.experience}</p>
            <button class="btn-update" data-email="${request.email}">Respond</button>
        </div>
        `;
        joinContainer.appendChild(joinBox);
    });
    const buttons = joinContainer.querySelectorAll(".btn-update");
    buttons.forEach(btn => {
        btn.onclick = (e) => {
            const email = e.target.dataset.email;
            if (!email) {
                console.error("Missing user email")
                alert("Cannot perform action, missing email")
                return
            }
            console.log("displaying response menu");
            displayResponseMenu(e, email);
        }
    })
}

async function getAllJoinRequests() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/joinRequests`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("displaying requests")
            displayJoinRequests(data.results);
        }
        else {
            const errortext = response.json();
            console.error("Error occured retrieving requests ", errortext);
        }
    }
    catch (error) {
        console.error("Network error", error);
        throw error;
    }
}

async function getAllEventRequests() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_BASE}/api/eventRequests`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            displayHireRequests(data.results);
        }
        else {
            const errorText = await response.json()
            console.error("An error occured ", errorText);
        }
    }
    catch (error) {
        console.error("An error occured fetching hire requests");
        throw error;
    }
};

function displayUpdateMenu(e, id) {
    console.log("button clicked displaying menu")
    const updateMenu = document.createElement("div");
    updateMenu.classList.add("updateMenu");
    if (updateMenu) updateMenu.remove();
    updateMenu.innerHTML = `
        <div >        
        <li class="approve" id="opt-approve">Approve</li>
        <li class="settled" id="opt-settled">Settled</li>
        <li class="cancel" id="opt-cancel">Cancel</li>
        <div>
    `;

    updateMenu.style.left = `${e.clientX}px`;
    updateMenu.style.top = `${e.clientY}px`;

    updateMenu.querySelector("#opt-cancel").onclick = () => {
        cancelRequest(id)
        updateMenu.remove();
    }
    updateMenu.querySelector("#opt-settled").onclick = () => {
        settleRequest(id)
        updateMenu.remove();
    }
    updateMenu.querySelector("#opt-approve").onclick = () => {
        approveRequest(id)
        updateMenu.remove();
    }
    setTimeout(() => {
        document.addEventListener("click", () => updateMenu.remove(), { once: true });
    }, 0);
    document.body.appendChild(updateMenu)

}

function displayResponseMenu(e, email) {
    const responseMenu = document.createElement("div");
    responseMenu.classList.add("responseMenu");
    if (responseMenu) responseMenu.remove();

    responseMenu.innerHTML = `
    <div>
    <li class="make-member" id="opt-member">Make Member</li>
    <li class="make-admin" id="opt-admin">Make Admin</li>
    </div>
    `;

    responseMenu.style.left = `${e.clientX}px`;
    responseMenu.style.top = `${e.clientY}px`;

    responseMenu.querySelector("#opt-member").onclick = () => {
        upgradeToMember(email);
        responseMenu.remove()
    }
    responseMenu.querySelector("#opt-admin").onclick = () => {
        upgradeToAdmin(email);
        responseMenu.remove();
    }
    setTimeout(() => {
        document.addEventListener("click", () => responseMenu.remove(), { once: true });
    }, 0);
    document.body.appendChild(responseMenu)
}

async function approveRequest(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/approveHire`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            console.log("Request approved succesfully");
            alert("Hire Request approved suuccesfully")
        }
        else {
            const errorText = await response.json();
            console.error("Error approving hire request ", errorText);
        }
    }
    catch (err) {
        console.error("Network error occured ", err);
        throw err;
    }
}

async function cancelRequest(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/cancelHire`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            console.log("Request succesfully cancelled");
            alert("Hire Request suceesfully canceled")
        }
        else {
            const errorText = await response.json();
            console.error("Error canceling hire request ", errorText);
        }
    }
    catch (err) {
        console.error("Network error occured ", err);
        throw err;
    }
}
async function settleRequest(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/settleHire`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            console.log("Request settled succesfully");
            alert("Hire Request settled suuccesfully")
        }
        else {
            const errorText = await response.json();
            console.error("Error approving hire request ", errorText);
        }
    }
    catch (err) {
        console.error("Network error occured ", err);
        throw err;
    }
}

const MovieModal = document.getElementById("posterUpload-modal");
const uploadBtn = document.getElementById("uploadBtn");

function displayMovieUploadModal(id) {
    if (!id) {
        console.error("Missing movie id");
        return;
    }

    MovieModal.style.display = "flex";
    uploadBtn.onclick = () => addMoviePoster(id);
}

let isUploading = false;

async function addMoviePoster(id) {
    const token = sessionStorage.getItem("token");
    const photopic = document.getElementById("movieposter");

    const photo = photopic.files[0];

    if (!photo) {
        alert("Please select a file first.");
        return false;
    }
    isUploading = true;
    const formData = new FormData();
    formData.append("id", id);
    formData.append("photo", photo);

    try {
        const response = await fetch(`${API_URL}/api/addMoviePoster`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            console.log("Movie poster added successfully.");
            alert("Poster uploaded successfully.");
            MovieModal.style.display = "none";
            return true;
        } else {
            console.error("Error occurred uploading poster.");
            return false;
        }

    } catch (error) {
        console.error("Network error ", error);
        throw error;
    }
    finally {
        isUploading = false;
    }
}

window.addEventListener("click", (e) => {
    if (e.target === MovieModal && !isUploading) {
        MovieModal.style.display = "none";
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !isUploading) {
        MovieModal.style.display = "none"
    }
})

async function editMovie(id) {
    const token = sessionStorage.getItem("token");
    const details = atob(token.split(".")[1]);
    const performerRole = details.role;
    if (!id) {
        alert("Can not edit unselected movie");
        return;
    }
    console.log("Redirecting to edit window");
    window.location.href = `edit.html?id=${encodeURIComponent(id)}`;

}

function viewActors(id) {
    const token = sessionStorage.getItem("token");
    if (!id) {
        alert("Cannot show characters of undefined movie.");
        return;
    }
    window.location.href = `actors.html?id=${encodeURIComponent(id)}`
}

function displayConfirm(id) {
    let con = confirm("Are you sure you want to delete this movie?");
    if (con) {
        deleteMovie(id);
    }
    else {
        return
    }
}

async function deleteMovie(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/deleteMovie`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });
        if (response.ok) {
            console.log("Movie succesfully deleted.");
            alert("Movie Succesfully Deleted");
        }
        else {
            const errorText = await response.json()
            console.error("An error occured ", errorText);
            alert("An error occured.");
        }
    }
    catch (error) {
        console.error("Network Error ", error);
        throw error;
    }
}

const nextStep = document.getElementById("nextStep");
const movie = document.getElementById("moviename");
const director = document.getElementById("director");
const topic = document.getElementById("mtopic");
const rating = document.getElementById("ageRating");
const run = document.getElementById("runtime");
const sponsor = document.getElementById("sponsor");
const totActors = document.getElementById("actors");
const prod = document.getElementById("producer");

// Global State for the Modal
let currentActorCount = 0;
let targetActorCount = 0;

const movieInput = document.getElementById("moviename");
const directorInput = document.getElementById("director");
const topicInput = document.getElementById("mtopic");
const ratingInput = document.getElementById("ageRating");
const runInput = document.getElementById("runtime");
const sponsorInput = document.getElementById("sponsor");
const actorsCountInput = document.getElementById("actors"); // The number of actors
const prodInput = document.getElementById("producer");
const releaseDate = document.getElementById("releaseDate");

function validateDetails(...fields) {
    if (fields.some(field => !field || field.trim() === "")) {
        alert("All movie fields are required.");
        return false;
    }
    return true;
}

nextStep.addEventListener("click", async (e) => {
    e.preventDefault();

    // Collect values
    const moviename = movieInput.value;
    const dir = directorInput.value;
    const top = topicInput.value;
    const rate = ratingInput.value;
    const runtime = runInput.value;
    const sponsorname = sponsorInput.value;
    const numActors = actorsCountInput.value; // How many actors to add
    const producer = prodInput.value;
    const release = releaseDate.value;

    // Validate
    if (!validateDetails(moviename, dir, producer, top, rate, runtime, sponsorname, numActors, release)) {
        return;
    }

    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/newMovie`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                moviename,
                dir,
                producer,
                top,
                rate,
                runtime,
                sponsorname,
                actors: numActors,
                release
            })
        });

        if (response.ok) {
            console.log("Movie saved successfully. Opening actor modal...");
            const data = await response.json();
            const newId = data.movieId;

            localStorage.setItem("moviename", moviename);
            sessionStorage.setItem("currentMovieId", newId)

            createActors(numActors, moviename);
        } else {
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            alert(`Error saving movie: ${errorData.message || "Check your connection"}`);
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("A network error occurred. Please try again.");
    }
});

function createActors(totalActorsCount, moviename) {
    targetActorCount = parseInt(totalActorsCount);
    currentActorCount = 0;

    const actorsModal = document.getElementById("actorsModal");

    // Show modal and lock background scroll
    actorsModal.style.display = "flex";
    document.body.classList.add("modal-open");

    // Update any UI labels in your modal (e.g., "Actor 1 of 5")
    updateModalUI();
}

function updateModalUI() {
    const progressLabel = document.getElementById("actorProgress");
    if (progressLabel) {
        progressLabel.innerText = `Adding Actor ${currentActorCount + 1} of ${targetActorCount}`;
    }
}

const actor = document.getElementById("actorName");
const alias = document.getElementById("aliasName");
const role = document.getElementById("actorRole");
const playT = document.getElementById("playTime");
const words = document.getElementById("actorWords");
const addActor = document.getElementById("addActor");

async function submitActor(moviename) {
    const actorName = actor.value;
    const aliasName = alias.value;
    const actorRole = role.value;
    const playTime = playT.value;
    const actorWords = words.value;
    if (!actorName || !aliasName || !actorRole || !playTime || !actorWords) {
        alert("All details are required.");
        return;
    }
    const token = sessionStorage.getItem("token");
    const movieId = sessionStorage.getItem("currentMovieId")
    try {
        const response = await fetch(`${API_URL}/api/newActor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ actorName, aliasName, moviename, actorRole, playTime, actorWords, movieId })
        });
        if (response.ok) {
            console.log("New actor added succesfully");
            return true;
        }
        else {
            const textError = await response.json().catch(({ message: "Unknown Error" }));
            console.error("An error occured adding new actor ", textError);
            return false;
        }
    }
    catch (error) {
        console.error("Network error occured ", error)
        throw error;
    }
};

addActor.addEventListener("click", async (e) => {
    e.preventDefault();

    const moviename = localStorage.getItem("moviename");

    const success = await submitActor(moviename);

    if (success) {
        currentActorCount++;
        document.getElementById("actorsForm").reset();

        if (currentActorCount >= targetActorCount) {
            alert("All actors added successfully!");
            document.getElementById("actorsModal").style.display = "none";
            // Optional: Redirect to a success page
            window.location.href = "dashboard.html";
        } else {
            console.log(`Actor ${currentActorCount} added. ${targetActorCount - currentActorCount} remaining.`);
        }
    }
});

async function displayCounts() {
    const token = sessionStorage.getItem("token");
    const usersCount = document.getElementById("usersCount");
    const memberCount = document.querySelector(".memberCount");
    try {
        const response = await fetch(`${API_URL}/api/countusers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error("An error occured displaying users.")
            return
        }
        const data = await response.json();
        usersCount.textContent = data.totMembers + " Users";

        const results = await fetch(`${API_URL}/api/countmembers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!results.ok) {
            console.error("An error occured counting members");
            return;
        };

        const memberdata = await results.json();
        memberCount.textContent = memberdata.results + " Members";

    }
    catch (error) {
        console.error("Network error ", error)
        throw error;
    }
}

const ctx = document.getElementById("usersjoin-overtime");
const rtx = document.getElementById("joinrequest-overtime");
const ttx = document.getElementById("hirerequests-overtime");
const btx = document.getElementById("movies-performed");
const ltx = document.getElementById("movies-count");

const mychart = new Chart(rtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: "Join Request",
            data: [],
            borderColor: '#d5963f',
            backgroundColor: 'rgba(50,101,201,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#d5963f',
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    }
})

const moviePie = new Chart(ltx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            label: 'Movies by Topic',
            data: [],
            backgroundColor: [
                '#4CAF50',
                '#2196F3',
                '#FF9800',
                '#E91E63',
                '#9C27B0'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true }
        }
    }
});

const myMovies = new Chart(btx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: "Perfomed ",
            data: [],
            borderColor: 'rgba(8, 160, 15, 0.9)',
            backgroundColor: 'rgba(8, 160, 15, 0.9)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(8, 160, 15, 0.9)',
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    }
})

const mychart1 = new Chart(ttx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: "Hire Request",
            data: [],
            borderColor: '#3fd560',
            backgroundColor: 'rgba(50,101,201,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#3fd560',
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    }
})

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'New Users',
            data: [],
            borderColor: '#4e73df',
            backgroundColor: 'rgba(70, 103, 202, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#4e73df',
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});

async function displayUsersOvertime() {
    try {
        const response = await fetch(`${API_URL}/api/countJoinings`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const { labels, counts } = await response.json();
            const localLabels = labels.map(dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });
            });

            chart.data.labels = localLabels;
            chart.data.datasets[0].data = counts;
            chart.update();
        }
    } catch (error) {
        console.error("Update failed", error);
        throw error
    }
}

async function displayJoinRequestOvertime() {
    try {
        const response = await fetch(`${API_URL}/api/countJoinRequests`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const { labels, counts } = await response.json();
            const localLabels = labels.map(dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });
            });

            mychart1.data.labels = localLabels;
            mychart1.data.datasets[0].data = counts;
            mychart1.update();
        }
    } catch (error) {
        console.error("Update failed", error);
        throw error
    }
}

async function displayBookingRequestOvertime() {
    try {
        const response = await fetch(`${API_URL}/api/countBookingRequests`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const { labels, counts } = await response.json();
            const localLabels = labels.map(dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });
            });

            mychart.data.labels = localLabels;
            mychart.data.datasets[0].data = counts;
            mychart.update();
        }
    } catch (error) {
        console.error("Update failed", error);
        throw error
    }
}

async function displayPerformanceOvertime() {
    try {
        const response = await fetch(`${API_URL}/api/countPerformance`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const { labels, counts } = await response.json();
            const localLabels = labels.map(dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                });
            });

            myMovies.data.labels = localLabels;
            myMovies.data.datasets[0].data = counts;
            myMovies.update();
        }
    } catch (error) {
        console.error("Update failed", error);
        throw error
    }
}

async function displayReleasedMovies() {
    try {
        const response = await fetch(`${API_URL}/api/countPostedMovies`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const { labels, counts } = await response.json();
            moviePie.data.labels = labels;
            moviePie.data.datasets[0].data = counts;
            moviePie.update();
        }
    } catch (error) {
        console.error("Update failed", error);
        throw error
    }
}



document.addEventListener('DOMContentLoaded', async () => {
    await displayAdmins();
    await displayMembers();
    await displayUsers();
    await displayMovies();
    await getAllEventRequests();
    await getAllJoinRequests();
    await displayCounts();
    await displayUsersOvertime();
    await displayJoinRequestOvertime();
    await displayBookingRequestOvertime();
    await displayPerformanceOvertime();
    await displayReleasedMovies();
});

console.log("Script loaded and running");