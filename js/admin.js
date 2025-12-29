// Admin specific functions for AyoUndang
// Save this as assets/js/admin.js

// Admin initialization
function initAdmin() {
    console.log('Admin dashboard initialized');
    
    // Check admin access
    const user = JSON.parse(localStorage.getItem('ayoUndangUser'));
    if (!user || !user.isAdmin) {
        alert('Akses ditolak. Halaman ini hanya untuk admin.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load all data
    loadAdminData();
}

// Load admin data
function loadAdminData() {
    // Load users
    const users = JSON.parse(localStorage.getItem('ayoUndangUsers') || '[]');
    
    // Load withdrawals
    const withdrawals = JSON.parse(localStorage.getItem('ayoUndangWithdrawals') || '[]');
    
    // Load settings
    const settings = JSON.parse(localStorage.getItem('ayoUndangSettings') || '{}');
    
    // Update stats
    updateAdminStats(users, withdrawals);
    
    // Load tables
    loadUsersTable(users);
    loadWithdrawalsTable(withdrawals);
    loadPendingWithdrawalsTable(withdrawals);
    loadRecentActivities(users, withdrawals);
}

// Update admin statistics
function updateAdminStats(users, withdrawals) {
    // Total users (exclude admin)
    const totalUsers = users.filter(u => !u.isAdmin).length;
    const totalUsersElement = document.getElementById('totalUsersCount');
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    
    // Total withdrawals
    const totalWithdrawalsElement = document.getElementById('totalWithdrawalsCount');
    if (totalWithdrawalsElement) totalWithdrawalsElement.textContent = withdrawals.length;
    
    // Total payouts (success withdrawals)
    const totalPayouts = withdrawals
        .filter(w => w.status === 'success')
        .reduce((sum, w) => sum + w.amount, 0);
    const totalPayoutsElement = document.getElementById('totalPayoutsAmount');
    if (totalPayoutsElement) totalPayoutsElement.textContent = formatCurrency(totalPayouts);
    
    // Pending withdrawals
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const pendingElement = document.getElementById('pendingWithdrawalsCount');
    if (pendingElement) pendingElement.textContent = pendingWithdrawals;
}

// Load users table
function loadUsersTable(users) {
    const container = document.getElementById('usersTable');
    if (!container) return;
    
    const filteredUsers = users.filter(u => !u.isAdmin); // Exclude admin
    
    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5; display: block;"></i>
                    <p>Belum ada pengguna terdaftar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filteredUsers.forEach(user => {
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.username}</td>
                <td>Rp ${formatCurrency(user.balance || 0)}</td>
                <td>${user.referrals || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="openEditUserModal(${user.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteUser(${user.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// Load withdrawals table
function loadWithdrawalsTable(withdrawals) {
    const container = document.getElementById('withdrawalsTable');
    if (!container) return;
    
    if (withdrawals.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-money-bill-wave" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5; display: block;"></i>
                    <p>Belum ada riwayat withdrawal</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    withdrawals.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(w => {
        const statusClass = w.status === 'success' ? 'status-success' : 
                           w.status === 'pending' ? 'status-pending' : 'status-failed';
        const statusText = w.status === 'success' ? 'SUKSES' : 
                          w.status === 'pending' ? 'PENDING' : 'DITOLAK';
        
        html += `
            <tr>
                <td>${w.id}</td>
                <td>${w.userName}</td>
                <td>Rp ${formatCurrency(w.amount)}</td>
                <td>${w.walletType.toUpperCase()}</td>
                <td>${w.date}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="viewWithdrawalDetail(${w.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// Load pending withdrawals table
function loadPendingWithdrawalsTable(withdrawals) {
    const container = document.getElementById('pendingWithdrawalsTable');
    if (!container) return;
    
    const pending = withdrawals.filter(w => w.status === 'pending');
    
    if (pending.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5; display: block;"></i>
                    <p>Tidak ada withdrawal pending</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    pending.forEach(w => {
        html += `
            <tr>
                <td>${w.id}</td>
                <td>${w.userName}</td>
                <td>Rp ${formatCurrency(w.amount)}</td>
                <td>${w.walletType.toUpperCase()}</td>
                <td><span class="status-badge status-pending">PENDING</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="viewWithdrawalDetail(${w.id})">
                            <i class="fas fa-eye"></i> Review
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// Load recent activities
function loadRecentActivities(users, withdrawals) {
    const container = document.getElementById('recentActivitiesTable');
    if (!container) return;
    
    const activities = [];
    
    // Add withdrawal activities
    withdrawals.slice(0, 10).forEach(w => {
        activities.push({
            time: w.date,
            user: w.userName,
            activity: `Withdrawal ${w.status === 'success' ? 'sukses' : w.status === 'pending' ? 'pending' : 'ditolak'}`,
            detail: `Rp ${formatCurrency(w.amount)} ke ${w.walletType}`
        });
    });
    
    // Add user registration activities
    users.filter(u => !u.isAdmin).slice(0, 5).forEach(u => {
        activities.push({
            time: u.joinDate || 'Baru saja',
            user: u.name,
            activity: 'Registrasi pengguna baru',
            detail: `Username: ${u.username}`
        });
    });
    
    // Sort by time (newest first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    let html = '';
    activities.slice(0, 10).forEach(activity => {
        html += `
            <tr>
                <td>${activity.time}</td>
                <td>${activity.user}</td>
                <td>${activity.activity}</td>
                <td>${activity.detail}</td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// Format currency
function formatCurrency(amount) {
    return amount.toLocaleString('id-ID');
}

// Export functions
window.Admin = {
    initAdmin,
    loadAdminData,
    updateAdminStats,
    loadUsersTable,
    loadWithdrawalsTable,
    loadPendingWithdrawalsTable,
    loadRecentActivities,
    formatCurrency
};
