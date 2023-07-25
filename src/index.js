import "./style.css";
import KeyAuth from "./KeyAuth.js";

const status = document.querySelector(".status");
const body = document.querySelector("body");
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
            oneDayKeysUsed.textContent = `Day sold: ${oneDayKeys.length}`;

            let oneWeekKeysUsed = document.createElement("div");
            keysInfo.appendChild(oneWeekKeysUsed);
            oneWeekKeysUsed.textContent = `Week sold: ${oneWeekKeys.length}`;

            let oneMonthKeysUsed = document.createElement("div");
            keysInfo.appendChild(oneMonthKeysUsed);
            oneMonthKeysUsed.textContent = `Month sold: ${oneMonthKeys.length}`;

            let lifetimeKeysUsed = document.createElement("div");
            keysInfo.appendChild(lifetimeKeysUsed);
            lifetimeKeysUsed.textContent = `LifeTime sold: ${lifetimeKeys.length}`;

            let dash = document.createElement("div");
            keysInfo.appendChild(dash);
            dash.textContent = `---------------------`;

            let totalKeysUsed = document.createElement("div");
            keysInfo.appendChild(totalKeysUsed);
            totalKeysUsed.textContent = `Total sold: ${keysUsed.length}`;
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
                // console.log("Loading chat...");
                // status.textContent = "Loading chat...";

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

                        chatTime.textContent = `${date.getUTCDate()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes()}`;
                        chatAuthor.textContent = message.author;
                        chatMessage.textContent = message.message;

                        chatContent.appendChild(chatTime);
                        chatContent.appendChild(chatAuthor);
                        chatContent.appendChild(chatMessage);
                    });
                    // status.textContent = "Chat loaded successfully";
                    // console.log("Chat loaded successfully");
                }
            }

            async function getUsersOnline() {
                const info = document.querySelector(".info");
                let usersOnline = await KeyAuthApp.fetchOnline();
                let onlineUsers = document.createElement("div");
                onlineUsers.textContent = `Users online: ${usersOnline.length}`;
                info.appendChild(onlineUsers);
            }
        }
    }
})();
