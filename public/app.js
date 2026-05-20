let signer;
let userAddress;
let contract;

const abi = [
    "function startSession()",
    "function endSession()",
    "function deposit() payable"
];

function showLoader(show){

    document.getElementById("loader")
        .style.display = show
            ? "block"
            : "none";
}

async function connectWallet(){

    if(!window.ethereum){
        alert("MetaMask not found");
        return;
    }

    try{

        showLoader(true);

        const accounts =
            await window.ethereum.request({
                method:"eth_requestAccounts"
            });

        const provider =
            new ethers.BrowserProvider(
                window.ethereum
            );

        signer = await provider.getSigner();

        userAddress = accounts[0];

        contract = new ethers.Contract(
            contractAddress,
            abi,
            signer
        );

        document.getElementById("wallet")
            .innerText = userAddress;

    }catch(e){

        console.log(e);

        alert("Wallet connection failed");

    }finally{

        showLoader(false);
    }
}

async function deposit(){

    if(!contract){
        alert("Connect wallet first");
        return;
    }

    try{

        showLoader(true);

        const tx = await contract.deposit({
            value: ethers.parseEther("0.01")
        });

        await tx.wait();

        alert("Deposit completed");

    }catch(e){

        console.log(e);

        alert("Transaction failed");

    }finally{

        showLoader(false);
    }
}

async function startSession(){

    if(!contract){
        alert("Connect wallet first");
        return;
    }

    try{

        showLoader(true);

        const tx =
            await contract.startSession();

        await tx.wait();

        alert("Internet session started");

        checkAccess();

    }catch(e){

        console.log(e);

        alert("Cannot start session");

    }finally{

        showLoader(false);
    }
}

async function endSession(){

    if(!contract){
        alert("Connect wallet first");
        return;
    }

    try{

        showLoader(true);

        const tx =
            await contract.endSession();

        await tx.wait();

        alert("Session ended");

        checkAccess();

    }catch(e){

        console.log(e);

        alert("Cannot end session");

    }finally{

        showLoader(false);
    }
}

async function checkAccess(){

    if(!userAddress){
        alert("Connect wallet first");
        return;
    }

    try{

        const res = await fetch(
            "/check?address=" + userAddress
        );

        const data = await res.json();

        const dot =
            document.getElementById("statusDot");

        const text =
            document.getElementById("statusText");

        if(data.access){

            dot.classList.add("active");

            text.innerText =
                "Internet access granted";

        }else{

            dot.classList.remove("active");

            text.innerText =
                "No active access";
        }

    }catch(e){

        console.log(e);
    }
}
