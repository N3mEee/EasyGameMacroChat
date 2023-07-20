import "./style.css";
import KeyAuth from "./KeyAuth.js";

const status = document.querySelector(".status");
const chatContent = document.querySelector(".chat-content");
const chatInputMessage = document.querySelector(".chat-input");

const KeyAuthApp = new KeyAuth(
    process.env.APP_NAME, // Application Name
    process.env.OWNER_ID, // OwnerID
    process.env.APP_SECRET_KEY, // Application Secret
    process.env.VERSION // Application Version
);

(async () => {
    console.log("Initializing...");
    status.textContent = "Initializing...";
    await KeyAuthApp.Initialize();
    console.log("Successfully initialized");
    status.textContent = "Successfully initialized";
    console.log("Trying to login...");
    status.textContent = "Trying to login...";
    await KeyAuthApp.login(process.env.USERNAME, process.env.PASSWORD);
    console.log("Logged in");
    status.textContent = "Logged in";
    Dashboard();

    async function Dashboard() {
        loadChat();
        getUsersOnline();

        const chatInput = document.createElement("input");
        chatInput.type = "text";
        chatInput.id = "chatInput";
        chatInput.name = "chatInput";
        const sendMessage = document.createElement("button");
        sendMessage.textContent = "Send Message";
        chatInputMessage.appendChild(chatInput);
        chatInputMessage.appendChild(sendMessage);

        sendMessage.addEventListener("click", async (event) => {
            await KeyAuthApp.ChatSend(process.env.CHAT_NAME, chatInput.value);
            loadChat();
        });

        async function loadChat() {
            console.log("Loading chat...");
            status.textContent = "Loading chat...";

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
                status.textContent = "Chat loaded successfully";
                console.log("Chat loaded successfully");
            }
        }

        async function getUsersOnline() {
            let usersOnline = await KeyAuthApp.fetchOnline();
            let onlineUsers = document.createElement("div");
            onlineUsers.textContent = `Users online: ${usersOnline.length}`;
            status.appendChild(onlineUsers);
        }
    }
})();
