// Dashboard specific functions for AyoUndang
// Save this as assets/js/dashboard.js

// Dashboard initialization
function initDashboard() {
    console.log('Dashboard initialized');
    
    // Load user data
    const user = JSON.parse(localStorage.getItem('ayoUndangUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI
    updateDashboardUI(user);
    
    // Load withdrawal history
    loadWithdrawalHistory(user.id);
    
    // Load friend list
    loadFriendList(user.id);
}

// Update dashboard UI
function updateDashboardUI(user) {
    // Update balance
    const balanceElement = document.getElementById('currentBalance');
    if (balanceElement) {
        balanceElement.textContent = formatCurrency(user.balance || 0);
    }
    
    // Update referrals
    const referralsElement = document.getElementById('totalReferrals');
    if (referralsElement) {
        referralsElement.textContent = user.referrals || 0;
    }
    
    // Update earnings
    const earningsElement = document.getElementById('totalEarnings');
    if (earningsElement) {
        const settings = JSON.parse(localStorage.getItem('ayoUndangSettings') || '{"referralReward":800}');
        const earnings = (user.referrals || 0) * (settings.referralReward || 800);
        earningsElement.textContent = formatCurrency(earnings);
    }
    
    // Update referral code
    const referralCodeElement = document.getElementById('userReferralCode');
    if (referralCodeElement && user.referralCode) {
        referralCodeElement.textContent = user.referralCode;
    }
}

// Load withdrawal history
function loadWithdrawalHistory(userId) {
    const withdrawals = JSON.parse(localStorage.getItem('ayoUndangWithdrawals') || '[]');
    const userWithdrawals = withdrawals.filter(w => w.userId === userId);
    
    const container = document.getElementById('withdrawalHistory');
    if (!container) return;
    
    if (userWithdrawals.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Belum ada riwayat penarikan</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    userWithdrawals.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(withdrawal => {
        const statusClass = withdrawal.status === 'success' ? 'status-success' : 'status-pending';
        const statusText = withdrawal.status === 'success' ? 'SUKSES' : 'PENDING';
        
        html += `
            <div class="activity-item">
                <div class="activity-info">
                    <h4>Penarikan ke ${withdrawal.walletType.toUpperCase()}</h4>
                    <p>${withdrawal.date}</p>
                    <span class="activity-amount withdraw">- Rp${formatCurrency(withdrawal.amount)}</span>
                </div>
                <div style="padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; 
                    background: ${withdrawal.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; 
                    color: ${withdrawal.status === 'success' ? 'var(--success)' : 'var(--warning)'}">
                    ${statusText}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load friend list
function loadFriendList(userId) {
    const user = JSON.parse(localStorage.getItem('ayoUndangUser'));
    if (!user || !user.referrals) return;
    
    const container = document.getElementById('friendList');
    if (!container) return;
    
    if (user.referrals === 0) {
        return; // Keep default message
    }
    
    let html = '';
    for (let i = 1; i <= Math.min(user.referrals, 10); i++) {
        html += `
            <div class="activity-item">
                <div class="activity-info">
                    <h4>Teman ${i}</h4>
                    <p>Bergabung ${i} hari yang lalu</p>
                </div>
                <div class="activity-amount">+ Rp800</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Format currency
function formatCurrency(amount) {
    return amount.toLocaleString('id-ID');
}

// Copy referral code
function copyReferralCode() {
    const user = JSON.parse(localStorage.getItem('ayoUndangUser'));
    if (!user || !user.referralCode) return;
    
    navigator.clipboard.writeText(user.referralCode).then(() => {
        alert(`Kode referral "${user.referralCode}" berhasil disalin!`);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Export functions
window.Dashboard = {
    initDashboard,
    updateDashboardUI,
    loadWithdrawalHistory,
    loadFriendList,
    formatCurrency,
    copyReferralCode
};