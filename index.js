const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");
const tableEl = document.getElementById("zero-table");
const chartEl = document.getElementById("query-chart");
const noHitsObj = {};
const hitsObj = {};

function csvToArray(str) {
  //
  const delimiter = ",";

  // this first array will contain the property keys from the first line of the file
  // slice from start of text to the first \n index
  // use split to create an array from string to delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  console.log(headers);

  // this second array will contain the values
  // slice from /n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  const resultsArray = rows.map((line) => {

    //
    const eachGroup = line.split(delimiter);
    // console.log(eachGroup);
    //
    if (line.includes('"')) {
      const extractQuote = line
        .match(/(?:"[^"]*"|^[^"]*$)/)[0]
        .replace(/"/g, "");

      return {
        [headers[0]]: eachGroup[0],
        [headers[1]]: extractQuote,
        [headers[2]]: eachGroup[3],
        [headers[3]]: eachGroup[4],
        [headers[4]]: eachGroup[5],
        [headers[5]]: eachGroup[6],
      };
    } else {
      const element = headers.reduce(function (object, header, index) {
        // object properties derived from headers (values)
        object[header] = eachGroup[index];
        console.log(index);
        return object;
      }, {});
      return element;
    }
  });
  console.log(resultsArray);
  return resultsArray;
}

function getWordCount(array) {
  for (const obj of array) {
    // if there are no hits then add it to the noHitsObj
    if (obj.hits === "0") {
      // if the query is already in the object then add to the counts
      if (noHitsObj.hasOwnProperty(obj.query)) {
        noHitsObj[obj.query].counts++;
        // else the query is not in the object add it and set the counts to 1
      } else {
        noHitsObj[obj.query] = {
          counts: 1,
          hits: obj.hits,
          query: obj.query,
        };
      }
      // else there are hits then add it to the hitsObj
    } else {
      if (hitsObj.hasOwnProperty(obj.query)) {
        hitsObj[obj.query].counts++;
      } else {
        hitsObj[obj.query] = {
          counts: 1,
          hits: obj.hits,
          query: obj.query,
        };
      }
    }
  }
}

function sortData(dataObj) {
  const valuesArrToItr = Object.values(dataObj);

  valuesArrToItr.sort(function (a, b) {
    if (a["counts"] < b["counts"]) {
      return 1;
    } else if (a["counts"] > b["counts"]) {
      return -1;
    } else {
      return 0;
    }
  });

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

  // set input equal to the inputted csv file
  const input = csvFile.files[0];

  // create a new instance of FileReader class so the file can be read
  const reader = new FileReader();

  // reads the
  reader.readAsText(input);

  // Once the reading operation is successful
  reader.onload = function (event) {
    // set text equal to the result of the reading
    const text = event.target.result;

    // set data equal to the returned array of objects from parsing the csv
    const data = csvToArray(text);

    // count the queries and put them into two different objects depending if they have hits or not
    getWordCount(data);

    //
    const noHitsSortedData = sortData(noHitsObj);
    const hitsSortedData = sortData(hitsObj);

    //
    displayTable(noHitsSortedData);

    //
    displayChart(hitsSortedData);
  };
});
