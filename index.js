import { abi, contractAddress } from "./constant.js";
import("./ethers-5.6.esm.min.js")
  .then((module) => {
    const { ethers } = module;

    const connectButton = document.getElementById("connectButton");
    const fundButton = document.getElementById("fundButton");
    const balanceButton = document.getElementById("balanceButton");
    const withdrawButton = document.getElementById("withdrawButton");

    connectButton.onclick = connect;
    fundButton.onclick = fund;
    balanceButton.onclick = getBalance;
    withdrawButton.onclick = withdraw;

    async function connect() {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected Successfully";
      } else {
        connectButton.innerHTML = "Please install MetaMask";
      }
    }

    async function getBalance() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
      }
    }

    async function fund() {
      const ethAmount = document.getElementById("ethAmount").value;

      if (typeof window.ethereum !== "undefined") {
        console.log(`Funding with ${ethAmount}`);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
          const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
          });

          await listenForTransactionMine(transactionResponse, provider);
          console.log("Done");
        } catch (error) {
          console.log(error);
        }
      }
    }

    function listenForTransactionMine(transactionResponse, provider) {
      console.log(`Minning ${transactionResponse.hash}...`);
      return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
          console.log(
            `Completed with ${transactionReceipt.confirmations} confirmations`
          );

          resolve();
        });
      });
    }

    async function withdraw() {
      if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
          const transactionResponse = await contract.withdraw();
          await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
          console.log(error);
        }
      }
    }
  })
  .catch((err) => console.error("Error loading ethers:", err));
