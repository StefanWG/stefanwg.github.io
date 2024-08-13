let lastAction = null;
let hiddenRowsVisible = false;
let allData = [];  // To store all the data for filtering and searching
let checkboxStates = {};  // To store checkbox states

document.addEventListener('DOMContentLoaded', function () {
    loadCSVData('players.csv');
});

function loadCSVData(csvFilePath) {
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            allData = results.data;  // Store data for future filtering and searching
            populateTable(allData, results.meta.fields);
        }
    });
}

function populateTable(data, headers) {
    const table = document.getElementById('myTable');
    const theadRow = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Clear any existing headers and rows
    theadRow.innerHTML = '<th>Checkbox</th>';
    tbody.innerHTML = '';

    // Populate headers
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.onclick = function() {
            sortTable(index + 1); // +1 to account for the Checkbox column
        };
        theadRow.appendChild(th);
    });

    // Populate rows
    data.forEach(row => {
        const tr = document.createElement('tr');

        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('row-check');

        // Use a unique key based on the player's data (e.g., name or another unique attribute)
        const uniqueKey = row['Name'];  // Assuming 'Name' is unique, adjust as needed
        checkbox.checked = checkboxStates[uniqueKey] || false;

        checkbox.addEventListener('change', function() {
            toggleRowVisibility(this, uniqueKey);
        });
        checkboxTd.appendChild(checkbox);
        tr.appendChild(checkboxTd);

        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function toggleRowVisibility(checkbox, uniqueKey) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('hidden');
        lastAction = { checkbox: checkbox, action: 'hide', uniqueKey: uniqueKey };
    } else {
        row.classList.remove('hidden');
        lastAction = { checkbox: checkbox, action: 'show', uniqueKey: uniqueKey };
    }
    checkboxStates[uniqueKey] = checkbox.checked;  // Save the checkbox state
}

function undoLastAction() {
    if (lastAction) {
        const { checkbox, uniqueKey } = lastAction;
        checkbox.checked = !checkbox.checked;
        toggleRowVisibility(checkbox, uniqueKey);
        lastAction = null;
    }
}

function toggleCheckedRows() {
    const checkboxes = document.querySelectorAll('.row-check');
    hiddenRowsVisible = !hiddenRowsVisible;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            if (hiddenRowsVisible) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        }
    });
}

function sortTable(columnIndex) {
    const table = document.getElementById('myTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    let isAscending = table.getAttribute('data-sort-direction') === 'ascending';

    rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[columnIndex].innerText.trim();
        let cellB = rowB.cells[columnIndex].innerText.trim();

        // Attempt to parse as numbers, fallback to string comparison
        const numA = parseFloat(cellA);
        const numB = parseFloat(cellB);

        if (!isNaN(numA) && !isNaN(numB)) {
            cellA = numA;
            cellB = numB;
        }

        if (isAscending) {
            return cellA > cellB ? 1 : -1;
        } else {
            return cellA < cellB ? 1 : -1;
        }
    });

    rows.forEach(row => tbody.appendChild(row));
    table.setAttribute('data-sort-direction', isAscending ? 'descending' : 'ascending');
}

function filterByPosition(position) {
    const filteredData = allData.filter(row => position === '' || row['Position'] === position);
    populateTable(filteredData, Object.keys(allData[0]));
}

function searchTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = allData.filter(row => {
        return Object.values(row).some(val => String(val).toLowerCase().includes(searchInput));
    });
    populateTable(filteredData, Object.keys(allData[0]));
}
