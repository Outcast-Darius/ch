
const API_URL = 'http://localhost:5000' || "http://127.0.0.1:5000";


const username = document.getElementById("user");
const userphone = document.getElementById("phonenumber");
const evenue = document.getElementById("eVenue");
const edate = document.getElementById("eDate");
const eType = document.getElementById("eType");
const eCat = document.getElementById("eCategory");
const edesc = document.getElementById("eDescription")
const bookingBtn = document.getElementById("bookingBtn");


function validateInput(user, phone, loc, date, eventType, category,description) {
    if (!user || !phone || !loc || !date || !eventType || !category ||!description ) {
        alert("all fields are required");
        return false;
    }
    return true;
};

if (bookingBtn) {
    bookingBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const user = username.value;
        const phone = userphone.value;
        const loc = evenue.value;
        const date = edate.value;
        const eventType = eType.value;
        const category = eCat.value;
        const description = edesc.value;
        if (!(validateInput(user, phone, loc, date, eventType, category,description))) {
            return;
        }

        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/newHire`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ user, phone, loc, date, eventType, category, description })
            });
            if(response.ok){
                console.log("Booking request succesfully sent");
                alert("Booking request succesfully sent.");
               // document.querySelector(".bookingForm").reset()
                window.location.href=`${window.location.origin}/public/requests.html`
            }
            else{
                const errorText=await response.json();
                console.error("Error occured ",errorText);
                alert(`Submission failed ${errorText.message}`);
            }
        }
        catch (error) {
            console.error(error);
            alert("Network error occured");
            throw error;
        }
    });
}
