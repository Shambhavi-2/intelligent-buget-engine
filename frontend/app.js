// Automatically shifts between localhost and your live website URL dynamically
const API_URL = window.location.origin === 'http://127.0.0.1:5500' || window.location.origin === 'http://localhost:5500' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;

// DOM Elements
const budgetForm = document.getElementById('budgetForm');
const expenseForm = document.getElementById('expenseForm');
const expenseSubmitBtn = document.getElementById('expenseSubmitBtn');
const editExpenseId = document.getElementById('editExpenseId');
const statusArea = document.getElementById('statusArea');

// Initialize Premium Cyber Bootstrap Modal for Threshold Alerts
const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
const modalAlertMessage = document.getElementById('modalAlertMessage');

let expenseChart = null; // Global instance placeholder for Chart.js

// 1. Handle Budget Target Form Submission
budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const month = document.getElementById('budgetMonth').value;
    const targetLimit = document.getElementById('targetLimit').value;

    try {
        const response = await fetch(`${API_URL}/budget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, targetLimit: Number(targetLimit) })
        });
        const data = await response.json();
        alert(data.message);
        fetchAnalytics(); // Refresh logs and graph instantly
    } catch (error) { 
        console.error('Error saving budget target:', error); 
    }
});

// 2. Handle Expense Form Submission (Add or Update) & Check Threshold Breaches
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productName = document.getElementById('prodName').value;
    const amount = document.getElementById('expAmount').value;
    const category = document.getElementById('expCategory').value;
    const id = editExpenseId.value;

    // Use selected budget month if available, otherwise fallback to current month string (YYYY-MM)
    const selectedMonth = document.getElementById('budgetMonth').value;
    const defaultMonthStr = new Date().toISOString().slice(0, 7);
    const targetMonth = selectedMonth ? selectedMonth : defaultMonthStr;

    // Construct full date string for the database injection
    const date = new Date(`${targetMonth}-02`).toISOString();

    let url = `${API_URL}/expense`;
    let method = 'POST';

    // If an ID is present, switch behavior to an Edit/Update operation
    if (id) {
        url = `${API_URL}/expense/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, amount: Number(amount), category, date })
        });
        const data = await response.json();

        // Reset the input forms completely
        expenseForm.reset();
        editExpenseId.value = '';
        expenseSubmitBtn.innerText = 'COMMIT TRANSACTION';

        // 🧠 THE ALGORITHM TRIGGER CHECK:
        // If the backend budget calculation rules out that expenditures exceeded target limit:
        if (data.alertData && data.alertData.triggerPopup) {
            // Inject the backend analytics message directly into the text holder
            modalAlertMessage.innerText = data.alertData.message;
            // Pop open the neon cyber modal on your client's screen instantly!
            alertModal.show();
        } else {
            // Standard dynamic success confirmation alert if within safe zones
            alert(data.message);
        }

        fetchAnalytics(); // Rerender layouts and chart paths
    } catch (error) { 
        console.error('Error processing transaction entry:', error); 
    }
});

// 3. Edit Action Selection Bridge
function setupEditExpense(id, name, amount, category) {
    editExpenseId.value = id;
    document.getElementById('prodName').value = name;
    document.getElementById('expAmount').value = amount;
    document.getElementById('expCategory').value = category;
    expenseSubmitBtn.innerText = 'UPDATE ENTRIES';
    document.getElementById('prodName').focus();
}

// 4. Delete Action Selection Bridge
async function deleteExpense(id) {
    if (!confirm("Are you sure you want to purge this record from system databases?")) return;
    try {
        await fetch(`${API_URL}/expense/${id}`, { method: 'DELETE' });
        fetchAnalytics();
    } catch (error) { 
        console.error('Error processing deletion logs:', error); 
    }
}

// 5. Fetch Registry Analytics and Render Graph/List UI elements (Per-Expense Granular View)
async function fetchAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();
        
        statusArea.innerHTML = ''; 
        
        if (data.length === 0) {
            statusArea.innerHTML = '<p class="text-muted text-center small py-3">No data arrays registered in analytics core yet.</p>';
            renderGraph([], []);
            return;
        }

        let chartLabels = [];
        let chartValues = [];

        // Loop through monthly logs to render UI lists
        data.forEach(monthLog => {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'p-3 mb-3 border border-secondary rounded-3 bg-opacity-10 bg-light';
            
            monthDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-20">
                    <span class="badge badge-neon fs-6">🗓️ Month: ${monthLog._id}</span>
                    <span class="fw-bold text-gradient">Total Outlay: ₹${monthLog.totalSpent}</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-borderless m-0 text-light opacity-75">
                        <tbody>
                            ${monthLog.products.map(p => {
                                // 💡 Extract individual product entries for the graph tracking line (Fixes static line bug)
                                chartLabels.push(p.name); 
                                chartValues.push(p.amount);

                                return `
                                <tr class="align-middle">
                                    <td>• <span class="fw-medium">${p.name}</span> <span class="badge bg-secondary bg-opacity-20 text-info ms-1 small font-monospace">${p.category || 'General'}</span></td>
                                    <td class="text-end fw-semibold text-white">₹${p.amount}</td>
                                    <td class="text-end" style="width: 100px;">
                                        <button onclick="setupEditExpense('${p.id}', '${p.name}', ${p.amount}, '${p.category}')" class="btn btn-sm action-btn-edit py-0 px-2 me-1">✏️</button>
                                        <button onclick="deleteExpense('${p.id}')" class="btn btn-sm action-btn-delete py-0 px-2">❌</button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            statusArea.appendChild(monthDiv);
        });

        // Pass granular itemized product data vectors straight into the graph engine
        renderGraph(chartLabels, chartValues);
    } catch (error) { 
        console.error('Error initializing data configurations:', error); 
    }
}

// 6. Chart.js Graph Drawing Function (Itemized Expense Tracking for Beautiful Curves)
function renderGraph(labels, values) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    if (expenseChart) { 
        expenseChart.destroy(); 
    }

    if (labels.length === 0) {
        labels = ['No Telemetry Logs'];
        values = [0];
    }

    expenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // X-axis now tracks individual item names (e.g., Food, Tea)
            datasets: [{
                label: 'Transaction Expense Flow',
                data: values, // Y-axis tracks the corresponding costs dynamically
                borderColor: '#00f2fe', // Sharp Neon Cyan
                backgroundColor: 'rgba(0, 242, 254, 0.05)', // Glow canvas fill
                borderWidth: 3,
                tension: 0.4, // Beautiful cinematic wave curves
                fill: true,
                pointBackgroundColor: '#4facfe',
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 }
                    }
                },
                x: { 
                    grid: { display: false },
                    ticks: {
                        color: '#00f2fe', // Cyan tint text for item tags
                        font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' }
                    }
                }
            },
            plugins: { 
                legend: { display: false }
            }
        }
    });
}

// System Boot Initialization
fetchAnalytics();