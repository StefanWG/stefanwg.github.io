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
    var medalsTable = document.getElementById('medals');
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

    t.forEach(function(d) {
        var row = medalsTable.insertRow(-1);
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

    writeTable(table);

    var goldDiv = document.getElementById('gold');
    goldDiv.innerHTML = "Gold Medals: " + roundToHundredth(gold*silver).toString();
    var silverDiv = document.getElementById('silver');
    silverDiv.innerHTML = "Silver Medals: " + roundToHundredth(silver).toString();
}

var ssMain = 1;
var cssRules = (document.all) ? 'rules': 'cssRules';

function changeCSSStyle(selector, cssProp, cssVal) {

  for (i=0, len=document.styleSheets[ssMain][cssRules].length; i<len; i++) {

    if (document.styleSheets[ssMain][cssRules][i].selectorText === selector) {
      document.styleSheets[ssMain][cssRules][i].style[cssProp] = cssVal;
      return;
    }
  }
  var sheet = document.styleSheets[ssMain];
  sheet.insertRule(selector + ' { ' + cssProp + ': ' + cssVal + '; }', sheet.cssRules.length);
}


d3.csv("medals.csv", function(data) {
    console.log(data)

    data.forEach(function(d) {
        if (d["Total"] > 0) {
            //Convert to integers
            d['Gold'] = parseInt(d['Gold']);
            d['Silver'] = parseInt(d['Silver']);
            d['Bronze'] = parseInt(d['Bronze']);
            d['Total'] = parseInt(d['Total']);
            d["points"] = parseInt(d["Total"]);
            table.push([d['country'], d['Gold'], d['Silver'], d['Bronze'], d['Total']],);
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
    console.log(table)
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
        img.src = 'plots/' + d[0] + '.png';

        var title = document.createElement('h3');
        title.textContent = d[0];
        div.appendChild(title)
        div.appendChild(img);

        img.addEventListener('mousemove', function(e) {
            var rect = img.getBoundingClientRect()
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            changeCSSStyle(".circle", "transform", `translate(${x}px, ${y+35}px)`);

            xIdx = Math.floor(x / rect.width * heatMapVals.length);
            yIdx = heatMapVals.length - Math.floor(y / rect.height * heatMapVals.length);
            silver = heatMapVals[xIdx];
            gold = heatMapVals[yIdx];
            updateTable(silver, gold);
        });

        img.addEventListener('mouseenter', function() {
            changeCSSStyle(".circle","display", "block");
            img.style.cursor = "none";
            circle.classList.toggle("on");
            changeCSSStyle(".cell-"+d[0].replace(" ", "_"),"background-color", "lightgray");
        });

        img.addEventListener('mouseleave', function() {
            changeCSSStyle(".circle","display", "none");
            img.style.cursor = "pointer";
            circle.classList.toggle("on");
            changeCSSStyle(".cell-"+d[0].replace(" ", "_"),"background-color", "white");
        });


    });
});


