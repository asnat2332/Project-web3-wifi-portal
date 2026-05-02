# Web3 Wi-Fi Portal

## English

### Overview

Web3 Wi-Fi Portal is a decentralized internet access control system that combines blockchain technology with MikroTik router management.

Users can connect their crypto wallet, deposit ETH, and gain or lose internet access depending on their on-chain session status and balance.

The system uses Ethereum smart contracts to track sessions and a Node.js backend to enforce access rules on a MikroTik router.

---

### How it works

1. User connects MetaMask wallet
2. User deposits ETH into smart contract
3. User starts a session
4. Backend checks:
   - session status (active/inactive)
   - wallet balance
5. If valid → internet access is allowed
6. If invalid → user is blocked via MikroTik firewall

---

### Tech Stack

- Node.js
- Express.js
- ethers.js
- Ethereum (Sepolia testnet)
- MikroTik RouterOS API
- MetaMask

---

### Architecture

User → Frontend UI → Backend Server → Smart Contract  
                                ↓  
                        MikroTik Router (Firewall Control)

---

### Disclaimer

This is a **student/learning project** and is not intended for production use.

It does not include:
- advanced security hardening
- rate limiting
- anti-abuse protection

---

## Česky

### Přehled

Web3 Wi-Fi Portal je decentralizovaný systém pro řízení přístupu k internetu, který kombinuje blockchain technologii a správu MikroTik routeru.

Uživatelé mohou připojit svou kryptoměnovou peněženku, vložit ETH a získat nebo ztratit přístup k internetu podle stavu své on-chain relace a zůstatku.

Systém využívá smart kontrakty na Ethereum pro sledování relací a Node.js backend pro řízení přístupu na MikroTik routeru.

---

### Jak to funguje

1. Uživatel připojí MetaMask peněženku
2. Uživatel vloží ETH do smart kontraktu
3. Uživatel spustí relaci
4. Backend kontroluje:
   - stav relace (aktivní/neaktivní)
   - zůstatek peněženky
5. Pokud je vše v pořádku → internet je povolen
6. Pokud ne → uživatel je blokován přes firewall MikroTik

---

### Technologie

- Node.js
- Express.js
- ethers.js
- Ethereum (Sepolia testnet)
- MikroTik RouterOS API
- MetaMask

---

### Architektura

Uživatel → Frontend UI → Backend server → Smart kontrakt  
                                     ↓  
                            MikroTik router (řízení firewallu)

---

### Upozornění

Toto je **studentský / výukový projekt** a není určen pro produkční použití.

Neobsahuje:
- pokročilé zabezpečení
- ochranu proti zneužití
- rate limiting

## Installation

1. Installation
git clone https://github.com/your-username/Project-web3-wifi-portal.git
cd web3-wifi-portal
npm install

2. Enter your details in the server file
- PORT=3000
- MIKROTIK_HOST=your_router_ip
- MIKROTIK_USER=your_login
- MIKROTIK_PASS=your_password
- CONTRACT_ADDRESS=your_contract_address

3. Run project
node index.js

4. Requirements
- Node.js >= 18
- npm
- MetaMask extension
- MikroTik router access (API enabled)

Browsers block wallet access on non-secure (HTTP) connections.

For local development, you can use tools like:
- localtunnel (https://localtunnel.me)
- ngrok

Example:
lt --port 3000

This will generate a public HTTPS URL like:
https://your-project.loca.lt
