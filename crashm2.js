const { Authflow, Titles } = require("prismarine-auth");
const { RealmAPI } = require("prismarine-realms");
const { createClient } = require("bedrock-protocol");

// Command creator function
const cmd = (message) => ({
    command: `/me ${message}`,
    internal: false,
    version: 76,
    origin: {
        type: 5,
        uuid: "0",
        request_id: "0",
    }
});

// Authentication and realm setup
const flow = new Authflow("", "profiles");
const api = RealmAPI.from(flow, "bedrock");
const realmCode = "MknJJDuYbZg";

(async () => {
    try {
        // Get realm information
        const realm = realmCode.length < 10 
            ? await api.getRealm(realmCode) 
            : await api.getRealmFromInvite(realmCode);
        
        console.log("[+] Connected to realm:", realm.name);

        // Create client connection
        const client = createClient({
            username: "", // Add your username if needed
            profilesFolder: "profiles",
            realms: {
                realmId: realm.id
            }
        });

        let isConnected = false;

        // Cleanup function
        const cleanUp = (reason) => {
            if (!isConnected) return;
            isConnected = false;
            console.log(`[-] Disconnected: ${reason}`);
            client.removeAllListeners();
            client.close();
        };

        // Event handlers
        client.on('close', () => cleanUp("Connection closed"));
        client.on('error', (err) => cleanUp(`Error: ${err.message}`));
        client.on('disconnect', (packet) => cleanUp(`Kicked: ${packet.message}`));

        // Once connected, send the message
        client.once("play_status", () => {
            isConnected = true;
            console.log("[✓] Successfully joined the realm!");

            // Send the special message once
            client.queue("command_request", cmd("§0§o§l§kW"));

            // Optional: Send the advertisement message periodically
            const adInterval = setInterval(() => {
                client.queue("command_request", cmd("§d§l:heart: Your realm's in our database! Buy a whitelist at dsc.gg/qesYMhEM :heart:"));
            }, 10000); // Every 10 seconds

            // Auto-close after some time (optional)
            setTimeout(() => {
                if (isConnected) {
                    console.log("[!] Closing connection after timeout");
                    client.close();
                    clearInterval(adInterval);
                }
            }, 60000); // Close after 1 minute
        });

    } catch (error) {
        console.error("[X] Failed to join realm:", error.message);
    }
})();