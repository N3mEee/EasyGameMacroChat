import "./style.css";
import KeyAuth from "./KeyAuth.js";

const payed = 0;
const status = document.querySelector(".status");
const chatContent = document.querySelector(".chat-content");
const chatInputMessage = document.querySelector(".chat-input");
const loginForm = document.querySelector("#login");
const login = document.querySelector(".login");
login.style.display = "none";
const KeyAuthApp = new KeyAuth(
    process.env.APP_NAME, // Application Name
    process.env.OWNER_ID, // OwnerID
    process.env.APP_SECRET_KEY, // Application Secret
    process.env.VERSION // Application Version
);

(async () => {
    console.log("Initializing...");
    status.textContent = "Initializing...";
    let initializeData = await KeyAuthApp.Initialize();
    if (initializeData) {
        login.style.display = "";
        console.log("Successfully initialized");
        status.textContent = "Successfully initialized";

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Trying to login...");
            status.textContent = "Trying to login...";
            let username = e.target[0].value;
            let password = e.target[1].value;
            let loginData = await KeyAuthApp.login(username, password);
            if (loginData.success) {
                console.log(`Logged in as: ${loginData.info.username}`);
                status.textContent = `Logged in as: ${loginData.info.username}`;
                Dashboard();
                login.remove(); //remove login form
            } else {
                status.textContent = loginData;
            }
        });

        async function Dashboard() {
            loadChat();
            setInterval(async () => {
                await loadChat();
            }, 10000);

            const options = { method: "GET", headers: { accept: "application/json" } };
            let data = await fetch(
                `https://keyauth.win/api/seller/?sellerkey=${process.env.SELLER_KEY}&type=fetchallkeys&format=format`,
                options
            )
                .then((response) => response.json())
                .then((response) => response)
                .catch((err) => console.error(err));

            let keysBySabo = data.keys.filter((key) => key.genby === "bysabo");
            let keysUsed = keysBySabo.filter((key) => key.status === "Used");
            let oneDayKeys = keysUsed.filter((key) => key.expires === "86400");
            let oneWeekKeys = keysUsed.filter((key) => key.expires === "604800");
            let oneMonthKeys = keysUsed.filter((key) => key.expires === "2592000");
            let lifetimeKeys = keysUsed.filter((key) => key.expires === "863910000");

            const info = document.querySelector(".info");
            let keysInfo = document.createElement("div");
            info.appendChild(keysInfo);

            let oneDayKeysUsed = document.createElement("div");
            keysInfo.appendChild(oneDayKeysUsed);
            oneDayKeysUsed.textContent = `Day sold (0.5): ${oneDayKeys.length}`;

            let oneWeekKeysUsed = document.createElement("div");
            keysInfo.appendChild(oneWeekKeysUsed);
            oneWeekKeysUsed.textContent = `Week sold (2.5): ${oneWeekKeys.length}`;

            let oneMonthKeysUsed = document.createElement("div");
            keysInfo.appendChild(oneMonthKeysUsed);
            oneMonthKeysUsed.textContent = `Month sold (5.5): ${oneMonthKeys.length}`;

            let lifetimeKeysUsed = document.createElement("div");
            keysInfo.appendChild(lifetimeKeysUsed);
            lifetimeKeysUsed.textContent = `LifeTime sold (20): ${lifetimeKeys.length}`;

            createDash(keysInfo);

            let totalKeysUsed = document.createElement("div");
            keysInfo.appendChild(totalKeysUsed);
            totalKeysUsed.textContent = `Total keys sold: ${keysUsed.length}`;

            createDash(keysInfo);

            let payedKeys = document.createElement("div");
            keysInfo.appendChild(payedKeys);
            payedKeys.textContent = `Payed: - ${payed}`;

            createDash(keysInfo);

            let totalSold = document.createElement("div");
            keysInfo.appendChild(totalSold);
            let ammount =
                oneDayKeys.length * 0.5 +
                oneWeekKeys.length * 2.5 +
                oneMonthKeys.length * 5.5 +
                lifetimeKeys.length * 20 -
                payed;
            totalSold.textContent = `To Pay: ${ammount}`;
            totalSold.classList.add("topay");
            totalSold.style.color = "green";

            getUsersOnline();

            const chatInput = document.createElement("input");
            chatInput.type = "text";
            chatInput.id = "chatInput";
            chatInput.name = "chatInput";

            const sendMessage = document.createElement("button");
            sendMessage.textContent = "Send Message";
            chatInputMessage.appendChild(chatInput);
            chatInputMessage.appendChild(sendMessage);

            sendMessage.addEventListener("click", async (e) => {
                e.preventDefault();
                await KeyAuthApp.ChatSend(process.env.CHAT_NAME, chatInput.value);
                loadChat();
            });

            async function loadChat() {
                console.log("Loading chat...");
                let chat = await KeyAuthApp.ChatGet(process.env.CHAT_NAME);
                if (chat.length > 0) {
                    while (chatContent.firstChild) {
                        chatContent.removeChild(chatContent.firstChild);
                    }

                    chat.forEach((message) => {
                        let chatTime = document.createElement("div");
                        let chatAuthor = document.createElement("div");
                        let chatMessage = document.createElement("div");

                        let date = new Date(message.timestamp * 1000);
                        chatTime.textContent = `${date.getUTCDate()}/${date.getMonth() + 1} ${date.getHours()}:${pad(
                            date.getMinutes()
                        )}`;
                        chatAuthor.textContent = message.author;
                        chatMessage.textContent = message.message;

                        chatContent.appendChild(chatTime);
                        chatContent.appendChild(chatAuthor);
                        chatContent.appendChild(chatMessage);
                    });
                    console.log("Chat loaded successfully");
                    chatContent.scroll(0, chatContent.scrollHeight);
                }
            }

            function pad(d) {
                return d < 10 ? "0" + d.toString() : d.toString();
            }
            async function getUsersOnline() {
                const info = document.querySelector(".info");
                let usersOnline = await KeyAuthApp.fetchOnline();
                let onlineUsers = document.createElement("div");
                onlineUsers.textContent = `Users online: ${usersOnline.length}`;
                info.appendChild(onlineUsers);
            }

            function createDash(parrent) {
                let dash = document.createElement("div");
                parrent.appendChild(dash);
                dash.textContent = `---------------------`;
            }
        }
    }
})();
