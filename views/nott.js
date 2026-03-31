
const API = "http://localhost:5000";
const urlParam = new URLSearchParams(window.location.search);
const id = urlParam.get("uuid");
const uuid = id;
const user = document.getElementById("chatPartnerName")
const messageNote = document.querySelector("#messageArea")
const socket = io("http://localhost:5000");

let meId = null;

async function findMyUid() {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API}/api/findMyId`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        meId = data.senderId;
        sessionStorage.setItem("myId", meId);
    }
}

async function findUsername() {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`${API}/api/findChatPartner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ uuid })
        });
        if (response.ok) {
            const data = await response.json()
            user.textContent = data.username;
        }
        else {
            console.error("Error occured finding username")
        }
    }
    catch (error) {
        console.error("Network error ", error)
        throw error;
    }
};

async function sendNotification() {
    const token = sessionStorage.getItem("token");
    const note = document.querySelector("#messageArea").value;
    meId = sessionStorage.getItem("myId")
    if (!note) {
        console.error("Can not send empty notification.");
        return;
    }
    try {
        const response = await fetch(`${API}/api/sendNotification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ meId, uuid, note })
        });
        if (response.ok) {
            console.log("Notification succesfully sent to ", uuid);
            socket.emit('send_message', note);
            createBubbleMessage(note, meId);
            messageNote.value = "";
            await findChats();
            chatcontainer.scrollTop = chatcontainer.scrollHeight;
        }
        else {
            console.error("Error occured sending notification.");
            alert("Error sending notification.")
        }
    }
    catch (error) {
        console.error("Network error ", error);
        throw error;
    }
}
const chatcontainer = document.querySelector(".chatResponseSection");
const Notcontainer = document.querySelector(".activeNotes-container")

async function findChats() {
    const token = sessionStorage.getItem("token");
    if (!meId) {
        await findMyUid();
        meId = sessionStorage.getItem("myId");
    }

    try {
        const response = await fetch(`${API}/api/findNotifications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ meId, uId: uuid })
        });

        if (response.ok) {
            const data = await response.json();
            chatcontainer.innerHTML = "";
            if (data.chats && data.chats.length > 0) {
                data.chats.forEach(dat => {
                    createBubbleMessage(dat, meId);
                });
            } else {
                chatcontainer.textContent = "No notification sent yet.Wanna send notification?\n Type your note in the input section.";
            }

            chatcontainer.scrollTop = chatcontainer.scrollHeight;
        }
    } catch (error) {
        console.error("Network Error ", error);
    }
}

async function findNotifications() {
    const token = sessionStorage.getItem("token");

    if (!meId) {
        await findMyUid();
        meId = sessionStorage.getItem("myId");
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/findNotificationWrapper`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ myId: meId }),
        });

        if (response.ok) {
            const data = await response.json();

            Notcontainer.innerHTML = ""; // ✅ FIXED (was chatcontainer)

            const notifications = data.notifications || data.chats || []; // ✅ flexible

            notifications.sort((a, b) => {
                return new Date(a.CreatedAt) - new Date(b.CreatedAt);
            });

            if (notifications.length > 0) {
                notifications.forEach((dat) => {
                    createBubbleNotification(dat, meId);
                });
            } else {
                Notcontainer.textContent =
                    "No notification sent yet.Wanna send notification?\n Type your note in the input section.";
            }

            Notcontainer.scrollTop = Notcontainer.scrollHeight;
        }
    } catch (error) {
        console.error("Network Error ", error);
    }
}

function createBubbleMessage(dat, meId) {
    const isMine = dat.senderId === meId;
    const bubble = document.createElement("div");
    bubble.classList.add("bubble", isMine ? "sent" : "received");

    const time = new Date(dat.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.innerHTML = `
        <div>
            <p class="message">${dat.note}</p>
            <sub class="time">${time}</sub>
        </div>            
    `;
    chatcontainer.appendChild(bubble);
}

function createBubbleNotification(dat, meId) {
    const isMine = dat.senderId === meId;

    const bubble = document.createElement("div");
    bubble.classList.add("bubble", isMine ? "sent" : "received");

    const time = new Date(dat.CreatedAt || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    bubble.innerHTML = `
    <div>
      <p class="message">${dat.note}</p>
      <sub class="time">${time}</sub>
      <sub class="user-Notified">${dat.username}</sub>
    </div>
  `;

    Notcontainer.appendChild(bubble);
}

document.getElementById("sendBtn").addEventListener("click", (e) => {
    sendNotification()
})

document.addEventListener("DOMContentLoaded", async () => {
    await findUsername()
    await findChats()
    findNotifications()
    const myId = sessionStorage.getItem("myId");
    if (myId && uuid) {
        socket.emit('join_chat', { myId: meId, uId: uuid });
    }
})

socket.on('receive_message', (data) => {
    const meId = sessionStorage.getItem("myId");
    if (data.senderId === uuid) {
        createBubbleMessage(data, meId);
        chatcontainer.scrollTop = chatcontainer.scrollHeight;
    }
});