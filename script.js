/* ===========================
   PulseMetrics — script.js
   =========================== */

// ─── Data (₹ INR — 1 USD ≈ ₹83.5) ───
const salesData = [
    { month: 'Jan', amount: 100200,  orders: 28 },
    { month: 'Feb', amount: 150300,  orders: 35 },
    { month: 'Mar', amount:  75150,  orders: 22 },
    { month: 'Apr', amount: 208700,  orders: 42 }
];

const productsData = [
    { rank: 1, name: 'MacBook Pro',       category: 'Electronics', sales: 3511200, units: 42,  contribution: 34 },
    { rank: 2, name: 'Dell Monitor',      category: 'Electronics', sales: 2338000, units: 56,  contribution: 22 },
    { rank: 3, name: 'Logitech Keyboard', category: 'Accessories', sales: 1252500, units: 150, contribution: 12 },
    { rank: 4, name: 'iPhone 15',         category: 'Electronics', sales: 1043750, units: 25,  contribution: 10 },
    { rank: 5, name: 'AirPods Pro',       category: 'Audio',       sales:  684700, units: 82,  contribution:  7 }
];

const categoryColors = {
    Electronics: '#00d4ff',
    Accessories: '#00e5a0',
    Audio: '#a78bfa'
};

const donutData = [
    { label: 'Electronics', pct: 66, color: '#00d4ff' },
    { label: 'Accessories', pct: 12, color: '#00e5a0' },
    { label: 'Audio',       pct:  7, color: '#a78bfa' },
    { label: 'Other',       pct: 15, color: '#334155' }
];

const barColors = ['#00d4ff','#00e5a0','#a78bfa','#ffb347'];

// ─── Utilities ───
function fmt(n) {
    if (n >= 1e7) return '₹' + (n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + 'L';
    return '₹' + n.toLocaleString('en-IN');
}

function fmtFull(n) {
    return '₹' + n.toLocaleString('en-IN');
}

// ─── Clock ───
function startClock() {
    const clocks = document.querySelectorAll('.clock');
    function tick() {
        const now = new Date();
        const t = now.toLocaleTimeString('en-IN', { hour12: false });
        clocks.forEach(c => c.textContent = t);
    }
    tick();
    setInterval(tick, 1000);
}

// ─── Sidebar toggle ───
function setupSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    if (!hamburger || !sidebar) return;

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            e.target !== hamburger) {
            sidebar.classList.remove('open');
        }
    });
}

// ─── Sparkline SVG ───
function renderSparkline(containerId, values, color) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const w = 120, h = 28;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
        return `${x},${y}`;
    });
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%">
        <defs>
            <linearGradient id="sg${containerId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <polygon points="${pts[0]},${h} ${pts.join(' ')} ${pts[pts.length-1].split(',')[0]},${h}" fill="url(#sg${containerId})"/>
    </svg>`;
}

// ─── Bar Chart ───
function renderBarChart(containerId, data, valKey, labelKey, colorArr) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = Math.max(...data.map(d => d[valKey]));
    el.innerHTML = '';
    data.forEach((item, i) => {
        const pct = (item[valKey] / max) * 100;
        const color = colorArr ? colorArr[i % colorArr.length] : '#00d4ff';
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
            <div class="bar-label">${item[labelKey]}</div>
            <div class="bar-track">
                <div class="bar-fill" data-pct="${pct}" style="background: linear-gradient(90deg, ${color}, ${color}88)">
                    ${fmtFull(item[valKey])}
                </div>
            </div>
            <div class="bar-val">${fmt(item[valKey])}</div>
        `;
        el.appendChild(row);
    });
    // Animate
    requestAnimationFrame(() => {
        el.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.pct + '%';
        });
    });
}

