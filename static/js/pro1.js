function calculateAverages(row) {
    let cells = row.cells;
    for (let j = 2; j < cells.length; j += 3) {
        let m1 = parseFloat(cells[j].children[0]?.value) || 0;
        let m2 = parseFloat(cells[j + 1].children[0]?.value) || 0;
        let avgCell = cells[j + 2];

        let avg = (m1 + m2) / 2;
        avgCell.innerText = avg.toFixed(2);
    }
}

function validateMarks(input) {
    let value = parseFloat(input.value);

    if (value > 40) {
        input.value = "";
        alert("Marks cannot be greater than 40!");
        return;
    }

    if (value < 14) {
        input.classList.add("invalid");
    } else {
        input.classList.remove("invalid");
    }
}

function addStudentRow() {
    let table = document.getElementById("marksTable");
    let newRow = table.insertRow(-1);
    let cols = "<td><input type='text' placeholder='S.no' required></td>";
    let subjectCount = (table.rows[0].cells.length - 1) / 3;

    for (let i = 0; i < subjectCount; i++) {
        cols += "<td><input type='number' min='0' oninput='validateMarks(this); calculateAverages(this.parentNode.parentNode)'></td>";
        cols += "<td><input type='number' min='0' oninput='validateMarks(this); calculateAverages(this.parentNode.parentNode)'></td>";
        cols += "<td>-</td>";
    }
    newRow.innerHTML = cols;
}

function addSubjectColumn() {
    let table = document.getElementById("marksTable");
    let headerRow = table.rows[0];
    let subjectNum = (headerRow.cells.length - 1) / 3 + 1;
    headerRow.innerHTML += `<th>Sub${subjectNum} M1</th><th>Sub${subjectNum} M2</th><th>Avg</th>`;

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        row.innerHTML += "<td><input type='number' min='0' oninput='validateMarks(this); calculateAverages(this.parentNode.parentNode)'></td>";
        row.innerHTML += "<td><input type='number' min='0' oninput='validateMarks(this); calculateAverages(this.parentNode.parentNode)'></td>";
        row.innerHTML += "<td>-</td>";
    }
}

function submitData() {
    let table = document.getElementById("marksTable");
    let rowCount = table.rows.length;
    if (rowCount <= 1) {
        alert("No student data to submit!");
        return;
    }

    let studentData = [];
    let subjectRangeCounts = {};
    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    // Initialize range counts for each subject
    subjects.forEach((subject) => {
        subjectRangeCounts[subject] = { 
            "35-40": 0, 
            "25-34": 0, 
            "14-24": 0,
            "0-13": 0
        };
    });

    for (let i = 1; i < rowCount; i++) {
        let row = table.rows[i];
        let rollNo = row.cells[1].children[0].value.trim();
        if (!rollNo) {
            row.cells[1].children[0].classList.add("invalid");
            continue;
        } else {
            row.cells[1].children[0].classList.remove("invalid");
        }

        let rowData = { RollNo: rollNo };

        for (let j = 2, subIndex = 0; j < row.cells.length; j += 3, subIndex++) {
            let avg = parseFloat(row.cells[j + 2].innerText) || 0;
            rowData[`${subjects[subIndex]} M1`] = row.cells[j].children[0]?.value || "0";
            rowData[`${subjects[subIndex]} M2`] = row.cells[j + 1].children[0]?.value || "0";
            rowData[`${subjects[subIndex]} Avg`] = avg.toFixed(2);

            // Count students in each range
            if (avg >= 35 && avg <= 40) {
                subjectRangeCounts[subjects[subIndex]]["35-40"]++;
            } else if (avg >= 25 && avg <= 34) {
                subjectRangeCounts[subjects[subIndex]]["25-34"]++;
            } else if (avg >= 14 && avg <= 24) {
                subjectRangeCounts[subjects[subIndex]]["14-24"]++;
            } else {
                subjectRangeCounts[subjects[subIndex]]["0-13"]++;
            }
        }
        studentData.push(rowData);
    }

    // Generate the result table
    let resultTable = document.getElementById("resultTable");
    resultTable.innerHTML = '';
    
    // Create header row
    let headerRow = resultTable.insertRow();
    headerRow.innerHTML = '<th>Range</th>';
    subjects.forEach(subject => {
        headerRow.innerHTML += `<th>${subject}</th>`;
    });

    // Add data rows for each range
    const ranges = [
        { name: "35-40", label: "35-40 (Excellent)" },
        { name: "25-34", label: "25-34 (Good)" },
        { name: "14-24", label: "14-24 (Average)" },
        { name: "0-13", label: "0-13 (Fail)" }
    ];

    ranges.forEach(range => {
        let row = resultTable.insertRow();
        row.innerHTML = `<td>${range.label}</td>`;
        subjects.forEach(subject => {
            row.innerHTML += `<td>${subjectRangeCounts[subject][range.name]}</td>`;
        });
    });

    // Show the result container
    document.getElementById("resultContainer").style.display = "block";
    
    // Scroll to the result
    document.getElementById("resultContainer").scrollIntoView({ behavior: 'smooth' });
}