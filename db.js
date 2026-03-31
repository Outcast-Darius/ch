
const bcrypt = require('bcrypt');
const { parse } = require('dotenv');
const mysql = require('mysql2/promise');
require('dotenv').config();

//setting up pool for a continuos db access
const pool = mysql.createPool(
    {
        host: process.env.TIDB_HOST || 'localhost',
        user: process.env.TIDB_USER || 'root',
        password: process.env.TIDB_PASSWORD || process.env.DB_PASS,
        database: process.env.TIDB_NAME || 'charity',
        connectionLimit: Number(process.env.LIMIT) || 20,
        port: process.env.TIDB_PORT || 3306,
        queueLimit: 0,
        waitForConnections: true,
        ssl: process.env.TIDB_HOST ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : null

    }
);

console.log("Checking Env Variables:");
console.log("TIDB_USER:", process.env.TIDB_USER);
console.log("TIDB_NAME:", process.env.TIDB_NAME);

//function for registering new users to the site
async function registerUser(username, email, phone, password, role, level, dateJoined) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = "INSERT INTO users(username,email,phone,password,role,level,datejoined) VALUES(?,?,?,?,?,?,?)";

    try {
        const [result] = await pool.execute(sql, [username, email, phone, hashedPassword, role, level, dateJoined]);
        return { success: true, userId: result.insertId };
    }
    catch (error) {
        console.error("Registration error ", error)
        throw error;
    }
}

//
async function userExists(email) {
    const sql = "SELECT id FROM users WHERE email = ? LIMIT 1";
    const [rows] = await pool.execute(sql, [email]);
    return rows.length > 0;
}

//adding new book for performance 
async function newBookingRequest(username, email, phoneNumber, eventVenue, eventDate, eventType, eventCategory, description, sentDate, status) {
    const sql = "INSERT INTO booking(username,email,phoneNumber,eventVenue,eventDate,eventType,eventCategory,description,sentDate,status) VALUES(?,?,?,?,?,?,?,?,?,?)";
    try {
        const [result] = await pool.execute(sql, [username, email, phoneNumber, eventVenue, eventDate, eventType, eventCategory, description, sentDate, status]);
        return { success: true, bookId: result.insertId };
    }
    catch (err) {
        console.error("Database error", err);
        throw err;
    }
}

//new join request
async function newJoinRequest(username, email, phoneNumber, role, experience, sentDate, status) {
    const subpool = `INSERT INTO requests(username,email,phoneNumber,role,experience,sentDate,status)
    VALUES(?,?,?,?,?,?,?);    
    `;
    try {
        const [rows] = await pool.execute(subpool, [username, email, phoneNumber, role, experience ?? null, sentDate, status]);
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error
    }
}

//adding new movie to the list
async function newMovie(title, director, producer, topic, age, runtime, mainSponsor, totalActors, release, time) {
    const subpool = `INSERT INTO movies(title,director,producer,topic,age,runtime,mainSponsor,totalActors,releaseDate,CreatedAt)
    VALUES(?,?,?,?,?,?,?,?,?,?)`;
    try {
        const [rows] = await pool.execute(subpool, [title, director, producer, topic, age, runtime, mainSponsor, totalActors, release, time]);
        return rows;
    }
    catch (err) {
        console.error("Database error", err);
        throw err;
    }
}

//add new character into a movie
async function newActor(actorName, aliasName, moviename, actorRole, playTime, actorWords, movieId) {
    const sql = `INSERT INTO characters(actorName, aliasName, moviename, actorRole, playTime, actorWords,movieId)
    VALUES(?,?,?,?,?,?,?)`;
    try {
        const [row] = await pool.execute(sql, [actorName, aliasName, moviename, actorRole, playTime, actorWords, movieId]);
        return row;
    }
    catch (error) {
        console.error("Database error", error);
        throw error
    }
}

