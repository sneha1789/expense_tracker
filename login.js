class LoginAnimation {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startContinuousAnimation();
    }
    
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Stop animation on form interaction
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.stopContinuousAnimation();
            });
            
            input.addEventListener('blur', () => {
                // Restart animation if form is empty
                if (!input.value) {
                    this.startContinuousAnimation();
                }
            });
        });
    }
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Simple validation
        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }
        
        // Demo credentials check
        if (username === 'demo' && password === 'demo123') {
            this.showSuccess('Login successful! Redirecting...');
            
            // Save login state
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('username', username);
            }
            
            // Redirect to main app after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            this.showError('Invalid credentials. Use demo/demo123');
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        this.shakeForm();
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
        this.celebrate();
    }
    
    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.login-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `login-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    shakeForm() {
        const form = document.querySelector('.login-form-container');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }
    
    celebrate() {
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach(heart => {
            heart.style.animation = 'floatUp 2s ease-out forwards';
        });
        
        // Add confetti effect
        this.createConfetti();
    }
    
    createConfetti() {
        const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#43aa8b'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.innerHTML = '🎉';
            confetti.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}vw;
                font-size: 20px;
                z-index: 100;
                animation: confettiFall ${Math.random() * 2 + 1}s ease-in forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    startContinuousAnimation() {
        // Reset character position for continuous animation
        const character = document.querySelector('.character-container');
        character.style.animation = 'jumpIn 2s ease-out infinite';
    }
    
    stopContinuousAnimation() {
        const character = document.querySelector('.character-container');
        character.style.animation = 'none';
    }
}

// Add confetti animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
        }
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
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Initialize login animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginAnimation();
    
    // Check if user wants to be remembered
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('rememberMe').checked = true;
        }
    }
});