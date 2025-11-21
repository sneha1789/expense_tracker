// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.editingId = null;
        
        this.initializeApp();
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.applyTheme();
        this.renderTransactions();
        this.updateSummary();
        this.setCurrentDate();
    }
    
    setupEventListeners() {
        // Form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Type selector buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTypeSelect(e);
            });
        });
        
        // Filter transactions
        document.getElementById('filterCategory').addEventListener('change', (e) => {
            this.filterTransactions(e.target.value);
        });
        
        // Modal close
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        document.getElementById('editModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
    }
    
    handleFormSubmit() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        
        if (!description || !amount) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const transaction = {
            id: this.editingId || Date.now().toString(),
            description: description,
            amount: type === 'income' ? Math.abs(amount) : -Math.abs(amount),
            type: type,
            category: category,
            date: date
        };
        
        if (this.editingId) {
            this.updateTransaction(transaction);
        } else {
            this.addTransaction(transaction);
        }
        
        this.resetForm();
    }
    
    handleTypeSelect(e) {
        const type = e.currentTarget.dataset.type;
        
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Update hidden input
        document.getElementById('type').value = type;
    }
    
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateSummary();
        this.showNotification('Transaction added successfully!', 'success');
    }
    
    updateTransaction(transaction) {
        const index = this.transactions.findIndex(t => t.id === this.editingId);
        if (index !== -1) {
            this.transactions[index] = transaction;
            this.saveTransactions();
            this.renderTransactions();
            this.updateSummary();
            this.showNotification('Transaction updated successfully!', 'success');
            this.closeModal();
        }
        this.editingId = null;
    }
    
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateSummary();
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }
    
    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            this.editingId = id;
            
            // Fill form with transaction data
            document.getElementById('description').value = transaction.description;
            document.getElementById('amount').value = Math.abs(transaction.amount);
            document.getElementById('category').value = transaction.category;
            document.getElementById('date').value = transaction.date;
            
            // Set type button
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === transaction.type) {
                    btn.classList.add('active');
                }
            });
            document.getElementById('type').value = transaction.type;
            
            // Scroll to form
            document.querySelector('.transaction-form-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }
    
    filterTransactions(category = 'all') {
        this.renderTransactions(category);
    }
    
    renderTransactions(category = 'all') {
        const container = document.getElementById('transactionsList');
        let filteredTransactions = this.transactions;
        
        // Filter by category if needed
        if (category !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.category === category);
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found</p>
                    <small>Try changing your filter criteria</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.category}">
                        <i class="fas ${this.getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${this.formatCategory(transaction.category)} • ${this.formatDate(transaction.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.amount >= 0 ? 'income' : 'expense'}">
                    ${transaction.amount >= 0 ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="icon-btn edit-btn" onclick="expenseTracker.editTransaction('${transaction.id}')" title="Edit transaction">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-btn" onclick="expenseTracker.deleteTransaction('${transaction.id}')" title="Delete transaction">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = this.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const totalBalance = totalIncome - totalExpenses;
        
        document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    }
    
    getCategoryIcon(category) {
        const icons = {
            food: 'fa-utensils',
            transport: 'fa-car',
            shopping: 'fa-shopping-bag',
            bills: 'fa-file-invoice-dollar',
            entertainment: 'fa-film',
            healthcare: 'fa-heartbeat',
            education: 'fa-graduation-cap',
            other: 'fa-circle'
        };
        return icons[category] || 'fa-circle';
    }
    
    formatCategory(category) {
        const categories = {
            food: 'Food & Dining',
            transport: 'Transportation',
            shopping: 'Shopping',
            bills: 'Bills & Utilities',
            entertainment: 'Entertainment',
            healthcare: 'Healthcare',
            education: 'Education',
            other: 'Other'
        };
        return categories[category] || 'Other';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
    }
    
    resetForm() {
        document.getElementById('transactionForm').reset();
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Set default active button to expense
        document.querySelector('.type-btn[data-type="expense"]').classList.add('active');
        document.getElementById('type').value = 'expense';
        this.editingId = null;
        this.setCurrentDate();
    }
    
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }
    
    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
    
    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#F44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    closeModal() {
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingId = null;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.expenseTracker = new ExpenseTracker();
    
    // Add CSS for notifications and icon buttons
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .transaction-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .icon-btn {
            background: none;
            border: none;
            padding: 6px;
            border-radius: 4px;
            cursor: pointer;
            color: #666;
            transition: all 0.2s ease;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
        }
        
        .icon-btn:hover {
            background: #f5f5f5;
            color: #333;
        }
        
        .edit-btn:hover {
            color: #2196F3;
            background: #e3f2fd;
        }
        
        .delete-btn:hover {
            color: #f44336;
            background: #ffebee;
        }
        
        body[data-theme="dark"] .icon-btn {
            color: #aaa;
        }
        
        body[data-theme="dark"] .icon-btn:hover {
            background: #333;
            color: #fff;
        }
        
        body[data-theme="dark"] .edit-btn:hover {
            color: #64b5f6;
            background: #1e3a5f;
        }
        
        body[data-theme="dark"] .delete-btn:hover {
            color: #ef5350;
            background: #3c1e1e;
        }
    `;
    document.head.appendChild(style);
});