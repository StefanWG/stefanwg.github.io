const canvas = document.getElementById('hostCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('customTooltip');
const tableBody = document.getElementById('tableBody');


// --- 1. DYNAMIC CONFIGURATION ---
const params = new URLSearchParams(window.location.search);
const isWinter = params.get('type') === 'winter';

const config = {
    csvFile: isWinter ? 'tables/winter_host_windows.csv' : 'tables/summer_host_windows.csv',
    title: isWinter ? 'WINTER OLYMPICS' : 'SUMMER OLYMPICS',
    accent: isWinter ? '#00d2ff' : '#ff4d05'
};

// Switch between Winter and Summer based on URL parameter
const seasonToggle = document.getElementById('seasonToggle');
const toggleText = document.getElementById('toggleText');

if (isWinter) {
    // If current is winter, link to summer
    seasonToggle.href = "?type=summer";
    toggleText.innerText = "Switch to Summer";
} else {
    // If current is summer, link to winter
    seasonToggle.href = "?type=winter";
    toggleText.innerText = "Switch to Winter";
}

// Apply UI Theme
if(document.getElementById('pageTitle')) document.getElementById('pageTitle').innerText = config.title;
document.documentElement.style.setProperty('--accent', config.accent);

// --- 2. GLOBALS ---
const labels = ['-2 Games', '-1 Game', 'HOST YEAR', '+1 Game', '+2 Games'];
const padding = 60;
const relMap = { "-8": 0, "-4": 1, "Host Year": 2, "+4": 3, "+8": 4 };
const colorPalette = [config.accent, '#fde725', '#00ff88', '#9b59b6', '#3498db', '#e74c3c'];

let fullGameData = []; 
let gameData = [];     
let averages = [];     
let maxVal = 0;      

const minSlider = document.getElementById('minYear');
const maxSlider = document.getElementById('maxYear');
const yearText = document.getElementById('yearRangeText');

// --- 3. DATA LOADING ---
async function loadAndParseData() {
    try {
        const response = await fetch(config.csvFile);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        const grouped = {};
        
        rows.forEach(row => {
            if (!row.trim()) return;
            const cols = row.split(',');
            const total = parseInt(cols[4]);
            const calYear = cols[5].trim();
            const relYear = cols[8].trim();
            const hostCountry = cols[9].trim();
            const hostYear = cols[10].trim();
            const key = `${hostCountry} ${hostYear}`;

            if (!grouped[key]) {
                grouped[key] = { 
                    label: hostCountry, year: hostYear, 
                    medals: [null, null, null, null, null],
                    years: [null, null, null, null, null] 
                };
            }
            const index = relMap[relYear];
            if (index !== undefined) {
                grouped[key].medals[index] = total;
                grouped[key].years[index] = calYear;
            }
        });

        fullGameData = Object.values(grouped).map((game, i) => ({
            ...game, color: colorPalette[i % colorPalette.length]
        }));
    

        updateFilter();
    } catch (e) { console.error("Data Error:", e); }
}

// --- 4. FILTERING & CONSTRAINTS ---
function updateFilter() {
    if (yearText) yearText.innerText = `${minSlider.value} - ${maxSlider.value}`;

    // Filter data based on slider values
    gameData = fullGameData.filter(game => {
        const y = parseInt(game.year);
        return y >= parseInt(minSlider.value) && y <= parseInt(maxSlider.value);
    });

    // Calculate Average Trend line
    averages = labels.map((_, i) => {
        let sum = 0, count = 0;
        gameData.forEach(g => { if (g.medals[i] !== null) { sum += g.medals[i]; count++; } });
        return count > 0 ? sum / count : null;
    });

    // Dynamic Y-Axis Scaling
    let localMax = 20; 
    gameData.forEach(g => g.medals.forEach(m => { if (m > localMax) localMax = m; }));
    maxVal = Math.ceil((localMax * 1.1) / 10) * 10;

    populateTable();
    render();
}

// --- 5. EVENT LISTENERS (Collision Detection) ---
if (minSlider && maxSlider) {
    // Prevent the Start slider from going past the End slider
    minSlider.addEventListener('input', () => {
        if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
            minSlider.value = maxSlider.value;
        }
        updateFilter();
    });

    // Prevent the End slider from going below the Start slider
    maxSlider.addEventListener('input', () => {
        if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
            maxSlider.value = minSlider.value;
        }
        updateFilter();
    });
}

// --- 5. CHART RENDERING ---
function getPos(i, val) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;
    return {
        x: padding + (i * (chartW / (labels.length - 1))),
        y: canvas.height - padding - (val * (chartH / maxVal))
    };
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameData.length === 0) return;

    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    // Y-Axis Scale and Grid Lines
    ctx.font = '600 11px Outfit';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for(let i=0; i<=5; i++) {
        const val = Math.round(maxVal - (i * (maxVal / 5)));
        const y = padding + (i * (chartH / 5));
        
        // Draw Grid Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.setLineDash([]);
        ctx.beginPath(); 
        ctx.moveTo(padding, y); 
        ctx.lineTo(canvas.width - padding, y); 
        ctx.stroke();

        // Draw Y-Axis Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(val, padding - 15, y);
    }

    // Average Trend Line (Dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    averages.forEach((avg, i) => {
        if (avg === null) return;
        const pos = getPos(i, avg);
        i === 0 ? ctx.moveTo(pos.x, pos.y) : ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Country Data Lines
    gameData.forEach(game => {
        ctx.strokeStyle = game.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        game.medals.forEach((m, i) => {
            if (m === null) return;
            const pos = getPos(i, m);
            if (i === 0 || game.medals[i-1] === null) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();

        // Dots
        game.medals.forEach((m, i) => {
            if (m === null) return;
            const pos = getPos(i, m);
            ctx.fillStyle = game.color;
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#0b0e14'; ctx.lineWidth = 1; ctx.stroke();
        });
    });

    // X-Axis Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 12px Outfit';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
        const pos = getPos(i, 0);
        ctx.fillText(l, pos.x, canvas.height - 25);
    });
    
    // Axis Titles (Optional)
    ctx.font = 'bold 10px Outfit';
    ctx.fillStyle = config.accent;
    ctx.fillText('MEDALS', padding - 15, padding - 30);
}

function populateTable() {
    if(!tableBody) return;
    tableBody.innerHTML = "";
    gameData.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.label} ${game.year}</td>
            <td>${game.medals[1] || '-'}</td>
            <td style="color:${config.accent}; font-weight:bold">${game.medals[2] || '-'}</td>
            <td>${game.medals[3] || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let found = false;
    gameData.forEach(game => {
        game.medals.forEach((m, i) => {
            if (m === null) return;
            const pos = getPos(i, m);
            if (Math.hypot(mx - pos.x, my - pos.y) < 15) {
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX - rect.left + 20) + 'px';
                tooltip.style.top = (e.clientY - rect.top - 20) + 'px';
                tooltip.innerHTML = `<strong>${game.label} (${game.years[i]})</strong><br>${m} Medals`;
                found = true;
            }
        });
    });
    if (!found) tooltip.style.display = 'none';
});

loadAndParseData();
window.addEventListener('resize', render);