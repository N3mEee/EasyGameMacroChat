import "./style.css";
import KeyAuth from "./KeyAuth.js";

const payed = 62;
const statusElement = document.querySelector(".status");
const chatContentElement = document.querySelector(".chat-content");
const chatInputMessageElement = document.querySelector(".chat-input");
const loginForm = document.querySelector("#login");
const loginContainer = document.querySelector(".login");
loginContainer.style.display = "none";

const KeyAuthApp = new KeyAuth(
    process.env.APP_NAME,
    process.env.OWNER_ID,
    process.env.APP_SECRET_KEY,
    process.env.VERSION
);

const initializeApp = async () => {
    console.log("Initializing...");
    statusElement.textContent = "Initializing...";
    const initializeData = await KeyAuthApp.Initialize();
    if (initializeData) {
        loginContainer.style.display = "";
        console.log("Successfully initialized");
        statusElement.textContent = "Successfully initialized";

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            e.target[2].disabled = true;
            console.log("Trying to login...");
            statusElement.textContent = "Trying to login...";
            const username = e.target.username.value;
            const password = e.target.password.value;
            const loginData = await KeyAuthApp.login(username, password);
            if (loginData.success) {
                console.log(`Logged in as: ${loginData.info.username}`);
                statusElement.textContent = `Logged in as: ${loginData.info.username}`;
                Dashboard();
                loginContainer.remove(); // Remove login form
            } else {
                statusElement.textContent = loginData;
            }
            e.target[2].disabled = false;
        });

        async function Dashboard() {
            loadChat();
            setInterval(loadChat, 10000);

            const options = { method: "GET", headers: { accept: "application/json" } };
            let data = await fetch(
                `https://keyauth.win/api/seller/?sellerkey=${process.env.SELLER_KEY}&type=fetchallkeys&format=format`,
                options
            )
                .then((response) => response.json())
                .catch((err) => console.error(err));

            const keysBySabo = data.keys.filter((key) => key.genby === "bysabo");
            const keysUsed = keysBySabo.filter((key) => key.status === "Used");
            const oneDayKeys = keysUsed.filter((key) => key.expires === "86400");
            const oneWeekKeys = keysUsed.filter((key) => key.expires === "604800");
            const oneMonthKeys = keysUsed.filter((key) => key.expires === "2592000");
            const lifetimeKeys = keysUsed.filter((key) => key.expires === "863910000");

            const info = document.querySelector(".info");
            const keysInfo = document.createElement("div");
            info.appendChild(keysInfo);

            function createInfoDiv(text, className) {
                const infoDiv = document.createElement("div");
                keysInfo.appendChild(infoDiv);
                infoDiv.textContent = text;
                className ? infoDiv.classList.add(className) : "";
            }

            createInfoDiv(``, `dash`);
            createInfoDiv(`Day sold (0.5): ${oneDayKeys.length}`);
            createInfoDiv(`Week sold (2.5): ${oneWeekKeys.length}`);
            createInfoDiv(`Month sold (5.5): ${oneMonthKeys.length}`);
            createInfoDiv(`LifeTime sold (20): ${lifetimeKeys.length}`);
            createInfoDiv(`Total keys sold: ${keysUsed.length}`);
            createInfoDiv(``, `dash`);

            createInfoDiv(`Payed: - ${payed}`);

            const totalSold = document.createElement("div");
            keysInfo.appendChild(totalSold);
            const amount =
                oneDayKeys.length * 0.5 +
                oneWeekKeys.length * 2.5 +
                oneMonthKeys.length * 5.5 +
                lifetimeKeys.length * 20 -
                payed;
            totalSold.textContent = `To Pay: ${amount}`;
            totalSold.classList.add("topay");
            createInfoDiv(``, `dash`);
            getUsersOnline();

            const chatInput = document.createElement("input");
            chatInput.type = "text";
            chatInput.id = "chatInput";
            chatInput.name = "chatInput";

            const sendMessage = document.createElement("button");
            sendMessage.textContent = "Send Message";
            chatInputMessageElement.appendChild(chatInput);
            chatInputMessageElement.appendChild(sendMessage);

            sendMessage.addEventListener("click", async (e) => {
                e.preventDefault();
                await KeyAuthApp.ChatSend(process.env.CHAT_NAME, chatInput.value);
                loadChat();
            });

            async function loadChat() {
                console.log("Loading chat...");
                let chat = await KeyAuthApp.ChatGet(process.env.CHAT_NAME);
                if (chat.length > 0) {
                    chatContentElement.innerHTML = ""; // Clear existing chat messages
                    chat.forEach((message) => {
                        const chatMessageWrapper = document.createElement("div");
                        chatMessageWrapper.classList.add("chat-message");

                        const chatTime = document.createElement("div");
                        chatTime.classList.add("chat-time");
                        const chatAuthor = document.createElement("div");
                        chatAuthor.classList.add("chat-author");
                        const chatMessage = document.createElement("div");
                        chatMessage.classList.add("chat-text");

                        const date = new Date(message.timestamp * 1000);
                        chatTime.textContent = `${date.getUTCDate()}/${date.getMonth() + 1} ${date.getHours()}:${pad(
                            date.getMinutes()
                        )}`;
                        chatAuthor.textContent = message.author;
                        chatMessage.textContent = message.message;

                        chatMessageWrapper.appendChild(chatTime);
                        chatMessageWrapper.appendChild(chatAuthor);
                        chatMessageWrapper.appendChild(chatMessage);

                        chatContentElement.appendChild(chatMessageWrapper);
                    });
                    console.log("Chat loaded successfully");
                    chatContentElement.scroll(0, chatContentElement.scrollHeight);
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
        }
    }
};

initializeApp();
