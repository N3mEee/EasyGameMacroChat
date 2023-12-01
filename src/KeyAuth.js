import axios from "axios";
//* Importing OS *//
import os from "os";

//* KeyAuth Class *//
export default class KeyAuth {
  /**
   * @param {string} [name] - The name of the application
   * @param {string} [ownerId] - The ownerId of the application
   * @param {string} [secret] - The secret of the application
   * @param {string} [version] - The version of the application
   **/
  constructor(name, ownerId, secret, version) {
    if (!(name && ownerId && secret && version)) {
      Misc.error("Application not setup correctly.");
    }

    this.name = name;
    this.ownerId = ownerId;
    this.secret = secret;
    this.version = version;
    this.responseTime = null;
  }

  /**
   * Initializes the connection with KeyAuth in order to use any of the functions
   **/
  Initialize = () =>
    new Promise(async (resolve) => {
      const post_data = {
        type: "init",
        ver: this.version,
        name: this.name,
        ownerid: this.ownerId,
      };

      const Json = await this.make_request(post_data);

      if (Json === "KeyAuth_Invalid") {
        Misc.error(
          "Invalid Application, please check your application details."
        );
      }

      if (!Json.success || Json.success == false) {
        return resolve(false);
      }

      this.app_data = Json.appinfo;

      this.sessionid = Json.sessionid;
      this.initialized = true;

      resolve(true);
    });

  /**
   * Authenticates the user using their username and password
   * @param {string} [username] - The username for the user
   * @param {string} [password] - The password for the user
   **/
  login = (username, password) =>
    new Promise(async (resolve) => {
      this.check_initialize();

      let hwId;
      if (!hwId) {
        hwId = Misc.GetCurrentHardwareId();
      }

      const post_data = {
        type: "login",
        username,
        pass: password,
        hwid: hwId,
        sessionid: this.sessionid,
        name: this.name,
        ownerid: this.ownerId,
      };

      const Json = await this.make_request(post_data);

      this.Load_Response_Struct(Json);
      if (Json.success && Json.success == true) {
        if (
          Json.info.username === "DEV-N3mE" ||
          Json.info.username === "bysabo"
        ) {
          this.Load_User_Data(Json.info);
          return resolve(Json);
        }
      } else {
        Misc.error(Json.message);
        return resolve(Json.message);
      }
    });

  /**
   * Gets the last 20 sent messages of that channel
   * @param {string} [ChannelName] - The name of the channel, where you want the messages
   * Returns {array} the last 20 sent messages of that channel
   **/
  ChatGet = (ChannelName) =>
    new Promise(async (resolve) => {
      this.check_initialize();

      const post_data = {
        type: "chatget",
        channel: ChannelName,
        sessionid: this.sessionid,
        name: this.name,
        ownerid: this.ownerId,
      };

      const Json = await this.make_request(post_data);

      this.Load_Response_Struct(Json);
      if (Json.success && Json.success == true) {
        if (Json.messages[0].message == "not_found") {
          return resolve([]);
        } else {
          return resolve(Json.messages);
        }
      } else {
        return resolve([]);
      }
    });

  /**
   * Sends a message to the given channel name
   * @param {string} [ChannelName] - Channel Name where the message will be sent to
   * @param {string} [Message] - Message what will be sent to [ChannelName]
   * Returns {bool} - Returns true if the message was sent, otherwise false
   **/
  ChatSend = (ChannelName, Message) =>
    new Promise(async (resolve) => {
      this.check_initialize();

      const post_data = {
        type: "chatsend",
        message: Message,
        channel: ChannelName,
        sessionid: this.sessionid,
        name: this.name,
        ownerid: this.ownerId,
      };

      const Json = await this.make_request(post_data);

      this.Load_Response_Struct(Json);
      if (Json.success && Json.success == true) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    });

  /**
   * Check if the current session is initialized
   * @returns [true] if client is Initialized.
   **/
  check_initialize() {
    if (!this.initialized) {
      Misc.error("You must initialize the API before using it!");
    }
    return true;
  }

  /**
   * Load the response struct for Response of Request
   **/
  Load_Response_Struct(data) {
    this.response = {
      success: data.success,
      message: data.message,
    };
  }

  /**
   * Load the response struct for User Data
   **/
  Load_User_Data(data) {
    this.user_data = {
      username: data.username,
      ip: data.ip,
      hwid: data.hwid,
      createdate: data.createdate,
      lastlogin: data.lastlogin,
      subscriptions: data.subscriptions,
    };
  }

  /**
   * Change Console Application Title
   * @param {string} [title] - Your new Title for the App
   * Returns Promise Timeout
   **/
  setTitle(title) {
    process.stdout.write(
      String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
  }

  /**
   * Sleeping / Timeout Function
   * @param {number} [ms] - Time in milliseconds
   * Returns Promise Timeout
   **/
  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Request the API with the POST Data
   * @param {string} [data] - Post Data Array
   * Returns {array} - Returns the API Response [NON-ENCRYPTED]
   **/
  make_request(data) {
    const startTime = Date.now(); // Start the stopwatch

    return new Promise(async (resolve) => {
      const request = await axios({
        method: "POST",
        url: "https://keyauth.win/api/1.2/",
        data: new URLSearchParams(data).toString(),
      });

      const endTime = Date.now(); // Stop the stopwatch

      this.responseTime = `${endTime - startTime} ms`;
      if (request && request.data) {
        resolve(request.data);
      } else {
        resolve(null);
      }
    });
  }
}

class Misc {
  /**
   * Get the current user HardwareId
   * @returns {string} - Returns user HardwareID
   **/
  static GetCurrentHardwareId() {
    return process.env.HWID;
  }

  /**
   * Error Print Function
   * @param {string} [message] - Message to Show and then exit app.
   **/
  static error(message) {
    console.error(message);
  }
}

/**
 * Export KeyAuth Class to be used in other files
 **/
