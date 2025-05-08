document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('productName').value;
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const type = document.getElementById('productType').value;
  const editIndex = document.getElementById('editIndex').value;

  try {
    if (!token) {
      alert("Session expired. Please login again.");
      logout();
      return;
    }

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
    document.getElementById('productForm').reset();
    
    const modalElement = document.getElementById('productModal');
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.hide();
  } catch (err) {
    console.error('Error saving product:', err);
    alert("Error saving product: " + (err.response?.data?.message || err.message));
  }
});