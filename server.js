
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path')
require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const e = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/posters', express.static(path.join(__dirname, 'posters')));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/posters', express.static(path.join(__dirname, 'posters')));
app.use('posters', express.static(path.join(__dirname, 'posters')));
app.use('/images', express.static(path.join(__dirname, 'images')));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Your Frontend Port
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. User joins a private room based on the two IDs
    socket.on('join_chat', ({ myId, partnerId }) => {
        // Sort IDs to ensure the room name is the same for both users
        const roomId = [myId, partnerId].sort().join('_');
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });
    socket.on('send_message', (data) => {
        const roomId = [data.senderId, data.receiverId].sort().join('_');

        // Broadcast to everyone in the room (including the sender's other tabs)
        io.to(roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


//grabbing port from dotenv file
const PORT = process.env.PORT || 5000;

//verify jwt and store user for later use
const authenticationToken = (req, res, next) => {
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access Denied, no token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodeUser) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" })
        }
        req.user = decodeUser;

    })
    next()
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        // This checks if the folder exists, and if not, creates it
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const MovieStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'posters');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = 'movie' + Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};

const upload = multer({
    MovieStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

//upcoming event poster
const posterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'posters');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'poster-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadMiddleWare = multer({ storage: storage }).single("profilePhoto");
const posterUploadMiddleWare = multer({ storage: posterStorage }).single('poster');
const movieposterMiddleware = multer({ storage: MovieStorage }).single('photo');

const validateRegisterMiddleware = (req, res, next) => {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: "All Fields Are required." })
    }
    next();
}

