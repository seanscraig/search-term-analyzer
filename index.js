const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");
const tableEl = document.getElementById("zero-table");
const chartEl = document.getElementById("query-chart");

const noHitsObj = {};
const hitsObj = {};

function csvToArray(str) {
  // the character that will separate each element
  const delimiter = ",";

  // this first array will contain the property keys from the first line of the file
  // slice from start of text to the first \n index
  // use split to create an array from string to delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // this second array will contain the values
  // slice from /n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map over the rows
  const resultsArray = rows.map((line) => {
    // a new array that contains the line separated into groups by the delimiter
    const eachGroup = line.split(delimiter);

    // edge case for if the line includes a "
    if (line.includes('"')) {
      // create a new variable to hold the contents of the search term between the quotes
      const extractQuote = line
        // using the string match method, it targets a string and accepts a regular expression, it returns anything that is selected from the target string as "matching" the expression
        // the expression itself uses the ? character to represent the start of the string and the $ to represent the end of the string
        // the [] characters are used to enclose a series of characters, and the ^ means not. The | within the [] means either pattern is valid
        // so either a character exists after the quotation mark, or before it
        // the * on both sides of the | means "any number of matching characters"
        // the match method returns all found matches as an array, so we target index 0 to indicate the first match
        .match(/(?:"[^"]*"|^[^"]*$)/)[0]
        // at this point we have "\"Some text in quote\"", so we replace all the " characters using the replace string method
        // the replace method accepts a regex targeting a portion of the string, and a second argument of what to replace it with
        // this regex says: find all " characters and replace them with nothing
        .replace(/"/g, "");

      return {
        [headers[0]]: eachGroup[0],
        [headers[1]]: extractQuote,
        [headers[2]]: eachGroup[3],
        [headers[3]]: eachGroup[4],
        [headers[4]]: eachGroup[5],
        [headers[5]]: eachGroup[6],
      };
      // line does not contain a " so create object with key value pairs
    } else {
      // use the array method reduce with a supplied callback function to create the element as an object
      const element = headers.reduce(function (object, header, index) {
        // object properties derived from headers (values)
        object[header] = eachGroup[index];
        return object;
      }, {});
      // return object as element of array
      return element;
    }
  });

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
  // create an array of the values from the object so we can iterate over them
  const valuesArrToItr = Object.values(dataObj);

  // call the sort array method with a specified compare function
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

  // reads the csv file as a string
  reader.readAsText(input);

  // Once the reading operation is successful
  reader.onload = function (event) {
    // set text equal to the result of the reading
    const text = event.target.result;

    // set data equal to the returned array of objects from parsing the csv
    const data = csvToArray(text);

    // count the queries and put them into two different objects depending if they have hits or not
    getWordCount(data);

    // sort the data in both of the hits objects
    const noHitsSortedData = sortData(noHitsObj);
    const hitsSortedData = sortData(hitsObj);

    // displays the table using the no hits sorted data
    displayTable(noHitsSortedData);

    // displays the chart using the hits sorted data
    displayChart(hitsSortedData);
  };
});
