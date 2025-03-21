const contractAddress = "0xE82B3B4d19BE459b73D1B3A9a7636102e843e1CE";
const abi = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

let provider, signer, contract;

// Connect Wallet
document.getElementById("connectBtn").onclick = async () => {
    if (window.ethereum) {
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
  
        const account = await signer.getAddress();
        const connectBtn = document.getElementById("connectBtn");
  
        // Truncate and clear the button content
        const truncated = `${account.substring(0, 6)}...${account.slice(-4)}`;
        connectBtn.innerHTML = ""; // Clear previous content
  
        // Create span for address and icon
        const addressSpan = document.createElement("span");
        addressSpan.innerText = truncated;
  
        const copyIcon = document.createElement("span");
        copyIcon.innerText = "📋";
        copyIcon.title = "Copy Address";
        copyIcon.id = "copyIcon";
        copyIcon.style.marginLeft = "10px";
        copyIcon.style.cursor = "pointer";
  
        // Append elements to button
        connectBtn.appendChild(addressSpan);
        connectBtn.appendChild(copyIcon);
  
        // Store full address in data attribute
        connectBtn.setAttribute("data-address", account);
  
        // Show full address below
        document.getElementById("account").innerText = account;
  
        const balance = await contract.balanceOf(account);
        document.getElementById("balance").innerText = ethers.utils.formatUnits(balance, 18);
  
        Toastify({
          text: "🔗 Wallet connected!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#2196f3"
        }).showToast();
  
        // Attach copy listener (prevent duplicate listeners)
        copyIcon.addEventListener("click", (e) => {
          e.stopPropagation(); // Don't trigger wallet connect
          const address = connectBtn.getAttribute("data-address");
          navigator.clipboard.writeText(address).then(() => {
            Toastify({
              text: "Address copied to clipboard!",
              duration: 4000,
              gravity: "top",
              position: "right",
              backgroundColor: "#2196f3"
            }).showToast();
          });
        });
  
      } catch (error) {
        console.error("Wallet connection failed", error);
      }
    } else {
      alert("MetaMask not detected");
    }
  };
  

  
// Transfer Tokens
document.getElementById("transferBtn").onclick = async (e) => {
    e.preventDefault(); // Prevent form from reloading page
  
    const to = document.getElementById("toAddress").value.trim();
    const amount = document.getElementById("amount").value.trim();
  
    // Validate recipient address
    if (!ethers.utils.isAddress(to)) {
      Toastify({
        text: "❌ Invalid recipient address!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336"
      }).showToast();
      return;
    }
  
    // Validate amount input
    if (!amount || isNaN(amount)) {
      Toastify({
        text: "❌ Amount must be a number",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336"
      }).showToast();
      return;
    }
  
    if (Number(amount) <= 0) {
      Toastify({
        text: "❌ Amount must be greater than 0",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336"
      }).showToast();
      return;
    }
  
    try {
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      const account = await signer.getAddress();
      const balance = await contract.balanceOf(account);
  
      if (parsedAmount.gt(balance)) {
        Toastify({
          text: "❌ Insufficient token balance",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#f44336"
        }).showToast();
        return;
      }
  
      document.getElementById("status").innerHTML = "<div class='spinner'></div>";
      const tx = await contract.transfer(to, parsedAmount);
  
      document.getElementById("status").innerText = "⏳ Sending transaction...";
      await tx.wait();
  
      document.getElementById("status").innerText = "✅ Transaction confirmed!";
      Toastify({
        text: "✅ Tokens sent successfully!",
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#4caf50"
      }).showToast();
  
      // Refresh balance
      const updatedBalance = await contract.balanceOf(account);
      document.getElementById("balance").innerText = ethers.utils.formatUnits(updatedBalance, 18);
  
      // Save transaction
      saveTx(to, amount);
  
    } catch (err) {
      console.error(err);
      document.getElementById("status").innerText = "❌ Transaction failed.";
      Toastify({
        text: "❌ Transaction failed!",
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336"
      }).showToast();
    }
  };
  

// Save & Render Transaction History
function saveTx(address, amount) {
  const history = JSON.parse(localStorage.getItem("txHistory")) || [];
  history.unshift({ address, amount, time: new Date().toISOString() });
  localStorage.setItem("txHistory", JSON.stringify(history));
  renderTxHistory();
}

function renderTxHistory() {
  const history = JSON.parse(localStorage.getItem("txHistory")) || [];
  const list = document.getElementById("txHistory");
  if (!list) return;

  list.innerHTML = "";

  history.forEach(tx => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>To:</strong> ${tx.address} <br>
      <strong>Amount:</strong> ${tx.amount} MTK <br>
      <small>${new Date(tx.time).toLocaleString()}</small>
    `;
    list.appendChild(item);
  });
}

// Load history on page load
window.addEventListener("DOMContentLoaded", renderTxHistory);
