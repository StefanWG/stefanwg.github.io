var content = document.getElementById('content');
var table = [];
//Placeholder values until we load the actual data
var width = 300;
var height = 300;

// Get references to the sliders and labels
const goldSlider = document.getElementById('gold-slider');
const silverSlider = document.getElementById('silver-slider');
const resetBtn = document.getElementById('reset-btn');
const goldLabel = document.getElementById('gold-val');
const silverLabel = document.getElementById('silver-val');


var ssMain = Array.from(document.styleSheets).findIndex(sheet => 
    sheet.href && sheet.href.includes('content.css')
);

if (ssMain === -1) ssMain = 0;
var cssRules = (document.all) ? 'rules' : 'cssRules';


// Cache-buster: Unique version string for every page load
const version = new Date().getTime();

function range(start, end, step) {
    const arr = [];
    for (let i = start; i < end; i += step) {
        arr.push(i);
    }
    return arr;
}

function compute_idx_in_px_x(x, rect) {
    var xIdx = Math.floor((x / rect.width) * heatMapVals.length);    
    xIdx = Math.max(0, Math.min(xIdx, heatMapVals.length - 1));
    return xIdx
}

function compute_idx_in_px_y(y, rect) {
    var yIdx = heatMapVals.length - Math.floor((y / rect.height) * heatMapVals.length);
    yIdx = Math.max(0, Math.min(yIdx, heatMapVals.length - 1));
    return yIdx;
}

function compute_val_from_idx_x(idx, rect) {
    return (idx / heatMapVals.length) * rect.width;
}

function compute_val_from_idx_y(yIdx, rect) {
    // 1. Normalize the index (0 to 1)
    var normalizedIdx = yIdx / (heatMapVals.length - 1);
    
    // 2. Invert it because your yIdx math is inverted 
    // (HeatMapVals.length at y=0, 0 at y=rect.height)
    var yPx = (1 - normalizedIdx) * rect.height;
    
    return yPx;
}

function changeCSSStyle(selector, cssProp, cssVal) {
    try {
        var sheet = document.styleSheets[ssMain];
        var rules = sheet[cssRules];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].selectorText === selector) {
                rules[i].style[cssProp] = cssVal;
                return;
            }
        }
        sheet.insertRule(selector + ' { ' + cssProp + ': ' + cssVal + '; }', rules.length);
    } catch (e) {
        console.warn("Stylesheet access restricted: ", e);
    }
}

const range1 = range(1, 1.5, 0.01);
const range2 = range(1.5, 10, 0.1);
const array3 = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100];
const heatMapVals = range1.concat(range2, array3);

const roundToHundredth = (value) => {
    return Number(value.toFixed(2));
};

function getArrayIndex(val) {
    return heatMapVals.indexOf(val);
}

// Function to update the table AND the sliders visually
function syncUI(silver, gold, countryID) {
    // 1. Update the table values
    updateTable(silver, gold, countryID);

    // 2. Sync Sliders: Find where these values exist in your heatMapVals array
    goldSlider.value = getArrayIndex(gold);
    silverSlider.value = getArrayIndex(silver);
    
    // 3. Update Labels
    goldLabel.textContent = gold.toFixed(2);
    silverLabel.textContent = silver.toFixed(2);
}

function writeTable(t) {
    var medalsTable = document.getElementById('medals');
    medalsTable.innerHTML = '';
    var header = medalsTable.createTHead();
    var headerRow = header.insertRow(0);
    ['Country', 'Gold', 'Silver', 'Bronze', 'Total', 'Points'].forEach(text => {
        var headerCell = document.createElement('th');
        headerCell.textContent = text;
        headerRow.appendChild(headerCell);
    });

    var body = medalsTable.createTBody();
    t.forEach(function(d) {
        var row = body.insertRow(-1);
        d.forEach(function(e) {
            var cell = row.insertCell(-1);
            cell.className = "cell-" + d[0].replace(/\s+/g, "_");
            if (isNaN(parseInt(e)) || typeof e === 'string') {
                cell.textContent = e;
            } else {
                cell.textContent = roundToHundredth(e);
            }
        });
    });
}

