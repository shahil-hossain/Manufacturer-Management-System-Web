document.addEventListener("DOMContentLoaded", () => {
  loadProductions();

  document.getElementById("productionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const form = e.target;
    const newProd = {
      name: form.prodName.value,
      quantity: parseInt(form.prodQty.value),
      date: form.prodDate.value,
      status: form.prodStatus.value,
    };

    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProd),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Save failed");
        return;
      }

      form.reset();
      loadProductions();
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  });
});

async function loadProductions() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/production", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.getElementById("productionTableBody");
  tbody.innerHTML = "";
  data.forEach(p => {
    const row = `<tr>
      <td>${p.name}</td>
      <td>${p.quantity}</td>
      <td>${new Date(p.date).toLocaleDateString("en-GB")}</td>
      <td>${p.status}</td>
      <td><button onclick="deleteProd('${p._id}')">Delete</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

async function deleteProd(id) {
  const token = localStorage.getItem("token");
  await fetch(`/api/production/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadProductions();
}
  