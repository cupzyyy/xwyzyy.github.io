// Authentication Functions for AyoUndang
// Save this as assets/js/auth.js

// Initialize auth system
function initAuth() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    
    // Redirect logic based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentUser) {
        // User is logged in
        if (currentPage === 'login.html' || currentPage === 'index.html') {
            // Redirect to appropriate dashboard
            if (currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
        
        // For dashboard pages, check if user has permission
        if (currentPage === 'admin.html' && !currentUser.isAdmin) {
            alert('Akses ditolak. Halaman ini hanya untuk admin.');
            window.location.href = 'dashboard.html';
        }
        
        if (currentPage === 'dashboard.html' && currentUser.isAdmin) {
            window.location.href = 'admin.html';
        }
    } else {
        // User is not logged in
        if (currentPage === 'dashboard.html' || currentPage === 'admin.html') {
            window.location.href = 'login.html';
        }
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('ayoUndangUser');
    return userData ? JSON.parse(userData) : null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin === true;
}

// Login function
async function login(username, password) {
    try {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('ayoUndangUsers') || '[]');
        
        // Add default users if empty
        if (users.length === 0) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'user1',
                    password: 'password123',
                    name: 'Budi Santoso',
                    phone: '081234567890',
                    balance: 15000,
                    referrals: 5,
                    referralCode: 'BUDI123',
                    joinDate: 'Jan 2023',
                    walletType: 'dana',
                    walletNumber: '081234567890',
                    accountName: 'Budi Santoso',
                    isAdmin: false,
                    hasSeenWelcome: true
                },
                {
                    id: 2,
                    username: 'user2',
                    password: 'password123',
                    name: 'Siti Rahayu',
                    phone: '081298765432',
                    balance: 8000,
                    referrals: 3,
                    referralCode: 'SITI456',
                    joinDate: 'Feb 2023',
                    walletType: 'ovo',
                    walletNumber: '081298765432',
                    accountName: 'Siti Rahayu',
                    isAdmin: false,
                    hasSeenWelcome: true
                },
                {
                    id: 99,
                    username: 'admin',
                    password: 'admin123',
                    name: 'Administrator',
                    phone: '081234567899',
                    balance: 0,
                    referrals: 0,
                    referralCode: 'ADMIN99',
                    joinDate: 'Jan 2023',
                    walletType: '',
                    walletNumber: '',
                    accountName: '',
                    isAdmin: true,
                    hasSeenWelcome: true
                }
            ];
            
            localStorage.setItem('ayoUndangUsers', JSON.stringify(defaultUsers));
            users.push(...defaultUsers);
        }
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('Username atau password salah');
        }
        
        // Save user session
        localStorage.setItem('ayoUndangUser', JSON.stringify(user));
        localStorage.setItem('ayoUndangIsAdmin', user.isAdmin ? 'true' : 'false');
        
        return {
            success: true,
            user: user,
            message: 'Login berhasil'
        };
        
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Terjadi kesalahan saat login'
        };
    }
}

// Register function
async function register(userData) {
    try {
        // Validate required fields
        if (!userData.phone || !userData.username || !userData.password) {
            throw new Error('Semua field harus diisi');
        }
        
        if (userData.password.length < 6) {
            throw new Error('Password minimal 6 karakter');
        }
        
        if (userData.username.length < 4) {
            throw new Error('Username minimal 4 karakter');
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('ayoUndangUsers') || '[]');
        
        // Check if username exists
        if (users.some(u => u.username === userData.username)) {
            throw new Error('Username sudah digunakan');
        }
        
        // Get settings for referral reward
        const settings = JSON.parse(localStorage.getItem('ayoUndangSettings') || '{"referralReward":800}');
        
        // Create new user
        const newUser = {
            id: Date.now(),
            ...userData,
            balance: 0,
            referrals: 0,
            referralCode: generateReferralCode(userData.username),
            joinDate: new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            walletType: '',
            walletNumber: '',
            accountName: '',
            isAdmin: false,
            hasSeenWelcome: false
        };
        
        // Check for referral code
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        
        if (referralCode) {
            // Find referrer
            const referrer = users.find(u => u.referralCode === referralCode);
            if (referrer) {
                // Add reward to referrer
                referrer.balance += settings.referralReward || 800;
                referrer.referrals = (referrer.referrals || 0) + 1;
                
                // Update referrer in users array
                const referrerIndex = users.findIndex(u => u.id === referrer.id);
                if (referrerIndex !== -1) {
                    users[referrerIndex] = referrer;
                }
            }
        }
        
        // Add to users
        users.push(newUser);
        localStorage.setItem('ayoUndangUsers', JSON.stringify(users));
        
        // Auto login after registration
        localStorage.setItem('ayoUndangUser', JSON.stringify(newUser));
        localStorage.setItem('ayoUndangIsAdmin', 'false');
        
        return {
            success: true,
            user: newUser,
            message: 'Pendaftaran berhasil!'
        };
        
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Terjadi kesalahan saat pendaftaran'
        };
    }
}

// Generate referral code
function generateReferralCode(username) {
    const prefix = username.toUpperCase().substring(0, 3);
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}${random}`;
}

// Logout function
function logout() {
    // Clear auth data
    localStorage.removeItem('ayoUndangUser');
    localStorage.removeItem('ayoUndangIsAdmin');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('ayoUndangUser') !== null;
}

// Update user data
function updateUserData(updatedData) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return false;
        
        // Get all users
        const users = JSON.parse(localStorage.getItem('ayoUndangUsers') || '[]');
        
        // Find and update user
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) return false;
        
        // Update user data
        users[userIndex] = { ...users[userIndex], ...updatedData };
        
        // Save to localStorage
        localStorage.setItem('ayoUndangUsers', JSON.stringify(users));
        localStorage.setItem('ayoUndangUser', JSON.stringify(users[userIndex]));
        
        return true;
        
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            throw new Error('User tidak ditemukan');
        }
        
        // Verify current password
        if (currentUser.password !== currentPassword) {
            throw new Error('Password saat ini salah');
        }
        
        // Update password
        const updated = updateUserData({ password: newPassword });
        
        if (updated) {
            return {
                success: true,
                message: 'Password berhasil diubah'
            };
        } else {
            throw new Error('Gagal mengubah password');
        }
        
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Export functions
window.Auth = {
    initAuth,
    getCurrentUser,
    isAdmin,
    login,
    register,
    logout,
    isAuthenticated,
    updateUserData,
    changePassword
};

// Auto-initialize auth when page loads
document.addEventListener('DOMContentLoaded', initAuth);