function updateTable(silver, gold, countryID) {
    table.forEach(function(d) {
        d[5] = d[1] * gold * silver + d[2] * silver + d[3];
    });

    table.sort((a, b) => (b[5] - a[5]) || (b[1] - a[1]) || (b[2] - a[2]));

    var body = document.getElementById('medals').tBodies[0];
    if (!body) return;

    for (var i = 0; i < table.length; i++) {
        var row = body.rows[i];
        var d = table[i];
        for (var j = 0; j < d.length; j++) {
            var cell = row.cells[j];
            cell.className = "cell-" + d[0].replace(/\s+/g, "_");
            cell.textContent = isNaN(parseInt(d[j])) ? d[j] : roundToHundredth(d[j]);
        }
    }

    document.getElementById('gold').innerHTML = "Gold: " + roundToHundredth(gold * silver);
    document.getElementById('silver').innerHTML = "Silver: " + roundToHundredth(silver);
    if (countryID) {
        var countryClass = "cell-" + countryID;
        var elem = document.getElementsByClassName(countryClass)[0];
        if (elem) elem.scrollIntoView({behavior: "auto", block: "center"});
    }
}


function handleSliderChange() {

    const gold = heatMapVals[parseInt(goldSlider.value)];
    const silver = heatMapVals[parseInt(silverSlider.value)];
    
    updateTable(silver, gold, null);
    
    goldLabel.textContent = gold.toFixed(2);
    silverLabel.textContent = silver.toFixed(2);

    // Update the heatmap circles based on the slider values
    changeCSSStyle(".circle", "display", "block");

    //4. Update the heatmap circles based on the new slider values
    changeCSSStyle(".circle", "display", "block");
    var x = compute_val_from_idx_x(parseInt(silverSlider.value), {width: width}); // Assuming heatmap width is 300px
    var y = compute_val_from_idx_y(parseInt(goldSlider.value), {height: height}); // Assuming heatmap height is 300px

    changeCSSStyle(".circle", "transform", `translate(${x}px, ${y}px)`);
}

goldSlider.addEventListener('input', handleSliderChange);
silverSlider.addEventListener('input', handleSliderChange);

resetBtn.onclick = () => {
    goldSlider.value = 0;
    silverSlider.value = 0;
    handleSliderChange();
};

// Load data and build heatmaps after page load
window.onload = function() {
    // Load Medals with Cache Buster
    d3.csv("medals.csv?v=" + version, function(data) {
        data.forEach(function(d) {
            if (parseInt(d["Total"]) > 0) {
                table.push([d['country'], parseInt(d['Gold']), parseInt(d['Silver']), parseInt(d['Bronze']), parseInt(d['Total']), parseInt(d["Total"])]);
            }
        });
        table.sort((a, b) => (b[4] - a[4]) || (b[1] - a[1]) || (b[2] - a[2]));
        writeTable(table);      
        
        // Load Countries and build heatmaps
        d3.text("data/countries.csv?v=" + version, function(text) {
            table.forEach(function(d) {
                const countryID = d[0].replace(/\s+/g, "_");
                
                var div = document.createElement('div');
                div.id = 'heatmap_' + countryID;
                div.className = 'heatmap';
                
                var title = document.createElement('h3');
                title.textContent = d[0];
                div.appendChild(title);

                var circle = document.createElement('div');
                circle.className = 'circle';
                div.appendChild(circle);

                var img = document.createElement('img');
                img.className = "heatmapImg";
                
                // Add a loading class to the div
                div.classList.add('loading-img');

                // SAFETY: Wait for image to actually load before enabling interactions
                img.onload = function() {
                    div.classList.remove('loading-img');
                    
                    img.addEventListener('mousemove', function(e) {
                        var rect = img.getBoundingClientRect();
                        width = rect.width;
                        height = rect.height;
                        if (rect.width === 0) return;

                        var x = e.clientX - rect.left;
                        var y = e.clientY - rect.top;

                        changeCSSStyle(".circle", "transform", `translate(${x}px, ${y}px)`);
                        var xIdx = compute_idx_in_px_x(x, rect);
                        var yIdx = compute_idx_in_px_y(y, rect);

                        syncUI(heatMapVals[xIdx], heatMapVals[yIdx], countryID);
                    });
                };

                img.src = 'plots/' + d[0] + '.png?v=' + version;
                div.appendChild(img);
                content.appendChild(div);

                img.addEventListener('mouseenter', function() {
                    changeCSSStyle(".circle", "display", "block");
                    changeCSSStyle(".cell-" + countryID, "background-color", "rgba(255,255,255,0.1)");
                });

                img.addEventListener('mouseleave', function() {
                    changeCSSStyle(".circle", "display", "none");
                    changeCSSStyle(".cell-" + countryID, "background-color", "transparent");
                });
            });
        });
    });  
};