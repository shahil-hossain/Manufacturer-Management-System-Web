const divisionDistrictMap = {
  Dhaka: ["Dhaka", "Gazipur", "Kishoreganj", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail", "Faridpur", "Gopalganj", "Madaripur"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Bandarban", "Rangamati", "Khagrachari", "Noakhali", "Feni", "Lakshmipur", "Brahmanbaria", "Cumilla", "Chandpur"],
  Khulna: ["Khulna", "Bagerhat", "Satkhira", "Jessore", "Narail", "Magura", "Jhenaidah", "Chuadanga", "Meherpur"],
  Rajshahi: ["Rajshahi", "Pabna", "Sirajganj", "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj"],
  Barisal: ["Barisal", "Patuakhali", "Bhola", "Barguna", "Pirojpur", "Jhalokati"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: ["Rangpur", "Kurigram", "Lalmonirhat", "Nilphamari", "Dinajpur", "Thakurgaon", "Gaibandha", "Panchagarh"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

function updateDistricts() {
  const division = document.getElementById("division").value;
  const districtSelect = document.getElementById("district");
  districtSelect.innerHTML = '<option value="">Select District</option>';

  if (divisionDistrictMap[division]) {
    divisionDistrictMap[division].forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}

document.getElementById("deliveryForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  const newDelivery = {
    orderId: form.orderId.value,
    division: form.division.value,
    district: form.district.value,
    address: form.address.value,
    status: form.status.value,
    date: form.date.value,
  };

  try {
    const res = await fetch("http://localhost:5000/api/logistics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDelivery),
    });

    const result = await res.json();
    if (!res.ok) {
      alert("Server error: " + (result.error || "Something went wrong"));
      return;
    }

    form.reset();
    updateDistricts();
    fetchShipments();
    fetchStats();
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error saving delivery");
  }
});

window.onload = function () {
  fetchShipments();
  fetchStats();
};

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
}

async function fetchShipments() {
  try {
    const res = await fetch("http://localhost:5000/api/logistics");
    const data = await res.json();
    renderShipmentTable(data);
  } catch (err) {
    console.error("Failed to fetch shipments:", err);
  }
}

function renderShipmentTable(shipments) {
  const tbody = document.getElementById("shipmentsTableBody");
  tbody.innerHTML = "";

  shipments.forEach((s) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.orderId}</td>
      <td>${s.division}</td>
      <td>${s.district}</td>
      <td>${s.address}</td>
      <td>${s.status}</td>
      <td>${formatDateDisplay(s.date)}</td>
      <td><button onclick="deleteShipment('${s._id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function fetchStats() {
  try {
    const res = await fetch("http://localhost:5000/api/logistics");
    const data = await res.json();

    const total = data.length;
    const scheduled = data.filter(d => d.status === "Scheduled").length;
    const transit = data.filter(d => d.status === "In Transit").length;
    const delivered = data.filter(d => d.status === "Delivered").length;

    document.getElementById("totalShipments").textContent = total;
    document.getElementById("scheduledCount").textContent = scheduled;
    document.getElementById("transitCount").textContent = transit;
    document.getElementById("deliveredCount").textContent = delivered;
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  }
}

async function deleteShipment(id) {
  if (!confirm("Are you sure you want to delete this delivery?")) return;

  try {
    await fetch(`http://localhost:5000/api/logistics/${id}`, { method: "DELETE" });
    fetchShipments();
    fetchStats();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}