const changePassword = async (req, res) => {
    const { currentpass, newpass } = req.body;
    const email = req.user.email;
    try {
        const finduser = await db.getUserPassword(email);
        if (finduser.length === 0) {
            return res.status(404).json({ message: "user not found" });
        }
        const user = finduser[0];

        const ismatch = await bcrypt.compare(currentpass, user.password);
        if (!ismatch) {
            return res.status(401).json({ message: "current password is incorrect" });
        }
        const isSamePassword = await bcrypt.compare(newpass, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        const saltrounds = 10;
        const hashedpass = await bcrypt.hash(newpass, saltrounds);

        await db.updateUserPassword(hashedpass, email);
        return res.status(200).json({ message: "Password changed succesfully" });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

app.get('/api/members', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }

    try {
        const members = await db.getMembers();
        res.json(members);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



app.post('/api/registerUser', validateRegisterMiddleware, async (req, res) => {
    const { username, email, phone, password } = req.body;
    const dateJoined = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const role = "user";
    const level = "normal";
    try {
        const registered = await db.userExists(email);
        if (registered) {
            return res.status(400).json({ message: "Email already taken" })
        }
        const result = await db.registerUser(
            username,
            email,
            phone,
            password,
            role,
            level,
            dateJoined
        );
        res.json(result);
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" });
    }
})

app.patch('/api/passwordchange', authenticationToken, changePassword);

app.patch('/api/makeNewAdmin', authenticationToken, async (req, res) => {
    console.log("Request received for PATCH /api/makeNewAdmin");

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permission" });
    }

    const { email } = req.body;
    try {
        const success = await db.updateMemberRole("admin", email);
        if (success) {
            res.status(200).json({ message: "User promoted to admin" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch('/api/makeNewMember', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Insufficient Permission" });
    }
    const { email } = req.body;
    try {
        const success = await db.updateMemberRole("Member", email);
        if (success) {
            res.status(200).json({ message: "User promoted to member" })
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch('/api/removeUserMember', authenticationToken, async (req, res) => {
    const { email } = req.body;
    try {
        const successResult = await db.updateMemberRole("user", email);
        if (successResult) {
            res.json({ message: "User removed from crew members" });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});


app.patch('/api/removeUserAdmin', authenticationToken, async (req, res) => {
    const { email } = req.body;
    try {
        const successResult = await db.updateMemberRole("member", email);
        if (successResult) {
            res.json({ message: "User removed from admins" });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});

app.patch('/api/updateUserLevel', authenticationToken, async (req, res) => {
    const { email, newLevel } = req.body;
    try {
        const successResult = await db.updateMemberlevel(newLevel, email);
        if (successResult) {
            res.status(200).json({ message: "User level changed" });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});

app.patch('/api/changeName', authenticationToken, async (req, res) => {
    const { newName } = req.body;
    const email = req.user.email
    try {
        const response = await db.updateUserName(newName, email);
        if (response) {
            res.status(200).json({ message: "Username updated succesfully" });
        }
        else {
            res.status(404).json({ message: "user with such email cannot be found" })
        }
    }
    catch (error) {
        console.error("Internal server error ", error);
        res.status(500).json({ message: "Internal server error ", error })
    }
});

app.patch('/api/settleHire', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbidden" });
    };
    const { id } = req.body;
    const status = "settled";
    try {
        const results = await db.updateBookingRequestStatus(status, id);
        if (results) {
            console.log("status successfuly changed to settled");
            res.status(200).json({ message: "Hire Status succesfully changed to settle" });

        }
        else {
            console.error("Hire request with such details not found ");
            res.status(404).json({ message: "Hire request not found" });
        }
    }
    catch (error) {
        console.error("An error occured updating request status");
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch('/api/cancelHire', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbidden" });
    };
    const { id } = req.body;
    const status = "canceled";
    try {
        const results = await db.updateBookingRequestStatus(status, id);
        if (results) {
            console.log("status successfuly changed to canceled");
            res.status(200).json({ message: "Hire Status succesfully changed to cancelled" });

        }
        else {
            console.error("Hire request with such details not found");
            res.status(404).json({ message: "Hire request not found" });
        }
    }
    catch (error) {
        console.error("An error occured updating request status");
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch('/api/approveHire', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.body;
    const status = "approved";
    try {
        const results = await db.updateBookingRequestStatus(status, id);
        if (results) {
            console.log("status successfuly changed to approved");
            res.status(200).json({ message: "Hire Status succesfully changed to approved" });

        }
        else {
            console.error("Hire request with such details not found");
            res.status(404).json({ message: "Hire request not found" });
        }
    }
    catch (error) {
        console.error("An error occured updating request status");
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch('/api/changePhone', authenticationToken, async (req, res) => {
    const { newNumber } = req.body;
    const email = req.user.email;
    try {
        const response = await db.updateUserPhone(newNumber, email);
        if (response) {
            res.status(200).json({ message: "phonenumber updated succesfully" });
        }
        else {
            res.status(404).json({ message: "user with such email and phone cannot be found" })
        }
    }
    catch (error) {
        console.error("Internal server error ", error);
        res.status(500).json({ message: "Internal server error ", error })
    }
});

app.patch('/api/saveEdits', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" })
    }
    const { id, words } = req.body;
    try {
        const results = await db.saveEdits(id, words);
        if (results) {
            res.status(200).json({ message: "Edit saved succesfully." })
        }
        else {
            res.status(404).json({ message: "Actor not found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error " })
    }
})

app.patch("/api/addMoviePoster", authenticationToken, movieposterMiddleware, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" })
    }
    console.log("req.file:", req.file);
    const posterPath = req.file.filename ? `/posters/${req.file.filename}` : null;
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const filePath = req.file.filename;
        const results = await db.UpdateMoviePoster(posterPath, id)
        if (!results) {
            return res.status(404).json({ message: "Movie with that id does not exist" });
        }
        console.log("Uploaded file:", filePath);
        res.status(200).json({
            message: "Poster uploaded successfully",
            path: filePath
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//new booking request
app.post('/api/newHire', authenticationToken, async (req, res) => {
    const email = req.user.email;
    const { user, phone, loc, date, eventType, category, description } = req.body;
    const status = "pending";
    const sentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
    try {
        const results = await db.newBookingRequest(user, email, phone, loc, date, eventType, category, description, sentDate, status);
        if (results && results.success) {
            console.log("Booking made succesfully");
            res.status(200).json({ message: "Booking done succesfully" });
        }
        else {
            console.error("An error occured while sending request ")
            res.status(400).json({ message: "Booking error" })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
});



app.post('/api/getUser', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.getUser(email);
        if (!user) {
            return res.status(404).json({ message: "USER NOT FOUND" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const token = jwt.sign(
            { email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        res.json({ success: true, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/api/sendJoinRequest', async (req, res) => {
    const { app_name, app_email, app_phone, app_role, app_ex } = req.body;
    const sentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const status = "Pending";
    try {

        const newRequest = db.newJoinRequest(app_name, app_email, app_phone, app_role, app_ex, sentDate, status);
        if (newRequest) {
            res.status(200).json({ message: "Request sent succesfully" });
        }
        else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


app.post(`/api/findChatPartner`, authenticationToken, async (req, res) => {
    const { uuid } = req.body;
    console.log(`user id ${uuid}`);
    try {
        if (!uuid) {
            return res.status(400).json({ message: "missing userId" })
        }
        const partner = await db.findChatPartner(uuid);
        if (!partner || partner.length === 0) {
            return res.status(404).json({ message: "Chat partner not found", results: partner });
        };
        const foundPartner = partner[0];
        res.status(200).json({
            message: "Found Partner",
            username: foundPartner.username
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error ", error })
    }
});

app.post('/api/findMessages', authenticationToken, async (req, res) => {
    const { myId, partnerId } = req.body;
    if (!myId || !partnerId) {
        return res.status(400).json({ message: "Missing senderId or receiverId." });
    }
    try {
        const results = await db.findMessages(myId, partnerId);
        if (results && results.length > 0) {
            res.status(200).json({
                message: "Found messages.",
                chats: results
            });
        }
        else {
            res.status(200).json({ message: "No chats found.", chats: [] });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error })
    }
})

app.post('/api/findNotifications', authenticationToken, async (req, res) => {
    const { meId, uId } = req.body;
    if (!meId || !uId) {
        return res.status(400).json({ message: "Missing senderId or receiverId." });
    }
    try {
        const results = await db.findNotifications(meId, uId);
        if (results && results.length > 0) {
            res.status(200).json({
                message: "Found notification.",
                chats: results
            });
        }
        else {
            res.status(200).json({ message: "No notification found.", chats: [] });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error })
    }
});

app.post("/api/findIndividualNotifications", authenticationToken, async (req, res) => {
    const { myId } = req.body;

    if (!myId) {
        return res.status(400).json({ message: "Missing user id." });
    }

    try {
        const chats = await db.findMessagewrapper(myId);
        return res.status(200).json({ chats });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

app.post("/api/findNotificationWrapper", authenticationToken, async (req, res) => {
    const { myId } = req.body;

    if (!myId) {
        return res.status(400).json({ message: "Missing user id." });
    }

    try {
        const chats = await db.findNotifications(myId);
        return res.status(200).json({ chats });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

app.post('/api/sendMessage', authenticationToken, async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const results = await db.sendMessage(senderId, receiverId, message);
        if (results) {
            res.status(200).json({ message: "sent" });
        }
        else {
            res.status(400).json({ message: "message not sent" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error })
    }
})


app.post('/api/sendNotification', authenticationToken, async (req, res) => {
    const { meId, uuid, note } = req.body;
    try {
        const results = await db.sendNotification(meId, uuid, note);
        if (results) {
            res.status(200).json({ message: "sent" });
        }
        else {
            res.status(400).json({ message: "message not sent" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error })
    }
})

app.post('/api/newMovie', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission.");
        res.status(403).json({ message: "Forbidden" });
    }
    const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { moviename, dir, producer, top, rate, runtime, sponsorname, actors, release } = req.body;
    try {
        const results = await db.newMovie(moviename, dir, producer, top, rate, runtime, sponsorname, actors, release, today)
        if (results) {
            console.log("Movie saved sucesfully");
            return res.status(200).json({
                message: "Movie update succesfully.",
                movieId: results.insertId
            });
        }
        else {
            console.error("Movie not found.");
            res.status(404).json({ message: "Movie not found" })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/api/newActor', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { actorName, aliasName, moviename, actorRole, playTime, actorWords, movieId } = req.body;
    try {
        const results = await db.newActor(actorName, aliasName, moviename, actorRole, playTime, actorWords, movieId);
        if (results) {
            console.log("New actor added succesfully.");
            res.status(200).json({ message: "Actor Added succesfully." });
        }
        else {
            console.error("Failed to add new actor in that movie.");
            res.status(400).json({ message: "Failed to add new actor." });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post('/api/getActors', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { movieId } = req.body;
    try {
        const results = await db.getActors(movieId);
        if (results) {
            res.status(200).json(results);
        }
        else {
            res.status(404).json({ message: "Movie with that id is not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." })
    }
});

app.post('/api/getMovieDetails', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { movieId } = req.body;
    try {
        const results = await db.getMovieData(movieId);
        if (results) {
            res.status(200).json(results[0])
        }
        else {
            res.status(404).json({ message: "Movie not found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error " })
    }
})

app.post('/api/addnewactor', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { name, aliasname, moviename, role, playtime, words, movieId } = req.body;
    try {
        const results = await db.addNewCharacter(name, aliasname, moviename, role, playtime, words, movieId);
        if (results) {
            res.status(200).json({ message: "actor added succesfully", results: results })
        }
        else {
            res.status(404).json({ message: "Movie not found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error " })
    }
});

app.post('/api/findMovieName', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { movieId } = req.body;
    try {
        const results = await db.findMovieName(movieId)
        if (results) {
            res.status(200).json({ results })
        }
        else {
            res.status(404).json({ message: "No movie with such id found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error " })
    }
})

app.patch('/api/saveMovieEdits', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { movieId, moviename, director, producer, topic, age, runtime, releasedate } = req.body;
    try {
        const results = await db.saveMovieEdits(movieId, moviename, director, producer, runtime, topic, age, releasedate);
        if (results) {
            res.status(200).json({ message: "Edits saved succesfully." });
        }
        else {
            res.status(404).json({ message: "Movie Not Found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error." })
    }
});

app.get(`/api/profile`, authenticationToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userDetails = await db.getUserProfileDetails(userEmail);
        if (!userDetails) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(userDetails);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get('/api/myrequests', authenticationToken, async (req, res) => {
    const email = req.user.email;
    try {
        const response = await db.countAllSentRequests(email);
        if (!response) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({ requestTotal: response });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error ", error });
    }
});

app.get('/api/countmembers', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient perfmission");
        return res.status(403).json({ message: "Forbidden" })
    }
    try {
        const results = await db.countMembers();
        if (results) {
            res.status(200).json({ results: results });
        }
        else {
            res.status(404).json({ message: "No user found" })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." })
    }
})


app.get('/api/countusers', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient perfmission");
        return res.status(403).json({ message: "Forbidden" })
    }
    try {
        const results = await db.countAllUsers()
        if (results) {
            res.status(200).json({ totMembers: results });
        }
        else {
            res.status(404).json({ message: "No user found" })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error." })
    }
})

app.get('/api/joinRequests', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.getAllJoinRequests();
        if (results) {
            console.log("fetching requests...");
            res.status(200).json({ results });
        }
        else {
            console.error("No requests found");
            res.status(404).json({ message: "No records of Join Requests Found" })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.get('/api/findMyId', authenticationToken, async (req, res) => {
    const email = req.user.email;
    try {
        const results = await db.findMyUid(email)
        if (results && results.length > 0) {
            const user = results[0]
            res.status(200).json({
                senderId: user.senderId
            });
        }
        else {
            res.status(404).json({ message: "User not found." })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error ", error })
    }
})

app.get('/api/findMoviePoster', async (req, res) => {
    try {
        const results = await db.findMoviePoster()

        if (results.length === 0) {
            return res.status(404).json({
                message: "No movies posted yet."
            })
        }
        res.status(200).json({ results })
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error });
        console.error(error)
    }
})

app.get('/api/countJoinings', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.countJoinings();
        if (results.length === 0) {
            return res.status(404).json({ message: "No users joined yet." })
        }
        const labels = results.map(row => row.date);
        const counts = results.map(row => row.users);

        res.status(200).json({ labels, counts });

    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error ", error })
        console.error("Internal server error ", error)
    }
})

app.get('/api/countJoinRequests', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.countJoinRequests();
        if (results.length === 0) {
            return res.status(404).json({ message: "No users joined yet." })
        }
        const labels = results.map(row => row.date);
        const counts = results.map(row => row.joinRequest);

        res.status(200).json({ labels, counts });

    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error ", error })
        console.error("Internal server error ", error)
    }
})

app.get('/api/countBookingRequests', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.countBookingRequests()
        if (results.length === 0) {
            return res.status(404).json({ message: "No users joined yet." })
        }
        const labels = results.map(row => row.date);
        const counts = results.map(row => row.books);

        res.status(200).json({ labels, counts });

    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error ", error })
        console.error("Internal server error ", error)
    }
})

app.get('/api/countPerformance', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.countPerformance()
        if (results.length === 0) {
            return res.status(404).json({ message: "No users joined yet." })
        }
        const labels = results.map(row => row.date);
        const counts = results.map(row => row.performed);

        res.status(200).json({ labels, counts });

    }
    catch (error) {
        res.status(500).json({ message: "Internal Server error ", error })
        console.error("Internal server error ", error)
    }
});

app.get('/api/countPostedMovies', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permission");
        return res.status(403).json({ message: "Forbiden" })
    };
    try {
        const results = await db.countPostedMovie();
        if (results.length === 0) {
            return res.status(404).json({ message: "No movies yet." });
        }
        const labels = results.map(r => r.topic);
        const counts = results.map(r => r.total);
        res.status(200).json({ labels, counts });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error ", error })
        console.error(error)
    }
})

app.post('/api/searchpartner', authenticationToken, async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "Search query is required." });
    }

    try {
        const user = await db.findOne(query);

        if (!user) {
            return res.status(404).json({ message: "No user found with those details." });
        }

        res.status(200).json({
            userId: user.userId,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/api/updateProfilePic', authenticationToken, uploadMiddleWare, async (req, res) => {
    console.log('[/api/updateProfilePic] headers:', req.headers);
    console.log('[/api/updateProfilePic] body keys:', Object.keys(req.body || {}));
    console.log('[/api/updateProfilePic] file:', req.file);
    console.log("this file is uploaded");

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const profilePicPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Update the user's profile picture path in the database
        await db.updateProfilePhoto(profilePicPath, req.user.email);
        console.log(`Profile photo updated for ${req.user.email}: ${profilePicPath}`);

        res.json({ success: true, profilePhoto: profilePicPath, profilePic: `/uploads/${req.file.filename}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }

});

app.post('/api/saveEventPoster', authenticationToken, posterUploadMiddleWare, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const posterPath = req.file.filename ? `/posters/${req.file.filename}` : null;

    try {

        const { title, venue, date, time, description } = req.body;

        if (!title || !venue || !date || !time || !description) {
            return res.status(400).json({ message: "Missing required fields: title, venue, date, time, description" });
        }

        const result = await db.newEventPoster(title, venue, posterPath, date, time, description);
        res.json({ message: "Event poster saved successfully", data: result });
    }
    catch (error) {
        console.error("Detailed error in /api/saveEventPoster:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.post('/api/getActorWords', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient Permission.");
        return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.body;
    try {
        const results = await db.getActorWords(id);
        if (results) {
            res.status(200).json(results[0])
        }
        else {
            res.status(404).json({ message: "Actor not found" });
        }
    }
    catch (error) {
        console.error("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/api/users/search', authenticationToken, async (req, res) => {
    // Destructure the body; set defaults if they aren't provided
    const { query, limit = 20, offset = 0 } = req.body;

    if (!query && query !== "") {
        return res.status(400).json({ message: "Search term required" });
    }

    try {
        const results = await db.searchUsers(query, parseInt(limit), parseInt(offset));
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/api/userHires', authenticationToken, async (req, res) => {
    const email = req.user.email;
    try {
        const results = await db.getUsersRequests(email);
        if (results) {
            console.log("user sent hire requests");
            res.status(200).json({
                success: true,
                results: results
            });
        }
        else {
            console.error("Hire requests not found");
            res.status(404).json({ message: "Hire request for this user is not found" })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});

app.get('/api/eventRequests', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permissions");
        return
    };
    try {
        const results = await db.getAllEventRequests();
        if (results) {
            console.log("retrieving events ");
            res.status(200).json({
                success: true,
                results: results
            });
        }
        else {
            console.error("No hire requests made by users");
            res.status(404).json({ message: "No hire requests found" });
        }
    }
    catch (error) {
        console.error("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Global multer error handler to provide clearer responses for upload issues
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message.includes('Unexpected field')) {
            return res.status(400).json({ message: 'Unexpected field: check the file input name. Expected "profilePhoto"' });
        }
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
});

// Temporary test route to verify multer handling without authentication
app.post('/api/testUpload', uploadMiddleWare, (req, res) => {
    console.log('[/api/testUpload] headers:', req.headers);
    console.log('[/api/testUpload] body keys:', Object.keys(req.body || {}));
    console.log('[/api/testUpload] file:', req.file);
    console.log('this file is uploaded....');
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ success: true, file: req.file });
});

app.get('/api/getEventPoster', async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const eventPoster = await db.getEventPoster(today);
        if (!eventPoster) {
            return res.status(404).json({ message: "No upcoming events found" });
        }

        res.status(200).json(eventPoster);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal Server Error ${error}` });
    }
});

app.get('/api/admins', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    try {
        const admins = await db.getAdmins();
        res.json(admins);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/api/users', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }

    try {
        const users = await db.getallusers();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/api/movies', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    try {
        const movies = await db.getMovies();
        res.json(movies);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/api/deleteMovie', authenticationToken, async (req, res) => {
    if (req.user.role !== "admin") {
        console.error("Insufficient permissions.");
        return res.status(403).json({ message: "Forbidded" })
    };
    const { id } = req.body;
    try {
        const results = await db.deleteMovie(id);
        if (results) {
            console.log("movie succesfully deleted.");
            res.status(200).json({ message: "Movie deleted." })
        }
        else {
            console.error("Movie with such id is not found.")
            res.status(404).json({ message: "Movie Not Found." })
        }
    }
    catch (error) {
        console.error("Internal server error ", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

//validating user inputs

const posterUploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
};


//app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
server.listen(5000, () => {
    console.log('Server is running on window.location.origin;');
});
