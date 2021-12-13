const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");
const tableEl = document.getElementById("zero-table");
const chartEl = document.getElementById("query-chart");
const noHitsObj = {};
const hitsObj = {};

function csvToArray(str) {
  const delimiter = ",";
  // slice from start of text to the first \n index
  // use split to create an array from string to delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from /n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into array
  // use headers.reduce to create object
  // object properties derived from headers (values)
  // the object passed as an element of the array
  const resultsArray = rows.map(function (row) {
    // console.log(`row: ${row}`);
    const values = row.split(delimiter);
    // console.log(`values: ${values}`);
    const element = headers.reduce(function (object, header, index) {
      // console.log(`header: ${header}`);
      // console.log(`values[index]: ${values[index]}`);
      if (values[index] === '"') {
        console.log("true");
      }
      object[header] = values[index];
      return object;
    }, {});
    return element;
  });
  return resultsArray;
}

function getWordCount(array) {
  for (const query of array) {
    if (query.hits === "0") {
      if (noHitsObj.hasOwnProperty(query.query)) {
        noHitsObj[query.query].counts++;
      } else {
        noHitsObj[query.query] = {
          counts: 1,
          hits: query.hits,
        };
      }
    } else {
      if (hitsObj.hasOwnProperty(query.query)) {
        hitsObj[query.query].counts++;
      } else {
        hitsObj[query.query] = {
          counts: 1,
          hits: query.hits,
        };
      }
    }
  }
}

function displayTable(data) {
  let tHeadEl = tableEl.createTHead();
  let th1 = document.createElement("th");
  let th1Text = document.createTextNode("Query");
  let th2 = document.createElement("th");
  let th2Text = document.createTextNode("Counts");
  let captionEl = document.createElement("caption");
  let captionText = document.createTextNode("Table for Zero Hits");

  captionEl.appendChild(captionText);
  tableEl.appendChild(captionEl);
  th1.appendChild(th1Text);
  th2.appendChild(th2Text);
  tHeadEl.appendChild(th1);
  tHeadEl.appendChild(th2);

  for (const value in data) {
    let row = tableEl.insertRow();
    let data1 = document.createElement("td");
    let data2 = document.createElement("td");
    let query = document.createTextNode(value);
    let counts = document.createTextNode(data[value].counts);
    data1.appendChild(query);
    data2.appendChild(counts);
    row.appendChild(data1);
    row.appendChild(data2);
    tHeadEl.appendChild(row);
  }
}

function displayChart(data) {
  console.log(data);

  const queries = [];
  const counts = [];
  for (const value in data) {
    queries.push(value);
    counts.push(data[value].counts);
  }

  const myChart = new Chart(chartEl, {
    type: "bar",
    data: {
      labels: queries,
      datasets: [
        {
          label: "Search Queries",
          data: counts,
          backgroundColor: [
            "#258834"
            // "rgba(255, 99, 132, 0.2)",
            // "rgba(54, 162, 235, 0.2)",
            // "rgba(255, 206, 86, 0.2)",
            // "rgba(75, 192, 192, 0.2)",
            // "rgba(153, 102, 255, 0.2)"
          ],
        },
      ],
    },
    options: {
      indexAxis: "y",
    },
  });
}

uploadForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const input = csvFile.files[0];

  // create a new instance of FileReader class
  const reader = new FileReader();

  // Once the reading is done
  reader.onload = function (event) {
    const text = event.target.result;
    const data = csvToArray(text);
    console.log(data);
    getWordCount(data);
    displayTable(noHitsObj);
    displayChart(hitsObj);
  };

  reader.readAsText(input);
});
