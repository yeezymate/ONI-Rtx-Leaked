const { Authflow, Titles } = require("prismarine-auth")
const { RealmAPI } = require("prismarine-realms")
const { createClient } = require("bedrock-protocol")
let cmd = (message) => ({
    command: `/me ${message}`,
    internal: false,
    version: 76,
    origin: {
        type: 5,
        uuid: "0",
        request_id: "0",
    }
})
let flow = new Authflow("", "profiles")
let api = RealmAPI.from(flow, "bedrock")
let code = "vpVt7M5K2oE" // or code
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
    let closed
    let cleanUp = (packet) => {
        client.removeAllListeners()
        if (closed) return
        closed = true
        console.log(packet)
    }
    client.once("play_status", () => {
        let intervalId = setInterval(() => client.queue("command_request", cmd("§4§l Rtx On Top !§b dsc.gg/qesYMhEM ")), 20)
        setTimeout(() => {
            client.close()
            clearInterval(intervalId)
        }, 10000) //10billion seconds
    })
    client.on('close', (packet) => cleanUp(packet))
    client.on('error', (packet) => cleanUp(packet))
    client.on('disconnect', (packet) => cleanUp(packet))
    client.on('kick', (packet) => cleanUp(packet))
})