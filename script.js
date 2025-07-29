// QSell Lead Manager Application
class QSellLeadManager {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('qsell_leads')) || [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingLeadId = null;
        this.filters = {
            status: 'all',
            marketplace: '',
            priority: '',
            category: '',
            minValue: '',
            maxValue: '',
            dateFrom: '',
            dateTo: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLeads();
        this.updateStats();
        this.addSampleData();
        this.updateLeadsCount();
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

        // Advanced filters
        document.getElementById('marketplaceFilter').addEventListener('change', (e) => {
            this.filters.marketplace = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.applyFilters();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('minValue').addEventListener('input', (e) => {
            this.filters.minValue = e.target.value;
        });

        document.getElementById('maxValue').addEventListener('input', (e) => {
            this.filters.maxValue = e.target.value;
        });

        document.getElementById('dateFrom').addEventListener('change', (e) => {
            this.filters.dateFrom = e.target.value;
        });

        document.getElementById('dateTo').addEventListener('change', (e) => {
            this.filters.dateTo = e.target.value;
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
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
                    company: 'TechCorp Sp. z o.o.',
                    phone: '+48 123 456 789',
                    email: 'jan.kowalski@techcorp.pl',
                    marketplace: 'Allegro',
                    category: 'sales',
                    priority: 'high',
                    estimatedValue: 5000,
                    status: 'new',
                    notes: 'Interesuje się integracją z Basellinker',
                    nextAction: 'Zadzwonić za 2 dni',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Anna Nowak',
                    company: 'E-commerce Solutions',
                    phone: '+48 987 654 321',
                    email: 'anna.nowak@ecsolutions.pl',
                    marketplace: 'Amazon',
                    category: 'integration',
                    priority: 'medium',
                    estimatedValue: 8000,
                    status: 'processing',
                    notes: 'Wysłałem ofertę, czekam na odpowiedź',
                    nextAction: 'Wysłać follow-up email',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    name: 'Piotr Wiśniewski',
                    company: 'Online Store',
                    phone: '+48 555 123 456',
                    email: 'piotr.wisniewski@onlinestore.pl',
                    marketplace: 'eBay',
                    category: 'support',
                    priority: 'low',
                    estimatedValue: 2000,
                    status: 'positive',
                    notes: 'Klient bardzo zainteresowany naszymi usługami',
                    nextAction: 'Umówić spotkanie',
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 4,
                    name: 'Maria Zielińska',
                    company: 'Digital Commerce',
                    phone: '+48 777 888 999',
                    email: 'maria.zielinska@digitalcommerce.pl',
                    marketplace: 'eMAG',
                    category: 'consultation',
                    priority: 'high',
                    estimatedValue: 12000,
                    status: 'closed',
                    notes: 'Podpisana umowa, projekt w realizacji',
                    nextAction: 'Monitoring projektu',
                    createdAt: new Date(Date.now() - 259200000).toISOString()
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

    openTemplates() {
        const modal = document.getElementById('templatesModal');
        modal.classList.add('show');
    }

    closeTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        modal.classList.remove('show');
    }

    openDashboard() {
        const modal = document.getElementById('dashboardModal');
        modal.classList.add('show');
    }

    closeDashboardModal() {
        const modal = document.getElementById('dashboardModal');
        modal.classList.remove('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.editingLeadId = null;
        this.currentLeadId = null;
    }

    fillForm(lead) {
        document.getElementById('name').value = lead.name;
        document.getElementById('company').value = lead.company || '';
        document.getElementById('phone').value = lead.phone;
        document.getElementById('email').value = lead.email || '';
        document.getElementById('marketplace').value = lead.marketplace || '';
        document.getElementById('category').value = lead.category || 'sales';
        document.getElementById('priority').value = lead.priority || 'medium';
        document.getElementById('estimatedValue').value = lead.estimatedValue || '';
        document.getElementById('notes').value = lead.notes || '';
        document.getElementById('nextAction').value = lead.nextAction || '';
    }

    saveLead() {
        const formData = new FormData(document.getElementById('leadForm'));
        const leadData = {
            name: formData.get('name'),
            company: formData.get('company'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            marketplace: formData.get('marketplace'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            estimatedValue: parseFloat(formData.get('estimatedValue')) || 0,
            notes: formData.get('notes'),
            nextAction: formData.get('nextAction'),
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
        this.updateLeadsCount();
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
            this.updateLeadsCount();
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

    toggleFilters() {
        const content = document.getElementById('filtersContent');
        const button = document.querySelector('.filters-header button');
        const icon = button.querySelector('i');
        
        if (content.classList.contains('show')) {
            content.classList.remove('show');
            icon.className = 'fas fa-chevron-down';
            button.innerHTML = '<i class="fas fa-chevron-down"></i> Rozwiń';
        } else {
            content.classList.add('show');
            icon.className = 'fas fa-chevron-up';
            button.innerHTML = '<i class="fas fa-chevron-up"></i> Zwiń';
        }
    }

    applyFilters() {
        this.renderLeads();
    }

    clearFilters() {
        this.filters = {
            status: 'all',
            marketplace: '',
            priority: '',
            category: '',
            minValue: '',
            maxValue: '',
            dateFrom: '',
            dateTo: ''
        };

        // Reset form inputs
        document.getElementById('marketplaceFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('minValue').value = '';
        document.getElementById('maxValue').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';

        this.renderLeads();
        this.showNotification('Filtry zostały wyczyszczone!', 'success');
    }

    getFilteredLeads() {
        let filtered = this.leads;

        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === this.currentFilter);
        }

        // Filter by marketplace
        if (this.filters.marketplace) {
            filtered = filtered.filter(lead => lead.marketplace === this.filters.marketplace);
        }

        // Filter by priority
        if (this.filters.priority) {
            filtered = filtered.filter(lead => lead.priority === this.filters.priority);
        }

        // Filter by category
        if (this.filters.category) {
            filtered = filtered.filter(lead => lead.category === this.filters.category);
        }

        // Filter by value range
        if (this.filters.minValue) {
            filtered = filtered.filter(lead => lead.estimatedValue >= parseFloat(this.filters.minValue));
        }
        if (this.filters.maxValue) {
            filtered = filtered.filter(lead => lead.estimatedValue <= parseFloat(this.filters.maxValue));
        }

        // Filter by date range
        if (this.filters.dateFrom) {
            filtered = filtered.filter(lead => new Date(lead.createdAt) >= new Date(this.filters.dateFrom));
        }
        if (this.filters.dateTo) {
            filtered = filtered.filter(lead => new Date(lead.createdAt) <= new Date(this.filters.dateTo));
        }

        // Filter by search
        if (this.currentSearch) {
            filtered = filtered.filter(lead => 
                lead.name.toLowerCase().includes(this.currentSearch) ||
                lead.company?.toLowerCase().includes(this.currentSearch) ||
                lead.phone.includes(this.currentSearch) ||
                lead.email?.toLowerCase().includes(this.currentSearch) ||
                lead.marketplace.toLowerCase().includes(this.currentSearch) ||
                lead.notes?.toLowerCase().includes(this.currentSearch)
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
                    <i class="fas fa-inbox" style="font-size: 3rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;"></i>
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

        const priorityLabels = {
            low: 'Niski',
            medium: 'Średni',
            high: 'Wysoki'
        };

        const categoryLabels = {
            sales: 'Sprzedaż',
            support: 'Wsparcie',
            integration: 'Integracja',
            consultation: 'Konsultacja'
        };

        const createdAt = new Date(lead.createdAt).toLocaleDateString('pl-PL');

        return `
            <div class="lead-card ${lead.status}">
                <div class="lead-header">
                    <div>
                        <div class="lead-name">${lead.name}</div>
                        ${lead.company ? `<div class="lead-company">${lead.company}</div>` : ''}
                        <div class="lead-status ${lead.status}">
                            <i class="${statusIcons[lead.status]}"></i>
                            ${statusLabels[lead.status]}
                        </div>
                    </div>
                </div>
                
                <div class="lead-info">
                    <p><i class="fas fa-phone"></i> ${lead.phone}</p>
                    ${lead.email ? `<p><i class="fas fa-envelope"></i> ${lead.email}</p>` : ''}
                    <p><i class="fas fa-store"></i> ${lead.marketplace}</p>
                    <p><i class="fas fa-tag"></i> ${categoryLabels[lead.category]}</p>
                    <div class="lead-priority ${lead.priority}">${priorityLabels[lead.priority]}</div>
                    ${lead.estimatedValue > 0 ? `<p><i class="fas fa-euro-sign"></i> ${lead.estimatedValue.toLocaleString('pl-PL')} zł</p>` : ''}
                    ${lead.notes ? `<p><i class="fas fa-sticky-note"></i> ${lead.notes}</p>` : ''}
                    ${lead.nextAction ? `<p><i class="fas fa-tasks"></i> ${lead.nextAction}</p>` : ''}
                    <p><i class="fas fa-calendar"></i> Utworzono: ${createdAt}</p>
                </div>
                
                <div class="lead-actions">
                    <button class="btn-change-status" onclick="qsellLeadManager.openStatusModal(${lead.id})">
                        <i class="fas fa-exchange-alt"></i> Zmień Status
                    </button>
                    <button class="btn-edit" onclick="qsellLeadManager.openModal(${lead.id})">
                        <i class="fas fa-edit"></i> Edytuj
                    </button>
                    <button class="btn-delete" onclick="qsellLeadManager.deleteLead(${lead.id})">
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

        const totalValue = this.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

        document.getElementById('newCount').textContent = stats.new;
        document.getElementById('processingCount').textContent = stats.processing;
        document.getElementById('positiveCount').textContent = stats.positive;
        document.getElementById('closedCount').textContent = stats.closed;
        document.getElementById('totalValue').textContent = totalValue.toLocaleString('pl-PL') + ' zł';
    }

    updateLeadsCount() {
        const filteredLeads = this.getFilteredLeads();
        document.getElementById('leadsCount').textContent = `${filteredLeads.length} leadów`;
    }

    saveToStorage() {
        localStorage.setItem('qsell_leads', JSON.stringify(this.leads));
    }

    exportToExcel() {
        const filteredLeads = this.getFilteredLeads();
        
        if (filteredLeads.length === 0) {
            this.showNotification('Brak leadów do eksportu!', 'error');
            return;
        }

        // Create CSV content
        const headers = ['Imię', 'Firma', 'Telefon', 'Email', 'Marketplace', 'Kategoria', 'Priorytet', 'Wartość', 'Status', 'Notatki', 'Następna Akcja', 'Data Utworzenia'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map(lead => [
                lead.name,
                lead.company || '',
                lead.phone,
                lead.email || '',
                lead.marketplace,
                lead.category,
                lead.priority,
                lead.estimatedValue || 0,
                lead.status,
                (lead.notes || '').replace(/,/g, ';'),
                (lead.nextAction || '').replace(/,/g, ';'),
                new Date(lead.createdAt).toLocaleDateString('pl-PL')
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `qsell_leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Eksport zakończony!', 'success');
    }

    openReminders() {
        const reminders = this.leads.filter(lead => lead.nextAction && lead.status !== 'closed');
        
        if (reminders.length === 0) {
            this.showNotification('Brak przypomnień!', 'info');
            return;
        }

        let message = 'Przypomnienia:\n\n';
        reminders.forEach(lead => {
            message += `• ${lead.name} (${lead.company || 'Brak firmy'}): ${lead.nextAction}\n`;
        });

        alert(message);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const bgColor = type === 'success' ? '#00ff00' : type === 'error' ? '#ff0000' : '#ff0000';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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
    qsellLeadManager.openModal();
}

function closeModal() {
    qsellLeadManager.closeModal();
}

function closeStatusModal() {
    qsellLeadManager.closeStatusModal();
}

function closeTemplatesModal() {
    qsellLeadManager.closeTemplatesModal();
}

function closeDashboardModal() {
    qsellLeadManager.closeDashboardModal();
}

function toggleFilters() {
    qsellLeadManager.toggleFilters();
}

function clearFilters() {
    qsellLeadManager.clearFilters();
}

function applyFilters() {
    qsellLeadManager.applyFilters();
}

function exportToExcel() {
    qsellLeadManager.exportToExcel();
}

function openTemplates() {
    qsellLeadManager.openTemplates();
}

function openReminders() {
    qsellLeadManager.openReminders();
}

function openDashboard() {
    qsellLeadManager.openDashboard();
}

function copyTemplate(button) {
    const templateText = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(templateText).then(() => {
        qsellLeadManager.showNotification('Szablon skopiowany!', 'success');
    });
}

// Initialize the application
let qsellLeadManager;
document.addEventListener('DOMContentLoaded', () => {
    qsellLeadManager = new QSellLeadManager();
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
        background: rgba(0, 0, 0, 0.8);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .no-leads h3 {
        color: white;
        margin-bottom: 0.5rem;
    }
    
    .no-leads p {
        color: rgba(255, 255, 255, 0.7);
    }
`;
document.head.appendChild(style); 
