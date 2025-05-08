const API_URL = 'http://localhost:5000/api';
let token = '';
let inventory = [];
let inspections = [];
let inventoryChart = null;

// ===== Auth Section =====
document.getElementById('signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await axios.post(`${API_URL}/auth/signup`, { email, password });
    showMessage('signupMessage', 'Signup successful! Please login.', 'success');
    showLogin();
  } catch (err) {
    showMessage('signupMessage', err.response?.data?.message || 'Signup failed.', 'danger');
  }
});

document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    token = res.data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSystem').classList.remove('hidden');
    document.getElementById('loggedInUser').textContent = `Logged in as: ${email}`;
    initializeDashboard();
  } catch (err) {
    showMessage('loginMessage', err.response?.data?.message || 'Login failed.', 'danger');
  }
});

function logout() {
  token = '';
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  delete axios.defaults.headers.common['Authorization'];
  document.getElementById('mainSystem').classList.add('hidden');
  document.getElementById('authSection').classList.remove('hidden');
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function showMessage(id, message, type) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => (el.innerHTML = ''), 3000);
}

// ===== Dashboard Initialization =====
function initializeDashboard() {
  token = localStorage.getItem('token') || token;
  fetchInventory();
  fetchQualityInspections();
}

// ===== Inventory Section =====
async function fetchInventory() {
  try {
    const res = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    inventory = res.data;
    renderInventory();
  } catch (err) {
    console.error('Error fetching inventory:', err);
  }
}

function renderInventory() {
  const tbody = document.getElementById('inventoryTable');
  if (!tbody) return;
  tbody.innerHTML = inventory.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.type}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editProduct(${i})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${item._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  updateChart();
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('productName').value;
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const type = document.getElementById('productType').value;
  const editIndex = document.getElementById('editIndex').value;

  try {
    if (editIndex === '') {
      const res = await axios.post(`${API_URL}/inventory`, { name, quantity, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      inventory.push(res.data);
    } else {
      const itemId = inventory[editIndex]._id;
      const res = await axios.put(`${API_URL}/inventory/${itemId}`, { name, quantity, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      inventory[editIndex] = res.data;
    }
    renderInventory();
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
  } catch (err) {
    console.error('Error saving product:', err);
  }
});

function showAddProductModal() {
  document.getElementById('modalTitle').innerText = 'Add Product';
  document.getElementById('editIndex').value = '';
  document.getElementById('productForm').reset();
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function editProduct(index) {
  const product = inventory[index];
  document.getElementById('modalTitle').innerText = 'Edit Product';
  document.getElementById('editIndex').value = index;
  document.getElementById('productName').value = product.name;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productType').value = product.type;
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function deleteProduct(id) {
  try {
    await axios.delete(`${API_URL}/inventory/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    inventory = inventory.filter(item => item._id !== id);
    renderInventory();
  } catch (err) {
    console.error('Error deleting product:', err);
  }
}

function updateChart() {
  const ctx = document.getElementById('inventoryChart')?.getContext('2d');
  if (!ctx) return;

  if (inventoryChart) inventoryChart.destroy();
  inventoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: inventory.map(i => i.name),
      datasets: [{
        label: 'Stock',
        data: inventory.map(i => i.quantity),
        backgroundColor: '#3498db'
      }]
    }
  });
}

// ===== Quality Assurance Section =====
async function fetchQualityInspections() {
  try {
    const res = await axios.get(`${API_URL}/quality`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    inspections = res.data;
    renderInspections(inspections);
  } catch (err) {
    console.error('Error fetching inspections:', err);
  }
}

document.getElementById("inspectionForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  const newInspection = {
    inspector: form.inspector.value,
    product: form.product.value,
    result: form.result.value,
    date: form.date.value || new Date().toISOString(),
    notes: form.notes.value,
  };

  try {
    const res = await axios.post(`${API_URL}/quality`, newInspection, {
      headers: { Authorization: `Bearer ${token}` }
    });
    inspections.push(res.data);
    form.reset();
    fetchQualityInspections();
  } catch (err) {
    console.error("Error saving inspection:", err);
    alert("Error saving inspection: " + (err.response?.data?.error || err.message));
  }
});

function renderInspections(data) {
  const tbody = document.getElementById("inspectionsTableBody");
  tbody.innerHTML = "";
  data.forEach((i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i.inspector}</td>
      <td>${i.product}</td>
      <td>${i.result}</td>
      <td>${new Date(i.date).toLocaleDateString("en-GB")}</td>
      <td>${i.notes}</td>
      <td><button onclick="deleteInspection('${i._id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function deleteInspection(id) {
  try {
    await axios.delete(`${API_URL}/quality/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchQualityInspections();
  } catch (err) {
    console.error("Error deleting inspection:", err);
    alert("Error deleting inspection: " + (err.response?.data?.error || err.message));
  }
}

// ===== Excel Export =====
function downloadExcel() {
  const table = document.querySelector("#active-shipments-table");
  if (!table) return alert("Active Shipments table not found!");

  let data = [];
  for (let row of table.rows) {
    let rowData = [];
    for (let cell of row.cells) {
      rowData.push(cell.innerText);
    }
    data.push(rowData);
  }

  let csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "active_shipments.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== Auto Login on Page Load =====
window.onload = function () {
  const savedToken = localStorage.getItem('token');
  const savedEmail = localStorage.getItem('userEmail');

  if (savedToken) {
    token = savedToken;
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSystem').classList.remove('hidden');
    if (savedEmail) {
      document.getElementById('loggedInUser').textContent = `Logged in as: ${savedEmail}`;
    }
    initializeDashboard();
  }
};



