const express = require("express");
const { ethers } = require("ethers");
const { RouterOSClient } = require("routeros-client");

const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;//your port


app.set("trust proxy", true);

//MikroTik
const MIKROTIK_HOST = "yourrouteraddress"; //router address
const MIKROTIK_USER = "yourlogin"; //router login
const MIKROTIK_PASS = "yourpassword"; //router password

const client = new RouterOSClient({
    host: MIKROTIK_HOST,
    user: MIKROTIK_USER,
    password: MIKROTIK_PASS,
});

let api = null;

async function getApi() {
    if (!api) {
        api = await client.connect();
        console.log("MikroTik connected");
    }
    return api;
}

client.on("error", (err) => {
    console.log("RouterOS error:", err.message);
    api = null;
});

//Ethereum

const provider = new ethers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com"
);

const contractAddress = "yoursmartcontractaddress"; //smart contract address

const abi = [
    "function sessions(address) view returns (uint startTime, bool active)",
    "function balances(address) view returns (uint)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

//STATE
const activeUsers = new Set();
const ipToWallet = new Map();
const walletToIp = new Map();
const lastState = new Map();

//MikroTik control

async function blockInternet(ip) {
    if (!ip || ip === "127.0.0.1") return;

    try {
        const api = await getApi();
        const list = api.menu("/ip/firewall/address-list");

        const items = await list.where({
            list: "blocked",
            address: ip,
        }).get();

        if (!items.length) {
            await list.add({
                list: "blocked",
                address: ip,
            });

            console.log("BLOCK:", ip);
        }

    } catch (e) {
        console.log("block error:", e.message);
    }
}

async function allowInternet(ip) {
    if (!ip || ip === "127.0.0.1") return;

    try {
        const api = await getApi();
        const list = api.menu("/ip/firewall/address-list");

        const items = await list.where({
            list: "blocked",
            address: ip,
        }).get();

        for (const item of items) {
            await list.remove(item[".id"]);
        }

        console.log("ALLOW:", ip);

    } catch (e) {
        console.log("allow error:", e.message);
    }
}

//UI

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "index.html")
    );
});

//CHECK ACCESS


app.get("/check", async (req, res) => {
    const address = req.query.address?.toLowerCase();

    //real IP detection
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

    if (!address) return res.json({ access: false });

    try {
        const session = await contract.sessions(address);
        const balance = await contract.balances(address);

        const access = session.active && balance > 0n;

        ipToWallet.set(ip, address);
        walletToIp.set(address, ip);

        console.log("LINK:", ip, "→", address);

        const prev = lastState.get(address);

        //ALLOW
        if (access) {
            await allowInternet(ip);
            activeUsers.add(address);
        }

        //SESSION ENDED
        if (prev === true && access === false) {
            console.log("SESSION ENDED:", address);

            await blockInternet(ip);
            activeUsers.delete(address);
        }

        lastState.set(address, access);

        res.json({ access, ip, wallet: address });

    } catch (e) {
        console.log("ERROR:", e.message);
        res.json({ access: false });
    }
});

//MONITOR

setInterval(async () => {
    for (const address of activeUsers) {
        try {
            const session = await contract.sessions(address);
            const balance = await contract.balances(address);

            const stillActive = session.active && balance > 0n;

            const ip = walletToIp.get(address);

            if (!stillActive) {
                console.log("FORCE DISCONNECT:", address);

                activeUsers.delete(address);
                lastState.set(address, false);

                if (ip) {
                    await blockInternet(ip);
                }
            }

        } catch (e) {
            console.log("monitor error:", e.message);
        }
    }
}, 10000);

//START

app.listen(PORT, "0.0.0.0", async () => {
    console.log("Server running");
});
