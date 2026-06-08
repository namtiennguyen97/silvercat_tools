document.addEventListener('DOMContentLoaded', () => {
    const coinTableBody = document.getElementById('coin-table-body');
    const coinTableWrapper = document.getElementById('coin-table-wrapper');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const lastUpdated = document.getElementById('last-updated');
    const currencySelect = document.getElementById('currency-select');
    const searchInput = document.getElementById('search-input');
    const autoRefresh = document.getElementById('auto-refresh');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnRetry = document.getElementById('btn-retry');

    // Modal elements
    const chartModal = document.getElementById('chart-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCoinName = document.getElementById('modal-coin-name');
    const modalPrice = document.getElementById('modal-price');
    const modalChange = document.getElementById('modal-change');
    const chartDays = document.getElementById('chart-days');
    const chartLoading = document.getElementById('chart-loading');
    const priceChart = document.getElementById('price-chart');

    let coinData = [];
    let refreshTimer = null;
    let currentChart = null;
    let currentCoinId = null;

    const CURRENCY_SYMBOLS = {
        usd: '$', eur: '€', gbp: '£', jpy: '¥', vnd: '₫', btc: '₿'
    };

    // Fetch prices from CoinGecko
    async function fetchPrices() {
        const currency = currencySelect.value;
        showLoading(true);
        showError(false);

        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
                {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(15000)
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            coinData = await response.json();
            renderTable();
            showLoading(false);
            coinTableWrapper.style.display = 'block';

            lastUpdated.textContent = 'Updated: ' + new Date().toLocaleTimeString();
        } catch (err) {
            console.warn('CoinGecko fetch failed:', err.message);
            showLoading(false);
            showError(true);
        }
    }

    function showLoading(show) {
        loadingState.style.display = show ? 'flex' : 'none';
        if (show) coinTableWrapper.style.display = 'none';
    }

    function showError(show) {
        errorState.style.display = show ? 'flex' : 'none';
        if (show) coinTableWrapper.style.display = 'none';
    }

    function renderTable() {
        const currency = currencySelect.value;
        const symbol = CURRENCY_SYMBOLS[currency] || '$';
        const search = searchInput.value.toLowerCase().trim();

        const filtered = coinData.filter(coin =>
            !search ||
            coin.name.toLowerCase().includes(search) ||
            coin.symbol.toLowerCase().includes(search)
        );

        coinTableBody.innerHTML = '';

        if (filtered.length === 0) {
            coinTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No coins found matching your search.</td></tr>';
            return;
        }

        filtered.forEach((coin, index) => {
            const tr = document.createElement('tr');
            tr.className = 'coin-row';
            tr.style.cursor = 'pointer';
            tr.setAttribute('data-coin-id', coin.id);
            tr.setAttribute('data-coin-symbol', coin.symbol.toUpperCase());
            tr.setAttribute('data-coin-name', coin.name);
            tr.setAttribute('data-coin-image', coin.image);
            tr.setAttribute('data-coin-price', coin.current_price);
            tr.setAttribute('data-coin-change', coin.price_change_percentage_24h);

            tr.addEventListener('click', () => openChartModal(coin));

            const price = formatPrice(coin.current_price, symbol);
            const change24h = coin.price_change_percentage_24h;
            const changeClass = change24h >= 0 ? 'positive' : 'negative';
            const changeSign = change24h >= 0 ? '+' : '';
            const marketCap = formatLargeNumber(coin.market_cap, symbol);
            const volume = formatLargeNumber(coin.total_volume, symbol);

            tr.innerHTML = `
                <td class="coin-rank">${coin.market_cap_rank || '-'}</td>
                <td class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}" class="coin-icon" width="24" height="24" loading="lazy">
                    <span class="coin-name">${coin.name}</span>
                    <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
                </td>
                <td class="coin-price">${price}</td>
                <td class="coin-change ${changeClass}">${changeSign}${change24h != null ? change24h.toFixed(2) : '?'}%</td>
                <td class="coin-mcap hide-mobile">${marketCap}</td>
                <td class="coin-volume hide-mobile">${volume}</td>
            `;

            coinTableBody.appendChild(tr);
        });
    }

    // ============= MODAL & CHART =============
    function openChartModal(coin) {
        currentCoinId = coin.id;
        modalCoinName.innerHTML = `<img src="${coin.image}" alt="${coin.name}" width="20" height="20" style="border-radius:50%;vertical-align:middle;"> ${coin.name}`;
        modalPrice.textContent = formatPrice(coin.current_price, CURRENCY_SYMBOLS[currencySelect.value] || '$');
        const ch = coin.price_change_percentage_24h;
        if (ch != null) {
            modalChange.textContent = (ch >= 0 ? '+' : '') + ch.toFixed(2) + '%';
            modalChange.className = 'modal-change ' + (ch >= 0 ? 'up' : 'down');
        } else {
            modalChange.textContent = '—';
            modalChange.className = 'modal-change';
        }
        chartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loadChart(coin.id);
    }

    function closeModal() {
        chartModal.style.display = 'none';
        document.body.style.overflow = '';
        if (currentChart) { currentChart.destroy(); currentChart = null; }
        currentCoinId = null;
    }

    modalClose.addEventListener('click', closeModal);
    chartModal.addEventListener('click', (e) => {
        if (e.target === chartModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chartModal.style.display === 'flex') closeModal();
    });

    chartDays.addEventListener('change', () => {
        if (currentCoinId) loadChart(currentCoinId);
    });

    async function loadChart(coinId) {
        chartLoading.style.display = 'flex';
        priceChart.style.display = 'none';
        if (currentChart) { currentChart.destroy(); currentChart = null; }

        const currency = currencySelect.value;
        const days = chartDays.value;

        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
                {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(15000)
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data.prices || data.prices.length === 0) {
                throw new Error('No chart data');
            }

            const labels = data.prices.map(p => {
                const d = new Date(p[0]);
                if (days === '1') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (days === '7') return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
            });
            const prices = data.prices.map(p => p[1]);
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            const isUp = lastPrice >= firstPrice;

            chartLoading.style.display = 'none';
            priceChart.style.display = 'block';

            const ctx = priceChart.getContext('2d');

            // Create gradient fill
            const gradient = ctx.createLinearGradient(0, 0, 0, 280);
            if (isUp) {
                gradient.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
                gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(248, 113, 113, 0.25)');
                gradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
            }

            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: coinId.toUpperCase(),
                        data: prices,
                        borderColor: isUp ? '#34d399' : '#f87171',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: isUp ? '#34d399' : '#f87171',
                        fill: true,
                        tension: 0.3,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#94a3b8',
                            bodyColor: '#e2e8f0',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 10,
                            callbacks: {
                                label: (ctx) => {
                                    const symbol = CURRENCY_SYMBOLS[currencySelect.value] || '$';
                                    return symbol + ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { color: 'rgba(255,255,255,0.03)' },
                            ticks: {
                                color: '#64748b',
                                maxTicksLimit: 6,
                                font: { size: 10 }
                            }
                        },
                        y: {
                            display: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: {
                                color: '#64748b',
                                font: { size: 10 },
                                callback: (val) => {
                                    const symbol = CURRENCY_SYMBOLS[currencySelect.value] || '$';
                                    if (val >= 1000) return symbol + (val / 1000).toFixed(1) + 'K';
                                    if (val >= 1) return symbol + val.toFixed(2);
                                    return symbol + val.toPrecision(4);
                                }
                            }
                        }
                    }
                }
            });

        } catch (err) {
            console.warn('Chart fetch failed:', err.message);
            chartLoading.style.display = 'flex';
            chartLoading.innerHTML = '<span style="color:#f87171;">⚠️ Could not load chart data. CoinGecko may be rate-limited.</span>';
            priceChart.style.display = 'none';
        }
    }

    function formatPrice(num, symbol) {
        if (num == null) return symbol + '?';
        if (num < 0.01) return symbol + num.toPrecision(4);
        if (num < 1) return symbol + num.toFixed(4);
        if (num < 1000) return symbol + num.toFixed(2);
        return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatLargeNumber(num, symbol) {
        if (num == null) return symbol + '?';
        if (num >= 1e12) return symbol + (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return symbol + (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return symbol + (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return symbol + (num / 1e3).toFixed(2) + 'K';
        return symbol + num.toFixed(2);
    }

    // Auto-refresh timer
    function startAutoRefresh() {
        stopAutoRefresh();
        if (autoRefresh.checked) {
            refreshTimer = setInterval(fetchPrices, 30000);
        }
    }

    function stopAutoRefresh() {
        if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    }

    // Event listeners
    btnRefresh.addEventListener('click', fetchPrices);
    btnRetry.addEventListener('click', fetchPrices);
    currencySelect.addEventListener('change', fetchPrices);
    autoRefresh.addEventListener('change', startAutoRefresh);
    searchInput.addEventListener('input', () => renderTable());

    // Initial fetch
    fetchPrices();
    startAutoRefresh();
});