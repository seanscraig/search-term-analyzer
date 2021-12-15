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
  const resultsArray = rows.map(function (row) {
    // split values from each row into array
    const values = row.split(delimiter);
    // use headers.reduce to create object
    const element = headers.reduce(function (object, header, index) {
      if (values[index] === '"') {
        console.log(`true: ${values[index]}`);
      }
      // object properties derived from headers (values)
      object[header] = values[index];
      return object;
    }, {});
    // the object passed as an element of the array
    return element;
  });

  return resultsArray;
}

function getWordCount(array) {
  for (const query of array) {
    // if there are no hits then add it to the noHitsObj
    if (query.hits === "0") {
      // if the query is already in the object then add to the counts
      if (noHitsObj.hasOwnProperty(query.query)) {
        noHitsObj[query.query].counts++;
        // else the query is not in the object add it and set the counts to 1
      } else {
        noHitsObj[query.query] = {
          counts: 1,
          hits: query.hits,
          query: query.query
        };
      }
      // else there are hits then add it to the hitsObj
    } else {
      if (hitsObj.hasOwnProperty(query.query)) {
        hitsObj[query.query].counts++;
      } else {
        hitsObj[query.query] = {
          counts: 1,
          hits: query.hits,
          query: query.query
        };
      }
    }
  }
}

function sortData(dataObj) {
  const valuesArrToItr = Object.values(dataObj)

  valuesArrToItr.sort(function(a, b) {
    if (a["counts"] < b["counts"]) {
      return 1;
    } else if (a["counts"] > b["counts"]) {
      return -1;
    } else {
      return 0
    }
  })

  return valuesArrToItr;
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
    let query = document.createTextNode(data[value].query);
    let counts = document.createTextNode(data[value].counts);
    data1.appendChild(query);
    data2.appendChild(counts);
    row.appendChild(data1);
    row.appendChild(data2);
    tHeadEl.appendChild(row);
  }
}

function displayChart(data) {
  // console.log(data);

  const queries = [];
  const counts = [];

  for (const value in data) {
    queries.push(data[value].query);
    counts.push(data[value].counts);
  }

  new Chart(chartEl, {
    type: "bar",
    data: {
      labels: queries,
      datasets: [
        {
          label: "Search Queries",
          data: counts,
          backgroundColor: ["#258834"],
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
    getWordCount(data);
    const noHitsSortedData = sortData(noHitsObj);
    const hitsSortedData = sortData(hitsObj);
    displayTable(noHitsSortedData);
    displayChart(hitsSortedData);
  };

  reader.readAsText(input);
});
