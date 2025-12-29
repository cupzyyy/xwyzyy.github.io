// Main Application JavaScript

// DOM Elements
let currentUser = null;
let isAdmin = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Initialize animations
    initAnimations();
    
    // Initialize event listeners
    initEventListeners();
    
    // Update stats
    updateStats();
});

// Check Authentication Status
function checkAuthStatus() {
    const savedUser = localStorage.getItem('ayoUndangUser');
    const savedAdmin = localStorage.getItem('ayoUndangIsAdmin');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = savedAdmin === 'true';
        
        // If user is logged in and on homepage, redirect to dashboard
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                if (isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 2000);
        }
    }
}

// Initialize Animations
function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate
    document.querySelectorAll('.step, .testimonial, .feature-item').forEach(el => {
        observer.observe(el);
    });
}

// Initialize Event Listeners
function initEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = 'login.html?tab=register';
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Update Stats
function updateStats() {
    // In a real app, this would fetch from an API
    // For now, we'll use simulated data
    const stats = {
        totalUsers: 1234,
        totalPayouts: 5678900,
        totalReferrals: 8912
    };
    
    // Animate counters
    animateCounter('totalUsers', stats.totalUsers);
    animateCounter('totalPayouts', stats.totalPayouts);
    animateCounter('totalReferrals', stats.totalReferrals);
}

// Animate Counter
function animateCounter(elementId, finalValue, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const start = 0;
    const increment = finalValue / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            element.textContent = finalValue.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid var(--primary);
    }
    
    .notification-success {
        border-left-color: var(--success);
    }
    
    .notification-error {
        border-left-color: var(--danger);
    }
    
    .notification-warning {
        border-left-color: var(--warning);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        padding: 5px;
        margin-left: 10px;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(notificationStyles);

// Logout Function
function logout() {
    localStorage.removeItem('ayoUndangUser');
    localStorage.removeItem('ayoUndangIsAdmin');
    localStorage.removeItem('ayoUndangToken');
    
    // Show logout notification
    showNotification('Anda telah berhasil logout', 'success');
    
    // Redirect to homepage
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Check if page requires authentication
function requireAuth() {
    const savedUser = localStorage.getItem('ayoUndangUser');
    if (!savedUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Check if page requires admin access
function requireAdmin() {
    if (!requireAuth()) return false;
    
    const isAdmin = localStorage.getItem('ayoUndangIsAdmin') === 'true';
    if (!isAdmin) {
        showNotification('Akses ditolak. Halaman ini hanya untuk admin.', 'error');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// Export functions for use in other files
window.AyoUndang = {
    formatCurrency,
    showNotification,
    logout,
    requireAuth,
    requireAdmin,
    checkAuthStatus
};