//new feedback sent
async function newFeedback(username, feedtype, feed, DateSent) {
    const sql = `INSERT INTO feedback (username,feedtype,feed,DateSent) 
    VALUES(?,?,?,?);
    `;
    try {
        const [rows] = await pool.execute(sql, [username, feedtype, feed, DateSent]);
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//new event poster
async function newEventPoster(title, venue, photo, date, time, description) {
    const sql = `INSERT INTO postedEvents(eventTitle,eventVenue,eventPhoto,eventDate,eventTime,description)
    VALUES(?,?,?,?,?,?)
    `;
    try {
        const [result] = await pool.execute(sql, [title, venue, photo, date, time, description]);
        return { success: true, insertId: result.insertId, message: "Event poster created successfully" };
    }
    catch (err) {
        console.error("Database Error in newEventPoster:", err);
        throw err;
    }
}

async function sendMessage(sender, receiver, message) {
    // We insert the IDs into the varchar fields AND convert them for the binary fields
    const sql = `
        INSERT INTO messages (senderId, receiverId, message, senderUUID, receiverUUID)
        VALUES (?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))
    `;

    try {
        const [row] = await pool.execute(sql, [
            sender,
            receiver,
            message,
            sender,
            receiver
        ]);
        return row;
    } catch (error) {
        console.error("Database error during sendMessage:", error);
        throw error;
    }
}

//send notifications
async function sendNotification(sender, receiver, note) {
    const sql = `
        INSERT INTO notifications (senderId, receiverId, note, senderUUID, receiverUUID)
        VALUES (?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?))
    `;
    try {
        const [row] = await pool.execute(sql, [
            sender,
            receiver,
            note,
            sender,
            receiver]);
        return row;
    }
    catch (error) {
        console.error("Database error");
        throw error
    }
}


//getting feedbacks
async function getFeedbacks(feedback) {
    const sql = `SELECT username,feedtype,feed,DateSent
    FROM feedback
    WHERE feedtype=?
    `;
    try {
        const [rows] = await pool.execute(sql, [feedback]);
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//function to get users 
async function getUser(email) {

    const sql = "SELECT role,email,password FROM users WHERE email=?";
    try {
        const [rows] = await pool.execute(sql, [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error("Database Error", error);
        throw error;
    }
}

//get user password for password reset
async function getUserPassword(email) {
    const sql = ` SELECT password
    FROM users
    WHERE email=?
    `;
    try {
        const [row] = await pool.execute(sql, [email]);
        return row;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//get user profile details
async function getUserProfileDetails(email) {
    const sql = "SELECT username,email,phone,role,level,datejoined,profilePhoto FROM users WHERE email=?";
    try {
        const [rows] = await pool.execute(sql, [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error("Database Error", error);
        throw error;
    }
}

//getting recenlty posted upcoming event
async function getEventPoster(today) {
    const sql = `SELECT id, eventTitle,eventVenue,eventPhoto,eventDate,eventTime
     FROM postedevents 
     WHERE eventDate >= ?
     ORDER BY eventDate ASC
     LIMIT 1`;
    try {
        const [rows] = await pool.execute(sql, [today]);
        return rows.length > 0 ? rows[0] : null;

    }
    catch (error) {
        console.error('Database error', error);
        throw error;
    }
}

//find requests sent by a specific user
async function getUsersRequests(email) {
    const sql = `SELECT * 
    FROM booking 
    WHERE email=? 
    ORDER BY status ASC
    `;
    try {
        const [results] = await pool.execute(sql, [email]);
        return results;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//obtain all event requests sent
async function getAllEventRequests() {
    const sql = `SELECT *
    FROM booking 
    ORDER BY status ASC   
    `;
    try {
        const [results] = await pool.execute(sql);
        return results;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}


// get all admins
async function getAdmins() {
    const subpool = `SELECT BIN_TO_UUID(uuid) AS adminId, username,email,phone,role,level 
    FROM users 
    WHERE role=? 
    ORDER BY level ASC`
    try {
        const [results] = await pool.execute(subpool, ['admin']);
        return results
    }
    catch (error) {
        console.log("Database error ", error);
        throw error;
    }
}

//get all members
async function getMembers() {

    const subpool = `SELECT BIN_TO_UUID(uuid) AS memberId, username,email,phone,role,level,datejoined 
    FROM users 
    WHERE role=? AND level=? 
    ORDER BY username ASC
    `;
    try {
        const [results] = await pool.execute(subpool, ['member', 'normal']);
        return results
    }
    catch (error) {
        console.log("Database error ", error);
        throw error;
    }
}

//get all users
async function getallusers() {

    const subpool = `SELECT BIN_TO_UUID(uuid) AS userId, username,email,phone,role,level,datejoined
    FROM users
    WHERE role=? AND level=?
    ORDER BY username ASC
    `;
    try {
        const [results] = await pool.execute(subpool, ['user', 'normal']);
        return results
    }
    catch (error) {
        console.log("Database error ", error);
        throw error;
    }
}

//get movies
async function getMovies() {
    const subpool = "SELECT * FROM movies";
    try {
        const [rows] = await pool.execute(subpool);
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

// get all join requests
async function getAllJoinRequests() {
    const sql = `SELECT r.username,
    r.email,
    r.role,
    r.experience,
    u.id,
    u.email,
    u.phone,
    u.profilePhoto 
    FROM requests r
    LEFT JOIN users u ON r.email=u.email
    ORDER BY role ASC
    `;
    try {
        const [result] = await pool.execute(sql);
        return result;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//getting all actor details for specific movie
async function getActors(id) {
    const sql = ` SELECT
        c.id as actorId, 
        c.actorName,
        c.aliasName,
        c.actorRole,
        c.playTime,
        c.actorWords,
        c.stars,
        c.movieId,
        m.id
        FROM characters c        
        INNER JOIN movies m ON c.movieId=m.id
        WHERE movieId=?
        ORDER BY c.actorName ASC
    `;
    try {
        const [rows] = await pool.execute(sql, [id]);
        return rows
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//getting specific actor words
async function getActorWords(id) {
    const sql = `SELECT actorName,
        actorWords
        FROM characters
        WHERE id=?    
    `;
    try {
        const [row] = await pool.execute(sql, [id]);
        return row;
    }
    catch (error) {
        console.error("Database error");
    }
}

//get movie details for editing
async function getMovieData(id) {
    const sql = `SELECT *
    FROM movies
    WHERE id=?
    `;
    try {
        const [row] = await pool.execute(sql, [id]);
        return row;
    }
    catch (error) {
        console.error("Database error");
        throw error
    }
}

//find movie poster and other details
async function findMoviePoster() {
    const sql = `SELECT
    id,
    title,
    age,
    runtime,
    stars,
    moviePoster,
    topic,
    CreatedAt
    FROM movies
    ORDER BY CreatedAt DESC
    `;
    try {
        const [rows] = await pool.execute(sql);
        return rows;
        console.log(rows);
    }
    catch (error) {
        console.error("Database error")
        throw error;
    }

}

//find movie name for character update
async function findMovieName(movieId) {
    const sql = `SELECT title
FROM movies
WHERE id=?
 `;
    try {
        const [row] = await pool.execute(sql, [movieId])
        return row;
    }
    catch (error) {
        console.error("Database error");
        throw error
    }
}

//count all requests sent to join the crew
async function countAllSentRequests(email) {
    const sql = `SELECT COUNT(*) as requestTotal 
    FROM requests
    WHERE email=?
    `;
    try {
        const [results] = await pool.execute(sql, [email]);
        return results[0]?.requestTotal ?? 0;
    }
    catch (error) {
        console.error("Database error")
        throw error
    }
}

//count all sight users
async function countAllUsers() {
    const sql = "SELECT COUNT(id) as Total FROM users";
    try {
        const [rows] = await pool.execute(sql);
        return rows[0]?.Total ?? 0;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//count crew members
async function countMembers() {
    const sql = "SELECT COUNT(email) as mems FROM users WHERE role=?";
    try {
        const [rows] = await pool.execute(sql, ['member']);
        return rows[0].mems;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//count and group users with joining date for analysis
async function countJoinings() {
    const sql = `
        SELECT DATE(datejoined) as date,
        COUNT(*) as users
        FROM users
        GROUP BY DATE;
    `;
    try {
        const [rows] = await pool.execute(sql);
        return rows;
    }
    catch (error) {
        console.error("Database error")
        throw error;
    }
}

//count and group joining crew request request date for analysis
async function countJoinRequests() {
    const sql = `
        SELECT DATE(sentDate) as date,
        COUNT(*) as joinRequest
        FROM requests
        GROUP BY DATE;
    `;
    try {
        const [rows] = await pool.execute(sql);
        return rows;
    }
    catch (error) {
        console.error("Database error")
        throw error;
    }
}

//count and group booking for perfomance request group by date for analysis
async function countBookingRequests() {
    const sql = `
        SELECT DATE(sentDate) as date,
        COUNT(*) as books
        FROM booking
        GROUP BY DATE;
    `;
    try {
        const [rows] = await pool.execute(sql);
        return rows;
    }
    catch (error) {
        console.error("Database error")
        throw error;
    }
}

//count perfomance over time
async function countPerformance() {
    const sql = `
    SELECT DATE(eventDate) as date,
    COUNT(*) as performed
    FROM booking
    WHERE status='settled'
    GROUP BY DATE
    `;
    try {
        const [rows] = await pool.execute(sql)
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//count and group all movies according to topic 
async function countPostedMovie() {
    const today = new Date();
    const sql = `SELECT topic,
    COUNT(*) as total
    FROM movies
    WHERE releaseDate <=?
    GROUP BY topic
    ORDER BY topic DESC
    `;
    try {
        const [rows] = await pool.execute(sql, [today]);
        return rows;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//updating profile photo into a pic or gif
async function updateProfilePhoto(pic, email) {
    const sql = "UPDATE users SET profilePhoto=? WHERE email=?"
    try {
        const [result] = await pool.execute(sql, [pic, email]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.error("Database Error", error);
        throw error;
    }
}

//update username
async function updateUserName(newName, email) {
    const subpool = `
    UPDATE users
        LEFT JOIN booking ON users.email = booking.email
        LEFT JOIN requests ON users.email = requests.email
        SET 
            users.username = ?, 
            booking.username = ?, 
            requests.username = ?
        WHERE users.email = ?
    `;
    try {
        const [results] = await pool.execute(subpool, [newName, newName, newName, email]);
        return results.affectedRows > 0;
    }
    catch (err) {
        console.error("Database Error", err);
        throw err;
    }
}

//update phone number
async function updateUserPhone(newPhone, email) {
    const subpool = `UPDATE users 
    LEFT JOIN booking ON users.email=booking.email
    LEFT JOIN requests ON users.email=requests.email
    SET users.phone=?,
    booking.phoneNumber=?,
    requests.phoneNumber=?
    WHERE users.email=?`;
    try {
        const [results] = await pool.execute(subpool, [newPhone, newPhone, newPhone, email]);
        return results.affectedRows > 0;
    }
    catch (error) {
        console.error("Database Error", error);
        throw error;
    }
}

//update members role
async function updateMemberRole(newRole, email) {
    const subPool = "UPDATE users SET role=? WHERE email=?";
    try {
        const [rows] = await pool.execute(subPool, [newRole, email]);
        return rows.affectedRows > 0;
    }
    catch (error) {
        console.error("Database Error", error)
        throw error;
    }
}

//update members level
async function updateMemberlevel(newLevel, email) {
    const subPool = "UPDATE users SET level=? WHERE email=?";
    try {
        const [rows] = await pool.execute(subPool, [newLevel, email]);
        return rows.affectedRows > 0;
    }
    catch (error) {
        console.error("Database Error", error)
        throw error;
    }
}

//update booked request from pending,approved to settled
async function updateBookingRequestStatus(newStatus, id) {
    const subpool = "UPDATE booking SET status=? WHERE id=? LIMIT 1";
    try {
        const [rows] = await pool.execute(subpool, [newStatus, id]);
        return rows.affectedRows > 0;
    }
    catch (error) {
        console.error("Database error", error);
        throw error;
    }
}

//update password
async function updateUserPassword(newpass, email) {
    const sql = `UPDATE users
    set password=?
    WHERE email=?
    `;
    try {
        const [row] = await pool.execute(sql, [newpass, email]);
        return row;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//update actor words
async function saveEdits(id, words) {
    const sql = `UPDATE characters
    SET actorWords=?
    WHERE id=?
    `;
    try {
        const [row] = await pool.execute(sql, [words, id]);
        return row;
    }
    catch (error) {
        console.error("Database error")
        throw error
    }
}

//update movieposter
async function UpdateMoviePoster(path, id) {
    const sql = `UPDATE movies
    SET moviePoster=?
    WHERE id=?
    `;
    try {
        const [row] = await pool.execute(sql, [path, id]);
        return row;
    }
    catch (error) {
        console.error("Database error")
        throw error
    }
}

//add character to a movie
async function addNewCharacter(name, aliasname, moviename, role, playtime, words, movieId) {
    const sql = `INSERT INTO characters
    (actorName,aliasName,moviename,actorRole,playTime,actorWords,movieId)
    VALUES(?,?,?,?,?,?,?)
    `;
    const upd = `UPDATE movies
    SET totalActors=totalActors+1
    WHERE id=?     
    `;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [charResults] = await connection.execute(sql, [name, aliasname, moviename, role, playtime, words, movieId])
        const [movResults] = await connection.execute(upd, [movieId]);

        if (movResults.affectedRows === 0) {
            throw new Error('Movie Id not found.')
        }
        await connection.commit();
        console.log('Transaction successful!');
        return { charResults, movResults };
    }
    catch (error) {
        await connection.rollback();
        console.error('Transaction failed, all changes reverted:', error.message);
    }
    finally {
        await connection.end();
    }
}


//saving updates for movies
async function saveMovieEdits(id, moviename, director, producer, runtime, topic, age, releasedate) {
    const sql = `UPDATE movies
        SET title=?,
        director=?,
        producer=?,
        topic=?,
        age=?,
        runtime=?,
        releaseDate=?
        WHERE id=?
    `;
    try {
        const [row] = await pool.execute(sql, [moviename, director, producer, topic, age, runtime, releasedate, id]);
        return row;
    }
    catch (error) {
        console.error("Database error");
    }
}

//find chat partner
async function findChatPartner(userId) {
    const sql = `SELECT username,id
     from users 
     where uuid=UUID_TO_BIN(?)`;
    try {
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    }
    catch (error) {
        console.error("error occured ", error);
        throw error;
    }
}

//search for users
async function searchUsers(query, limit = 20, offset = 0) {
    const searchItem = `%${query}%`;
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);
    // We use a LEFT JOIN to get users even if they have no bookings
    const sql = `
      SELECT 
        u.username, u.email, u.phone,
        b.eventDate, b.status AS bookingStatus
      FROM users u
      LEFT JOIN booking b ON u.phone = b.phoneNumber
      WHERE u.username LIKE ? 
         OR u.email LIKE ? 
         OR u.phone LIKE ?   
      ORDER BY b.eventDate ASC
      LIMIT ? OFFSET ?`;

    try {
        // execute() handles placeholders (?) to prevent SQL Injection
        const [results] = await pool.execute(sql, [
            searchItem,
            searchItem,
            searchItem,
            safeLimit,
            safeOffset
        ]);
        return results;
    } catch (error) {
        console.error("Search Error:", error);
        throw error;
    }
}

//find notification sent to specific user
async function findNotification(id) {
    const sql = `SELECT * 
        FROM notifications
        WHERE senderId=? OR receiverId=?
    `;
    try {
        const [rows] = await pool.execute(sql, [id, id]);
        return rows;
    }
    catch (error) {
        console.error("Database error");
    }
}

// find messages sent to specific user
async function findMessages(senderId, receiverId) {
    const sql = `SELECT *
        FROM messages
        WHERE (senderId=? AND receiverId=?)
        OR    (senderId=? AND receiverId=?)
        ORDER BY CreatedAt ASC
    `;
    try {
        const [rows] = await pool.execute(sql, [senderId, receiverId, receiverId, senderId]);
        return rows;
    }
    catch (error) {
        console.error("Database error")
        throw error
    }
}

async function findMessagewrapper(myUUID) {
    const sql = `
    SELECT 
      m.id,
      m.message,
      m.CreatedAt,
      -- Use BIN_TO_UUID so the frontend gets a readable string
      BIN_TO_UUID(m.senderUUID) as senderUUID, 
      BIN_TO_UUID(m.receiverUUID) as receiverUUID,

      CASE 
        WHEN m.senderUUID = UUID_TO_BIN(?) THEN u_receiver.username
        ELSE u_sender.username
      END AS username,

      CASE 
        WHEN m.senderUUID = UUID_TO_BIN(?) THEN BIN_TO_UUID(m.receiverUUID)
        ELSE BIN_TO_UUID(m.senderUUID)
      END AS otherUserId

    FROM messages m
    LEFT JOIN users u_sender ON u_sender.uuid = m.senderUUID
    LEFT JOIN users u_receiver ON u_receiver.uuid = m.receiverUUID
    
    -- MUST use UUID_TO_BIN here
    WHERE m.senderUUID = UUID_TO_BIN(?) OR m.receiverUUID = UUID_TO_BIN(?)

    ORDER BY m.CreatedAt DESC
  `;

    try {
        const [rows] = await pool.execute(sql, [myUUID, myUUID, myUUID, myUUID]);
        return rows;
    } catch (error) {
        console.error("Database error", error);
        throw error;
    }
}

//find sent notifications
async function findNotifications(myUUID) {
    const sql = `
    SELECT 
      n.id,
      n.note,
      n.CreatedAt,
      
      BIN_TO_UUID(n.senderUUID) as senderUUID, 
      BIN_TO_UUID(n.receiverUUID) as receiverUUID,

      CASE 
        WHEN n.senderUUID = UUID_TO_BIN(?) THEN u_receiver.username
        ELSE u_sender.username
      END AS username,

      CASE 
        WHEN n.senderUUID = UUID_TO_BIN(?) THEN BIN_TO_UUID(n.receiverUUID)
        ELSE BIN_TO_UUID(n.senderUUID)
      END AS otherUserId

    FROM notifications n
    LEFT JOIN users u_sender ON u_sender.uuid = n.senderUUID
    LEFT JOIN users u_receiver ON u_receiver.uuid = n.receiverUUID
    
    WHERE n.senderUUID = UUID_TO_BIN(?) OR n.receiverUUID = UUID_TO_BIN(?)

    ORDER BY n.CreatedAt DESC
  `;
    try {
        const [rows] = await pool.execute(sql, [myUUID, myUUID, myUUID, myUUID]);
        return rows;
    }
    catch (error) {
        console.error("Database error")
    }
}

//convert uuid to hexadecimal to send to frontend
async function findOne(query) {
    const sql = `SELECT BIN_TO_UUID(uuid) AS userId,username,email,phone
    FROM users 
    WHERE email=? OR phone=?
    LIMIT 1
    `;
    try {
        const [rows] = await pool.execute(sql, [query, query])
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//find sender uuid
async function findMyUid(email) {
    const sql = `SELECT BIN_TO_UUID(uuid) AS senderId,username
    FROM users
    WHERE email=?
    `;
    try {
        const [row] = await pool.execute(sql, [email]);
        return row
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//find and display userrs chat with
async function findChatPeople(myid) {
    const sql = `SELECT DISTINCT 
    BIN_TO_UUID(u.uuid) as uuid, 
    u.username 
    FROM users u
    JOIN messages m ON (u.uuid = m.senderId OR u.uuid = m.receiverId)
    WHERE (m.senderId = UUID_TO_BIN(?) OR m.receiverId = UUID_TO_BIN(?))
    AND u.uuid != UUID_TO_BIN(?)`;
    try {
        const [rows] = await pool.execute(sql, [myid]);
        return rows
    }
    catch (error) {
        console.error("Database error");
        throw error;
    }
}

//delete movie
async function deleteMovie(id) {
    const sql = `DELETE
     FROM movies 
     WHERE id=?`
    try {
        const [row] = await pool.execute(sql, [id]);
        return row
    }
    catch (error) {
        console.error("Delete Error ", error);
        throw error
    }
}


//export all functions by default
module.exports = {
    registerUser,
    getUser,
    getEventPoster,
    getUserProfileDetails,
    addNewCharacter,
    updateProfilePhoto,
    updateMemberRole,
    updateMemberlevel,
    newBookingRequest,
    updateBookingRequestStatus,
    updateUserName,
    updateUserPhone,
    UpdateMoviePoster,
    updateUserPassword,
    sendMessage,
    sendNotification,
    saveEdits,
    saveMovieEdits,
    getUserPassword,
    getUsersRequests,
    getAllEventRequests,
    getMovies,
    getAdmins,
    getMembers,
    getallusers,
    getActors,
    getActorWords,
    getMovieData,
    countAllUsers,
    countMembers,
    searchUsers,
    newMovie,
    newFeedback,
    newJoinRequest,
    getAllJoinRequests,
    newEventPoster,
    newActor,
    countAllSentRequests,
    countJoinings,
    countBookingRequests,
    countJoinRequests,
    countPerformance,
    countPostedMovie,
    getFeedbacks,
    userExists,
    findChatPartner,
    findNotification,
    findNotifications,
    findMessages,
    findMoviePoster,
    deleteMovie,
    findOne,
    findMyUid,
    findChatPeople,
    findMessagewrapper,
    findMovieName,

};

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to the MySQL "charity" database!');
        connection.release();
    }
});
