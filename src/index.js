import "./style.css";
import KeyAuth from "./KeyAuth.js";

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
            chatTime.textContent = `${date.getUTCDate()}/${
              date.getMonth() + 1
            } ${date.getHours()}:${pad(date.getMinutes())}`;
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
    }
  }
};

initializeApp();
