const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");
const tableEl = document.getElementById("table");
const chartEl = document.getElementById("myChart");
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
    const values = row.split(delimiter);
    const element = headers.reduce(function (object, header, index) {
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
    queries.push(value)
    counts.push(data[value].counts);
  }

  // console.log(queries);
  // console.log(counts);

  const myChart = new Chart(chartEl, {
    type: "bar",
    data: {
      labels: queries,
      datasets: [
        {
          label: "Search Queries",
          data: counts,
        },
      ],
    },
    options: {
      indexAxis: "y"
    }
  });
}

uploadForm.addEventListener("submit", function (event) {
  // prevents the default behavior of the page refreshing
  event.preventDefault();

  const input = csvFile.files[0];

  // create a new instance of FileReader class
  const reader = new FileReader();

  // Once the reading is done
  reader.onload = function (event) {
    const text = event.target.result;
    const data = csvToArray(text);
    getWordCount(data);
    displayTable(noHitsObj);
    displayChart(hitsObj);
  };

  reader.readAsText(input);
});