// ─── Donut Chart ───
function renderDonut() {
    const svg = document.getElementById('donutSvg');
    const legendEl = document.getElementById('donutLegend');
    if (!svg) return;

    const cx = 100, cy = 100, r = 70, strokeW = 22;
    const circ = 2 * Math.PI * r;

    svg.innerHTML = '';

    // Background circle
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#141c2e'); bg.setAttribute('stroke-width', strokeW);
    svg.appendChild(bg);

    let offset = 0;
    donutData.forEach(seg => {
        const dash = (seg.pct / 100) * circ;
        const gap = circ - dash;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', seg.color);
        circle.setAttribute('stroke-width', strokeW);
        circle.setAttribute('stroke-dasharray', `${dash} ${gap}`);
        circle.setAttribute('stroke-dashoffset', circ * 0.25 - offset * circ);
        circle.setAttribute('stroke-linecap', 'butt');
        circle.style.transition = 'stroke-dasharray 1s ease';
        svg.appendChild(circle);
        offset += seg.pct / 100;
    });

    // Legend
    if (legendEl) {
        legendEl.innerHTML = donutData.map(s => `
            <div class="legend-item">
                <div class="legend-dot" style="background:${s.color}"></div>
                <span class="legend-name">${s.label}</span>
                <span class="legend-pct">${s.pct}%</span>
            </div>
        `).join('');
    }
}

// ─── KPI Update ───
function updateKPIs() {
    const total = salesData.reduce((s, d) => s + d.amount, 0);
    const orders = salesData.reduce((s, d) => s + d.orders, 0);
    const avg = Math.round(total / orders);

    const el = id => document.getElementById(id);
    if (el('totalSales')) el('totalSales').textContent = fmt(total);
    if (el('totalOrders')) el('totalOrders').textContent = orders;
    if (el('avgOrder')) el('avgOrder').textContent = fmt(avg);

    // Sparklines
    renderSparkline('spk1', salesData.map(d => d.amount), '#00d4ff');
    renderSparkline('spk2', salesData.map(d => d.orders), '#00e5a0');
    renderSparkline('spk3', salesData.map(d => Math.round(d.amount / d.orders)), '#ffb347');
    renderSparkline('spk4', [4.6, 4.9, 4.5, 4.8], '#a78bfa');
}

// ─── Filter Tabs ───
function setupFilter() {
    const tabs = document.querySelectorAll('#filterTabs .ftab');
    if (!tabs.length) return;

    const total = salesData.reduce((s, d) => s + d.amount, 0);
    const orders = salesData.reduce((s, d) => s + d.orders, 0);
    const avg = Math.round(total / orders);

    const set = (period, rev, ord, av) => {
        const p = document.getElementById('frPeriod');
        const r = document.getElementById('frRevenue');
        const o = document.getElementById('frOrders');
        const a = document.getElementById('frAvg');
        if (p) p.textContent = period;
        if (r) r.textContent = fmtFull(rev);
        if (o) o.textContent = ord;
        if (a) a.textContent = fmtFull(av);
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const val = tab.dataset.val;
            if (val === 'all') {
                set('All Months', total, orders, avg);
            } else {
                const m = salesData.find(d => d.month === val);
                if (m) set(val + ' 2024', m.amount, m.orders, Math.round(m.amount / m.orders));
            }
        });
    });
}

// ─── Gauge SVG ───
function drawGauge(pct) {
    const svg = document.getElementById('gaugeSvg');
    if (!svg) return;
    const r = 40, cx = 50, cy = 50;
    const startAngle = -Math.PI;
    const endAngle = 0;
    const totalArc = endAngle - startAngle;
    const angle = startAngle + totalArc * (pct / 100);

    function polarToXY(a, radius) {
        return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    }

    const s = polarToXY(startAngle, r);
    const e = polarToXY(endAngle, r);
    const a = polarToXY(angle, r);

    svg.innerHTML = `
        <path d="M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}" fill="none" stroke="#1a2540" stroke-width="8" stroke-linecap="round"/>
        <path d="M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${a.x} ${a.y}" fill="none" stroke="#00d4ff" stroke-width="8" stroke-linecap="round" style="filter:drop-shadow(0 0 4px #00d4ff)"/>
    `;
}

// ─── What-If Projector ───
function setupProjector() {
    const slider = document.getElementById('growthSlider');
    if (!slider) return;

    const total = salesData.reduce((s, d) => s + d.amount, 0);

    const update = (pct) => {
        const projected = Math.round(total * (1 + pct / 100));
        const delta = projected - total;
        const el = id => document.getElementById(id);
        if (el('growthPercent')) el('growthPercent').textContent = pct;
        if (el('projectedAmount')) el('projectedAmount').textContent = fmtFull(projected);
        if (el('projDelta')) el('projDelta').textContent = `▲ +${fmtFull(delta)} uplift`;
        if (el('gaugeVal')) el('gaugeVal').textContent = pct + '%';
        drawGauge(pct);
    };

    slider.addEventListener('input', e => update(parseInt(e.target.value)));
    update(15);
}

