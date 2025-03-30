// Replace with your actual donation address
const DONATION_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Conservation projects data
const CONSERVATION_PROJECTS = {
  general: {
    name: "General Wildlife Fund",
    impact: "Supports various conservation efforts"
  },
  tigers: {
    name: "Tiger Protection",
    impact: "Protects 1 tiger for every 0.1 ETH donated"
  },
  oceans: {
    name: "Ocean Cleanup",
    impact: "Removes 10kg of plastic for every 0.01 ETH"
  },
  forests: {
    name: "Rainforest Preservation",
    impact: "Saves 100 sqm of forest for every 0.05 ETH"
  }
};

let provider, signer;

// Connect Wallet
document.getElementById("connectBtn").onclick = async () => {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      const account = await signer.getAddress();
      
      updateWalletDisplay(account);
      await updateBalance();
      showStatus("🔗 Wallet connected successfully!", "success");
      
      // Initialize donation history display
      updateDonationHistory();
      updateImpactStats();
      
    } catch (error) {
      console.error("Connection error:", error);
      showStatus(`Connection failed: ${error.message}`, "error");
    }
  } else {
    showStatus("MetaMask not detected! Please install it first.", "error");
  }
};

// Update wallet display
function updateWalletDisplay(address) {
  const connectBtn = document.getElementById("connectBtn");
  const truncated = `${address.substring(0, 6)}...${address.slice(-4)}`;
  
  connectBtn.innerHTML = `
    <span>${truncated}</span>
    <span id="copyIcon" title="Copy Address">📋</span>
  `;
  
  document.getElementById("copyIcon").addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    showStatus("Address copied!", "success");
  });
}

// Update ETH balance
async function updateBalance() {
  try {
    const account = await signer.getAddress();
    const balance = await provider.getBalance(account);
    document.getElementById("balance").textContent = 
      ethers.formatEther(balance).substring(0, 6);
  } catch (error) {
    console.error("Balance update error:", error);
  }
}

// Update donation history display - FIXED VERSION
function updateDonationHistory() {
  const donations = JSON.parse(localStorage.getItem("conservationDonations")) || [];
  const list = document.getElementById("txHistory");
  
  if (!list) return;

  list.innerHTML = donations.length === 0 
    ? "<li>No donations yet</li>"
    : donations.map(donation => {
        const project = CONSERVATION_PROJECTS[donation.project] || CONSERVATION_PROJECTS.general;
        return `
          <li>
            <strong>${project.name}</strong><br>
            <span>${parseFloat(donation.amount).toFixed(4)} ETH</span> • 
            <small>${new Date(donation.timestamp).toLocaleString()}</small><br>
            <em>${project.impact}</em>
          </li>
        `;
      }).join('');
}

// Calculate and display impact stats - FIXED VERSION
function updateImpactStats() {
  const donations = JSON.parse(localStorage.getItem("conservationDonations")) || [];
  
  // Calculate total donated
  const total = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  document.getElementById("totalDonated").textContent = total.toFixed(4) + " ETH";
  
  // Calculate species impact
  let impact = 0;
  donations.forEach(d => {
    const amount = parseFloat(d.amount);
    switch(d.project) {
      case 'tigers': impact += amount / 0.1; break;
      case 'oceans': impact += amount / 0.01 * 10; break;
      case 'forests': impact += amount / 0.05 * 100; break;
      default: impact += amount * 10; // General impact
    }
  });
  
  document.getElementById("speciesProtected").textContent = Math.round(impact);
}

// Show status messages
function showStatus(message, type = "info") {
  const statusElement = document.getElementById("donationStatus");
  statusElement.textContent = message;
  statusElement.className = type;
  
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: type === "error" ? "#ff4444" : 
                   type === "success" ? "#00C851" : "#33b5e5",
  }).showToast();
}

// Initialize when page loads
window.addEventListener("DOMContentLoaded", () => {
  updateDonationHistory();
  updateImpactStats();
  
  // Initialize project select dropdown
  const projectSelect = document.getElementById("projectSelect");
  if (projectSelect) {
    projectSelect.innerHTML = Object.entries(CONSERVATION_PROJECTS)
      .map(([id, project]) => `<option value="${id}">${project.name}</option>`)
      .join('');
  }
  
  // Check if already connected to MetaMask
  if (window.ethereum?.isConnected()) {
    document.getElementById("connectBtn").click();
  }
});