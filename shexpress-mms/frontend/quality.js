
// Quality Control Data
let qualityInspections = JSON.parse(localStorage.getItem('qualityInspections')) || [];

// Initialize Quality Section
function initializeQuality() {
    const defectTable = document.getElementById('defectTable');
    defectTable.innerHTML = qualityInspections.map((inspection, index) => `
        <tr>
            <td>${inspection.batchId}</td>
            <td>${inspection.inspector}</td>
            <td class="status-${inspection.status.toLowerCase()}">${inspection.status}</td>
            <td>${inspection.actionRequired}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editInspection(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteInspection(${index})">Delete</button>
            </td>
        </tr>
    `).join('');
    
    updateQualityDashboard();
}

// Update Dashboard Summary
function updateQualityDashboard() {
    const passed = qualityInspections.filter(i => i.status === 'Passed').length;
    const failed = qualityInspections.filter(i => i.status === 'Failed').length;
    
    document.getElementById('qualitySummary').innerHTML = `
        <div class="col-md-3">
            <div class="dashboard-card text-center">
                <h5>Passed Inspections</h5>
                <h2 class="text-success">${passed}</h2>
            </div>
        </div>
        <div class="col-md-3">
            <div class="dashboard-card text-center">
                <h5>Failed Inspections</h5>
                <h2 class="text-danger">${failed}</h2>
            </div>
        </div>
    `;
}

// Form Submission Handler
document.getElementById('inspectionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inspection = {
        id: Date.now(),
        batchId: document.getElementById('batchId').value,
        inspector: document.getElementById('inspector').value,
        status: document.getElementById('inspectionStatus').value,
        actionRequired: document.getElementById('requiredAction').value
    };

    const existingId = document.getElementById('defectId').value;
    
    if(existingId) {
        // Update existing
        const index = qualityInspections.findIndex(i => i.id == existingId);
        qualityInspections[index] = inspection;
    } else {
        // Add new
        qualityInspections.push(inspection);
    }

    localStorage.setItem('qualityInspections', JSON.stringify(qualityInspections));
    initializeQuality();
    clearForm();
});

// Edit Inspection
function editInspection(index) {
    const inspection = qualityInspections[index];
    document.getElementById('defectId').value = inspection.id;
    document.getElementById('batchId').value = inspection.batchId;
    document.getElementById('inspector').value = inspection.inspector;
    document.getElementById('inspectionStatus').value = inspection.status;
    document.getElementById('requiredAction').value = inspection.actionRequired;
}

// Delete Inspection
function deleteInspection(index) {
    if(confirm('Are you sure you want to delete this inspection record?')) {
        qualityInspections.splice(index, 1);
        localStorage.setItem('qualityInspections', JSON.stringify(qualityInspections));
        initializeQuality();
    }
}

// Clear Form
function clearForm() {
    document.getElementById('inspectionForm').reset();
    document.getElementById('defectId').value = '';
}

// Add to your initializeDashboard function
function initializeDashboard() {
    initializeQuality();
    // ... rest of your existing initialization code
}