// ─── Monthly Report Table ───
function loadMonthlyReport() {
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) return;

    // Month summary cards
    const cardsEl = document.getElementById('monthCards');
    if (cardsEl) {
        cardsEl.innerHTML = salesData.map((m, i) => {
            const prev = i > 0 ? salesData[i-1].amount : m.amount;
            const growth = ((m.amount - prev) / prev * 100).toFixed(1);
            const isUp = growth >= 0;
            const barW = (m.amount / Math.max(...salesData.map(d => d.amount))) * 100;
            const color = barColors[i % barColors.length];
            return `
                <div class="month-card">
                    <div class="mc-month">${m.month} 2024</div>
                    <div class="mc-revenue" style="color:${color}">${fmtFull(m.amount)}</div>
                    <div class="mc-orders">${m.orders} orders · Avg ${fmtFull(Math.round(m.amount / m.orders))}</div>
                    <div class="mc-trend ${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'} ${Math.abs(growth)}% MoM</div>
                    <div class="mc-bar" style="background:${color}33;width:100%">
                        <div style="height:100%;width:${barW}%;background:${color};border-radius:2px;transition:width 1s ease"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Table
    tbody.innerHTML = '';
    salesData.forEach((item, index) => {
        const prev = index > 0 ? salesData[index-1].amount : item.amount;
        const growth = ((item.amount - prev) / prev * 100).toFixed(1);
        const isUp = growth >= 0;
        const status = item.amount >= 150000 ? '<span style="color:var(--green);font-size:0.72rem">● Strong</span>'
                     : item.amount >= 100000 ? '<span style="color:var(--amber);font-size:0.72rem">● Moderate</span>'
                     : '<span style="color:var(--red);font-size:0.72rem">● Weak</span>';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td class="td-mono">${item.month} 2024</td>
            <td class="td-mono" style="color:var(--cyan)">${fmtFull(item.amount)}</td>
            <td class="td-mono">${item.orders}</td>
            <td class="td-mono">${fmtFull(Math.round(item.amount / item.orders))}</td>
            <td class="td-mono ${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'} ${Math.abs(growth)}%</td>
            <td>${status}</td>
        `;
    });

    renderBarChart('comparisonChart', salesData, 'amount', 'month', barColors);
}

// ─── Products ───
function loadProducts(filter = 'all') {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const filtered = filter === 'all' ? productsData : productsData.filter(p => p.category === filter);
    const maxSales = Math.max(...filtered.map(p => p.sales));

    tbody.innerHTML = '';
    filtered.forEach(product => {
        const barW = (product.sales / maxSales) * 100;
        const rankClass = product.rank <= 3 ? `rank-${product.rank}` : 'rank-other';
        const catClass = `cat-${product.category.toLowerCase()}`;
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${product.rank}</span></td>
            <td><strong style="color:var(--white);font-size:0.85rem">${product.name}</strong></td>
            <td><span class="cat-tag ${catClass}">${product.category}</span></td>
            <td class="td-mono" style="color:var(--cyan)">${fmtFull(product.sales)}</td>
            <td class="td-mono">${product.units}</td>
            <td class="td-mono">${product.contribution}%</td>
            <td style="min-width:100px">
                <div class="mini-bar-wrap">
                    <div class="mini-bar-track">
                        <div class="mini-bar-fill" style="width:${barW}%;background:${categoryColors[product.category]||'#00d4ff'}"></div>
                    </div>
                </div>
            </td>
        `;
    });

    renderBarChart('productChart', filtered, 'sales', 'name', filtered.map(p => categoryColors[p.category]));
}

function setupCategoryFilter() {
    const tabs = document.querySelectorAll('#catFilter .ftab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadProducts(tab.dataset.cat);
        });
    });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    startClock();
    setupSidebar();
    updateKPIs();
    renderBarChart('barChart', salesData, 'amount', 'month', barColors);
    renderDonut();
    setupFilter();
    setupProjector();
    loadMonthlyReport();
    loadProducts();
    setupCategoryFilter();
});
