var content = document.getElementById('content');
var table = [];

function range(start, end, step) {
    const arr = [];
    for (let i = start; i < end; i += step) {
        arr.push(i);
    }
    return arr;
}

const range1 = range(1, 1.5, 0.01);
const range2 = range(1.5, 10, 0.1);
const array3 = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100];

const heatMapVals = range1.concat(range2, array3);

const roundToHundredth = (value) => {
    return Number(value.toFixed(2));
  };

function writeTable(t) {
    var medalsTable = document.getElementById('medals');
    medalsTable.innerHTML = '';
    // Add header row
    var header = medalsTable.createTHead();
    var headerRow = header.insertRow(0);
    var headerCell = document.createElement('th');
    headerCell.textContent = 'Country';
    headerRow.appendChild(headerCell);
    headerCell = document.createElement('th');
    headerCell.textContent = 'Gold';
    headerRow.appendChild(headerCell);
    headerCell = document.createElement('th');
    headerCell.textContent = 'Silver';
    headerRow.appendChild(headerCell);
    headerCell = document.createElement('th');
    headerCell.textContent = 'Bronze';
    headerRow.appendChild(headerCell);
    headerCell = document.createElement('th');
    headerCell.textContent = 'Total';
    headerRow.appendChild(headerCell);
    headerCell = document.createElement('th');
    headerCell.textContent = 'Points';
    headerRow.appendChild(headerCell);


    var body = medalsTable.createTBody();
    t.forEach(function(d) {
        var row = body.insertRow(-1);
        d.forEach(function(e) {
            var cell = row.insertCell(-1);
            cell.className = "cell-"+d[0].replace(" ", "_");
            if (isNaN(parseInt(e))) {
                cell.textContent = e;
            } else {
                cell.textContent = roundToHundredth(parseInt(e));
            }
        });
    });
}

function updateTable(silver, gold) {
    table.forEach(function(d) {
        d[5] = d[1] * gold*silver + d[2] * silver + d[3];
    });

    table.sort(function(a, b) {
        if (b[5] - a[5] != 0) {
            return b[5] - a[5];
        } else if (b[1] - a[1] != 0) {
            return b[1] - a[1];
        } else {
            return b[2] - a[2];
        }
    });

    var body = document.getElementById('medals').tBodies[0];
    for (var i = 0; i < table.length; i++) {
        var row = body.rows[i];
        var d = table[i];
        for (var j = 0; j < d.length; j++) {
            var cell = row.cells[j];
            cell.className = "cell-"+d[0].replace(" ", "_");
            if (isNaN(parseInt(d[j]))) {
                cell.textContent = d[j];
            } else {
                cell.textContent = roundToHundredth(parseInt(d[j]));
            }
        }
    }

    var goldDiv = document.getElementById('gold');
    goldDiv.innerHTML = "Gold: " + roundToHundredth(gold*silver).toString();
    var silverDiv = document.getElementById('silver');
    silverDiv.innerHTML = "Silver: " + roundToHundredth(silver).toString();
}

// 1. Find the correct local stylesheet index dynamically
var ssMain = Array.from(document.styleSheets).findIndex(sheet => 
    sheet.href && sheet.href.includes('content.css')
);

window.onload = function() {

    // If not found (e.g., style is internal <style> tags), default to 0
    if (ssMain === -1) ssMain = 0;

    var cssRules = (document.all) ? 'rules': 'cssRules';

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
            // If the selector doesn't exist yet, insert it
            sheet.insertRule(selector + ' { ' + cssProp + ': ' + cssVal + '; }', rules.length);
        } catch (e) {
            console.warn("Could not access stylesheet rules: ", e);
        }
    }


    d3.csv("medals.csv", function(data) {
        data.forEach(function(d) {
            if (d["Total"] > 0) {
                //Convert to integers
                d['Gold'] = parseInt(d['Gold']);
                d['Silver'] = parseInt(d['Silver']);
                d['Bronze'] = parseInt(d['Bronze']);
                d['Total'] = parseInt(d['Total']);
                table.push([d['country'], d['Gold'], d['Silver'], d['Bronze'], d['Total'], d["Total"]],);
            }
        })

        // Sort by total number of medals

        table.sort(function(a, b) {
            if (b[4] -a[4] != 0) {
                return b[4]-a[4];
            } else if (b[1] - a[1] != 0) {
                return b[1] - a[1];
            } else {
                return b[2] - a[2];
            }
        });
        writeTable(table);       
    });

    d3.text("data/countries.csv", function(text) {
        table.forEach(function(d) {
            var div = document.createElement('div');
            div.id = 'heatmap_' + d[0].replace(" ", "_");
            div.className = 'heatmap';
            content.appendChild(div);

            var circle = document.createElement('div');
            circle.className = 'circle';
            div.appendChild(circle);


            var img = document.createElement('img');
            img.className = "heatmapImg"
            img.src = 'plots/' + d[0] + '.png?v=' + new Date().getTime();

            var title = document.createElement('h3');
            title.textContent = d[0];
            div.appendChild(title)
            div.appendChild(img);

            // ... existing range and setup code ...

            img.addEventListener('mousemove', function(e) {
                var rect = img.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                // Apply position to ALL circles
                changeCSSStyle(".circle", "transform", `translate(${x}px, ${y}px)`);

                // Your original index math
                var xIdx = Math.floor(x / rect.width * heatMapVals.length);
                var yIdx = heatMapVals.length - Math.floor(y / rect.height * heatMapVals.length);
                
                // Clamp to prevent errors at the very edges
                xIdx = Math.max(0, Math.min(xIdx, heatMapVals.length - 1));
                yIdx = Math.max(0, Math.min(yIdx, heatMapVals.length - 1));

                var silver = heatMapVals[xIdx];
                var gold = heatMapVals[yIdx];
                updateTable(silver, gold);

                // Scroll table to the current country
                var countryClass = "cell-" + d[0].replace(" ", "_");
                var elem = document.getElementsByClassName(countryClass)[0];
                if (elem) elem.scrollIntoView({behavior: "auto", block: "center"});
            });

            img.addEventListener('mouseenter', function() {
                changeCSSStyle(".circle", "display", "block");
                // Use a subtle glassy highlight instead of solid gray
                changeCSSStyle(".cell-" + d[0].replace(" ", "_"), "background-color", "rgba(255,255,255,0.1)");
            });

            img.addEventListener('mouseleave', function() {
                changeCSSStyle(".circle", "display", "none");
                changeCSSStyle(".cell-" + d[0].replace(" ", "_"), "background-color", "transparent");
            });
        });
    });

}