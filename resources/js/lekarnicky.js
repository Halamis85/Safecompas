// resources/js/lekarnicky.js - OPRAVENÁ VERZE

export function lekarnicky() {
    console.log('Lékárničky modul inicializován');

    // Globální proměnné
    let appData = {
        lekarnicke: [],
        material: [],
        urazy: [],
        stats: {},
        currentSection: 'prehled'
    };

    // CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // API helper funkce
    async function apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API chyba');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            showNotification('Chyba při komunikaci se serverem: ' + error.message, 'error');
            throw error;
        }
    }

    // Načtení dashboardu
    async function loadDashboard() {
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.style.display = 'block';

        try {
            const data = await apiCall('/api/lekarnicke/dashboard');

            appData.lekarnicke = data.lekarnicke || [];
            appData.stats = data.statistiky || {};

            updateStats();
            showDashboard();
            loadCurrentSection();

        } catch (error) {
            console.error('Chyba při načítání dashboard:', error);
            showNotification('Chyba při načítání dat', 'error');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    // Aktualizace statistik pomocí data-* atributů
    function updateStats() {
        const stats = appData.stats;

        // Používáme data-stat atributy místo ID
        const celkemEl = document.querySelector('[data-stat="celkem"]');
        const aktivniEl = document.querySelector('[data-stat="aktivni"]');
        const expirujiciEl = document.querySelector('[data-stat="expirujici"]');
        const nizkyStavEl = document.querySelector('[data-stat="nizky-stav"]');
        const kontrolaEl = document.querySelector('[data-stat="kontrola"]');
        const urazyEl = document.querySelector('[data-stat="urazy"]');

        if (celkemEl) celkemEl.textContent = stats.celkem_lekarnicek || 0;
        if (aktivniEl) aktivniEl.textContent = stats.aktivni_lekarnicke || 0;
        if (expirujiciEl) expirujiciEl.textContent = stats.expirujici_material || 0;
        if (nizkyStavEl) nizkyStavEl.textContent = stats.nizky_stav_material || 0;
        if (kontrolaEl) kontrolaEl.textContent = stats.potreba_kontroly || 0;
        if (urazyEl) urazyEl.textContent = stats.urazy_tento_mesic || 0;
    }

    // Zobrazení dashboardu
    function showDashboard() {
        const dashboardStats = document.getElementById('dashboard-stats');
        const navigationCards = document.getElementById('navigation-cards');

        if (dashboardStats) dashboardStats.style.display = 'flex';
        if (navigationCards) navigationCards.style.display = 'flex';
    }

    // Zobrazení sekce
    function showSection(section) {
        appData.currentSection = section;

        // Skrýt všechny sekce
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Zobrazit vybranou sekci
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Označit aktivní navigaci
        document.querySelectorAll('.navigation-card').forEach(el => {
            el.classList.remove('active');
        });

        const activeCard = document.querySelector(`[data-section="${section}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        // Načíst data pro sekci
        loadCurrentSection();
    }

    // Načtení dat aktuální sekce
    function loadCurrentSection() {
        switch (appData.currentSection) {
            case 'prehled':
                renderLekarnicke();
                break;
            case 'material':
                loadMaterial();
                break;
            case 'urazy':
                loadUrazy();
                break;
            case 'vykazy':
                setupVykazy();
                break;
        }
    }

    // Vykreslení lékárniček
    function renderLekarnicke() {
        const container = document.getElementById('lekarnicke-list');
        if (!container) return;

        container.innerHTML = '';

        if (appData.lekarnicke.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Žádné lékárničky nenalezeny</p>
                </div>
            `;
            return;
        }

        appData.lekarnicke.forEach(lekarnicky => {
            const card = createLekarnickCard(lekarnicky);
            container.appendChild(card);
        });
    }

    // Vytvoření karty lékárničky
    function createLekarnickCard(lekarnicky) {
        const statusClass = lekarnicky.status === 'aktivni' ? 'success' : 'warning';
        const expirujiciCount = lekarnicky.expirujici_material?.length || 0;
        const nizkyStavCount = lekarnicky.nizky_stav_material?.length || 0;

        const cardDiv = document.createElement('div');
        cardDiv.className = 'col-md-4 mb-3';
        cardDiv.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${lekarnicky.nazev}</h6>
                    <span class="badge bg-${statusClass}">${lekarnicky.status}</span>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-2">
                        <i class="fa-solid fa-location-dot"></i> ${lekarnicky.umisteni}
                    </p>
                    <p class="text-muted mb-2">
                        <i class="fa-solid fa-user"></i> ${lekarnicky.zodpovedna_osoba}
                    </p>

                    <div class="row text-center">
                        <div class="col">
                            <small class="text-muted">Materiály</small>
                            <div class="fw-bold">${lekarnicky.material?.length || 0}</div>
                        </div>
                        <div class="col">
                            <small class="text-warning">Expirují</small>
                            <div class="fw-bold text-warning">${expirujiciCount}</div>
                        </div>
                        <div class="col">
                            <small class="text-danger">Nízký stav</small>
                            <div class="fw-bold text-danger">${nizkyStavCount}</div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="btn-group w-100">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewLekarnicky(${lekarnicky.id})">
                            <i class="fa-solid fa-eye"></i> Detail
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="kontrolaLekarnicky(${lekarnicky.id})">
                            <i class="fa-solid fa-check"></i> Kontrola
                        </button>
                    </div>
                </div>
            </div>
        `;

        return cardDiv;
    }

    // Načtení materiálu
    function loadMaterial() {
        updateMaterialFilter();
        renderMaterialTable();

        // Inicializace DataTable pokud ještě není
        if ($.fn.DataTable && $.fn.DataTable.isDataTable('#materialTable')) {
            $('#materialTable').DataTable().destroy();
        }

        // Kontrola existence souboru s českým překladem
        const tableConfig = {
            responsive: true,
            pageLength: 25
        };

        // Přidat český překlad pokud existuje
        if (typeof $ !== 'undefined') {
            $.ajax({
                url: '/assets/cs.json',
                async: false,
                success: function() {
                    tableConfig.language = { url: '/assets/cs.json' };
                },
                error: function() {
                    // Český překlad není k dispozici, použít výchozí
                    console.log('Český překlad pro DataTables není k dispozici');
                }
            });
        }

        if ($.fn.DataTable) {
            $('#materialTable').DataTable(tableConfig);
        }
    }

    // Aktualizace filtru lékárniček
    function updateMaterialFilter() {
        const select = document.getElementById('material-lekarnicky-filter');
        if (!select) return;

        select.innerHTML = '<option value="">Všechny lékárničky</option>';

        appData.lekarnicke.forEach(lekarnicky => {
            const option = document.createElement('option');
            option.value = lekarnicky.id;
            option.textContent = lekarnicky.nazev;
            select.appendChild(option);
        });
    }

    // Vykreslení tabulky materiálu
    function renderMaterialTable() {
        const tbody = document.getElementById('material-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Získání všech materiálů ze všech lékárniček
        const allMaterial = [];
        appData.lekarnicke.forEach(lekarnicky => {
            if (lekarnicky.material) {
                lekarnicky.material.forEach(material => {
                    allMaterial.push({
                        ...material,
                        lekarnicky_nazev: lekarnicky.nazev
                    });
                });
            }
        });

        if (allMaterial.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">Žádný materiál nenalezen</td>
                </tr>
            `;
            return;
        }

        allMaterial.forEach(material => {
            const row = createMaterialRow(material);
            tbody.appendChild(row);
        });
    }

    // Vytvoření řádku materiálu
    function createMaterialRow(material) {
        const today = new Date();
        const expirationDate = material.datum_expirace ? new Date(material.datum_expirace) : null;

        let statusBadge = '<span class="badge bg-success">OK</span>';
        let statusClass = '';

        // Kontrola expirací
        if (expirationDate) {
            if (expirationDate < today) {
                statusBadge = '<span class="badge bg-danger">Expirováno</span>';
                statusClass = 'table-danger';
            } else if (expirationDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
                statusBadge = '<span class="badge bg-warning">Brzy expiruje</span>';
                statusClass = 'table-warning';
            }
        }

        // Kontrola nízkého stavu
        if (material.aktualni_pocet <= material.minimalni_pocet) {
            statusBadge += ' <span class="badge bg-danger">Nízký stav</span>';
            if (!statusClass) statusClass = 'table-warning';
        }

        const expirationText = expirationDate ?
            expirationDate.toLocaleDateString('cs-CZ') :
            'Není stanovena';

        const row = document.createElement('tr');
        row.className = statusClass;
        row.innerHTML = `
            <td>${material.lekarnicky_nazev}</td>
            <td>${material.nazev_materialu}</td>
            <td>${material.typ_materialu}</td>
            <td>${material.aktualni_pocet} ${material.jednotka}</td>
            <td>${material.minimalni_pocet} ${material.jednotka}</td>
            <td>${expirationText}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editMaterial(${material.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteMaterial(${material.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    // Načtení úrazů
    function loadUrazy() {
        // Inicializace DataTable pro úrazy
        if ($.fn.DataTable && $.fn.DataTable.isDataTable('#urazyTable')) {
            $('#urazyTable').DataTable().destroy();
        }

        if ($.fn.DataTable) {
            const tableConfig = {
                responsive: true,
                pageLength: 25
            };

            // Zkusit přidat český překlad
            if (typeof $ !== 'undefined') {
                $.ajax({
                    url: '/assets/cs.json',
                    async: false,
                    success: function() {
                        tableConfig.language = { url: '/assets/cs.json' };
                    },
                    error: function() {
                        console.log('Český překlad pro DataTables není k dispozici');
                    }
                });
            }

            $('#urazyTable').DataTable(tableConfig);
        }

        console.log('Loading urazy...');
        // TODO: Implementovat načtení úrazů z API
    }

    // Nastavení výkazů
    function setupVykazy() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        const exportOdEl = document.getElementById('export-od');
        const exportDoEl = document.getElementById('export-do');

        if (exportOdEl) exportOdEl.value = firstDay.toISOString().split('T')[0];
        if (exportDoEl) exportDoEl.value = today.toISOString().split('T')[0];
    }

    // ========== OPRAVENÉ MODAL FUNKCE ==========

    // Zavření modalu - jQuery způsob (kompatibilní s vaším kódem)


    // Zobrazení notifikace (stejný jako váš stávající systém)
    function showNotification(message, type = 'info') {
        const alertClass = type === 'success' ? 'alert-success' :
            type === 'error' ? 'alert-danger' : 'alert-info';

        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '2000';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Automatické skrytí po 5 sekundách
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // ========== GLOBÁLNÍ FUNKCE ==========

    // Globální funkce pro onclick handlery
    window.viewLekarnicky = async function(id) {
        try {
            const result = await apiCall(`/api/lekarnicke/${id}`);
            console.log('Detail lékárničky:', result);
            showNotification('Detail lékárničky načten', 'info');
            // TODO: Zobrazit modal s detailem
        } catch (error) {
            console.error('Chyba při načítání detailu:', error);
        }
    };

    window.kontrolaLekarnicky = async function(id) {
        if (!confirm('Opravdu chcete zaznamenat kontrolu této lékárničky?')) {
            return;
        }

        try {
            const result = await apiCall(`/api/lekarnicke/${id}/kontrola`, {
                method: 'POST'
            });

            if (result.success) {
                showNotification(result.message, 'success');
                await loadDashboard();
            }
        } catch (error) {
            console.error('Chyba při kontrole lékárničky:', error);
        }
    };

    window.editMaterial = function(id) {
        console.log('Edit material:', id);
        showNotification('Editace materiálu - zatím neimplementováno', 'info');
        // TODO: Implementovat editaci materiálu
    };

    window.deleteMaterial = async function(id) {
        if (!confirm('Opravdu chcete smazat tento materiál?')) {
            return;
        }

        try {
            const result = await apiCall(`/api/lekarnicke/material/${id}`, {
                method: 'DELETE'
            });

            if (result.success) {
                showNotification(result.message, 'success');
                await loadDashboard();
            }
        } catch (error) {
            console.error('Chyba při mazání materiálu:', error);
        }
    };

    // ========== EVENT LISTENERY ==========

    // Event listenery
    function setupEventListeners() {
        // Navigace mezi sekcemi
        document.querySelectorAll('.navigation-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                showSection(section);
            });
        });

        // Filter materiálu podle lékárničky
        const materialFilter = document.getElementById('material-lekarnicky-filter');
        if (materialFilter) {
            materialFilter.addEventListener('change', (e) => {
                filterMaterial(e.target.value);
            });
        }

        // Export výkazu
        const exportBtn = document.getElementById('export-vykaz');
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExportVykaz);
        }

        // Form submit pro přidání lékárničky
        const addLekarnickForm = document.getElementById('add-lekarnicky-form');
        if (addLekarnickForm) {
            addLekarnickForm.addEventListener('submit', handleAddLekarnicky);
        }
    }

    // Filter materiálu
    function filterMaterial(lekarnicky_id) {
        const rows = document.querySelectorAll('#material-tbody tr');

        if (!lekarnicky_id) {
            rows.forEach(row => row.style.display = '');
            return;
        }

        const selectedLekarnicky = appData.lekarnicke.find(l => l.id == lekarnicky_id);
        if (!selectedLekarnicky) return;

        // Skrýt všechny řádky
        rows.forEach(row => row.style.display = 'none');

        // Zobrazit pouze řádky s materiály z vybrané lékárničky
        selectedLekarnicky.material?.forEach(material => {
            // Najít řádek obsahující název materiálu
            rows.forEach(row => {
                if (row.textContent.includes(material.nazev_materialu)) {
                    row.style.display = '';
                }
            });
        });
    }

    // Handler pro export výkazu
    async function handleExportVykaz() {
        const odEl = document.getElementById('export-od');
        const doEl = document.getElementById('export-do');

        if (!odEl || !doEl) {
            showNotification('Chyba: Formulář není k dispozici', 'error');
            return;
        }

        const od = odEl.value;
        const do_date = doEl.value;

        try {
            const result = await apiCall(`/api/lekarnicke/export-vykaz?od=${od}&do=${do_date}`);
            console.log('Export data:', result);
            showNotification('Výkaz byl vygenerován', 'success');
        } catch (error) {
            console.error('Chyba při exportu výkazu:', error);
        }
    }

    // ========== OPRAVENÝ HANDLER PRO PŘIDÁNÍ LÉKÁRNIČKY ==========

    // Handler pro přidání lékárničky - OPRAVENO
    async function handleAddLekarnicky(e) {
        e.preventDefault();
        console.log('Odesílám formulář lékárničky...');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        console.log('Data k odeslání:', data);

        try {
            const result = await apiCall('/api/lekarnicke', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            console.log('Výsledek API:', result);

            if (result.success) {
                // JEDNODUCHÉ a SPOLEHLIVÉ zavření modalu
                const modal = document.getElementById('addLekarnickModal');
                if (modal) {
                    // Skrýt modal
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                    modal.removeAttribute('aria-modal');

                    // Odebrat backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }

                    // Obnovit body stav
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';

                    console.log('Modal zavřen úspěšně');
                }

                // Reset formuláře
                e.target.reset();
                console.log('Formulář resetován');

                // Zobrazit úspěšnou zprávu
                showNotification(result.message || 'Lékárnička byla úspěšně přidána', 'success');

                // Znovu načíst dashboard
                console.log('Načítám dashboard...');
                await loadDashboard();

            } else {
                showNotification(result.message || 'Chyba při ukládání', 'error');
            }
        } catch (error) {
            console.error('Chyba při přidávání lékárničky:', error);
            showNotification('Chyba při komunikaci se serverem: ' + error.message, 'error');
        }
    }

    // ========== INICIALIZACE ==========

    // Inicializace
    setupEventListeners();
    loadDashboard();
}
