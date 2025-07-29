// Lead Manager Application
class LeadManager {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('leads')) || [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingLeadId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLeads();
        this.updateStats();
        this.addSampleData();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.status);
            });
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.setSearch(e.target.value);
        });

        // Lead form
        document.getElementById('leadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLead();
        });

        // Status options
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.changeLeadStatus(e.target.closest('.status-option').dataset.status);
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                    this.closeStatusModal();
                }
            });
        });
    }

    addSampleData() {
        if (this.leads.length === 0) {
            const sampleLeads = [
                {
                    id: 1,
                    name: 'Jan Kowalski',
                    phone: '+48 123 456 789',
                    email: 'jan.kowalski@email.com',
                    marketplace: 'Allegro',
                    status: 'new',
                    notes: 'Interesuje się produktem X',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Anna Nowak',
                    phone: '+48 987 654 321',
                    email: 'anna.nowak@email.com',
                    marketplace: 'OLX',
                    status: 'processing',
                    notes: 'Wysłałem ofertę, czekam na odpowiedź',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    name: 'Piotr Wiśniewski',
                    phone: '+48 555 123 456',
                    email: 'piotr.wisniewski@email.com',
                    marketplace: 'Facebook Marketplace',
                    status: 'positive',
                    notes: 'Klient bardzo zainteresowany',
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                }
            ];
            
            this.leads = sampleLeads;
            this.saveToStorage();
            this.renderLeads();
            this.updateStats();
        }
    }

    openModal(leadId = null) {
        this.editingLeadId = leadId;
        const modal = document.getElementById('leadModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('leadForm');

        if (leadId) {
            const lead = this.leads.find(l => l.id === leadId);
            if (lead) {
                title.textContent = 'Edytuj Lead';
                this.fillForm(lead);
            }
        } else {
            title.textContent = 'Nowy Lead';
            form.reset();
        }

        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('leadModal');
        modal.classList.remove('show');
        this.editingLeadId = null;
    }

    openStatusModal(leadId) {
        this.currentLeadId = leadId;
        const modal = document.getElementById('statusModal');
        modal.classList.add('show');
    }

    closeStatusModal() {
        const modal = document.getElementById('statusModal');
        modal.classList.remove('show');
        this.currentLeadId = null;
    }

    fillForm(lead) {
        document.getElementById('name').value = lead.name;
        document.getElementById('phone').value = lead.phone;
        document.getElementById('email').value = lead.email || '';
        document.getElementById('marketplace').value = lead.marketplace || '';
        document.getElementById('notes').value = lead.notes || '';
    }

    saveLead() {
        const formData = new FormData(document.getElementById('leadForm'));
        const leadData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            marketplace: formData.get('marketplace'),
            notes: formData.get('notes'),
            status: 'new',
            createdAt: new Date().toISOString()
        };

        if (this.editingLeadId) {
            // Update existing lead
            const index = this.leads.findIndex(l => l.id === this.editingLeadId);
            if (index !== -1) {
                this.leads[index] = { ...this.leads[index], ...leadData };
            }
        } else {
            // Add new lead
            leadData.id = Date.now();
            this.leads.unshift(leadData);
        }

        this.saveToStorage();
        this.renderLeads();
        this.updateStats();
        this.closeModal();
        this.showNotification('Lead został zapisany!', 'success');
    }

    changeLeadStatus(newStatus) {
        if (this.currentLeadId) {
            const lead = this.leads.find(l => l.id === this.currentLeadId);
            if (lead) {
                lead.status = newStatus;
                this.saveToStorage();
                this.renderLeads();
                this.updateStats();
                this.closeStatusModal();
                this.showNotification('Status został zmieniony!', 'success');
            }
        }
    }

    deleteLead(leadId) {
        if (confirm('Czy na pewno chcesz usunąć tego leada?')) {
            this.leads = this.leads.filter(l => l.id !== leadId);
            this.saveToStorage();
            this.renderLeads();
            this.updateStats();
            this.showNotification('Lead został usunięty!', 'success');
        }
    }

    setFilter(status) {
        this.currentFilter = status;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');
        
        this.renderLeads();
    }

    setSearch(query) {
        this.currentSearch = query.toLowerCase();
        this.renderLeads();
    }

    getFilteredLeads() {
        let filtered = this.leads;

        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === this.currentFilter);
        }

        // Filter by search
        if (this.currentSearch) {
            filtered = filtered.filter(lead => 
                lead.name.toLowerCase().includes(this.currentSearch) ||
                lead.phone.includes(this.currentSearch) ||
                lead.email.toLowerCase().includes(this.currentSearch) ||
                lead.marketplace.toLowerCase().includes(this.currentSearch) ||
                lead.notes.toLowerCase().includes(this.currentSearch)
            );
        }

        return filtered;
    }

    renderLeads() {
        const leadsList = document.getElementById('leadsList');
        const filteredLeads = this.getFilteredLeads();

        if (filteredLeads.length === 0) {
            leadsList.innerHTML = `
                <div class="no-leads">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #a0aec0; margin-bottom: 1rem;"></i>
                    <h3>Brak leadów</h3>
                    <p>Nie znaleziono leadów spełniających kryteria wyszukiwania.</p>
                </div>
            `;
            return;
        }

        leadsList.innerHTML = filteredLeads.map(lead => this.createLeadCard(lead)).join('');
    }

    createLeadCard(lead) {
        const statusLabels = {
            new: 'Nowy Lead',
            processing: 'W Obsłudze',
            negative: 'Negatyw',
            positive: 'Pozytyw',
            closed: 'Zamknięte'
        };

        const statusIcons = {
            new: 'fas fa-user-plus',
            processing: 'fas fa-clock',
            negative: 'fas fa-thumbs-down',
            positive: 'fas fa-thumbs-up',
            closed: 'fas fa-check-circle'
        };

        const createdAt = new Date(lead.createdAt).toLocaleDateString('pl-PL');

        return `
            <div class="lead-card ${lead.status}">
                <div class="lead-header">
                    <div>
                        <div class="lead-name">${lead.name}</div>
                        <div class="lead-status ${lead.status}">
                            <i class="${statusIcons[lead.status]}"></i>
                            ${statusLabels[lead.status]}
                        </div>
                    </div>
                </div>
                
                <div class="lead-info">
                    <p><i class="fas fa-phone"></i> ${lead.phone}</p>
                    ${lead.email ? `<p><i class="fas fa-envelope"></i> ${lead.email}</p>` : ''}
                    ${lead.marketplace ? `<p><i class="fas fa-store"></i> ${lead.marketplace}</p>` : ''}
                    ${lead.notes ? `<p><i class="fas fa-sticky-note"></i> ${lead.notes}</p>` : ''}
                    <p><i class="fas fa-calendar"></i> Utworzono: ${createdAt}</p>
                </div>
                
                <div class="lead-actions">
                    <button class="btn-change-status" onclick="leadManager.openStatusModal(${lead.id})">
                        <i class="fas fa-exchange-alt"></i> Zmień Status
                    </button>
                    <button class="btn-edit" onclick="leadManager.openModal(${lead.id})">
                        <i class="fas fa-edit"></i> Edytuj
                    </button>
                    <button class="btn-delete" onclick="leadManager.deleteLead(${lead.id})">
                        <i class="fas fa-trash"></i> Usuń
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const stats = {
            new: this.leads.filter(l => l.status === 'new').length,
            processing: this.leads.filter(l => l.status === 'processing').length,
            negative: this.leads.filter(l => l.status === 'negative').length,
            positive: this.leads.filter(l => l.status === 'positive').length,
            closed: this.leads.filter(l => l.status === 'closed').length
        };

        document.getElementById('newCount').textContent = stats.new;
        document.getElementById('processingCount').textContent = stats.processing;
        document.getElementById('positiveCount').textContent = stats.positive;
        document.getElementById('closedCount').textContent = stats.closed;
    }

    saveToStorage() {
        localStorage.setItem('leads', JSON.stringify(this.leads));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#1dd1a1' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function openModal() {
    leadManager.openModal();
}

function closeModal() {
    leadManager.closeModal();
}

function closeStatusModal() {
    leadManager.closeStatusModal();
}

// Initialize the application
let leadManager;
document.addEventListener('DOMContentLoaded', () => {
    leadManager = new LeadManager();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
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
    
    .no-leads {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        backdrop-filter: blur(10px);
    }
    
    .no-leads h3 {
        color: #4a5568;
        margin-bottom: 0.5rem;
    }
    
    .no-leads p {
        color: #718096;
    }
`;
document.head.appendChild(style);
