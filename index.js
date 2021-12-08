const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");
const countsObj = {};

function csvToArray(str, delimiter = ",") {
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
    if (countsObj.hasOwnProperty(query.query)) {
      countsObj[query.query].counts++;
    } else {
      countsObj[query.query] = {
        counts: 1,
        hits: query.hits,
      };
    }
  }
  return countsObj;
}

uploadForm.addEventListener("submit", function (event) {
  // prevents the default behavior of the page refreshing
  event.preventDefault();

  console.log("File uploaded");

  const input = csvFile.files[0];

  // create a new instance of FileReader class
  const reader = new FileReader();

  // Once the reading is done
  reader.onload = function (event) {
    const text = event.target.result;
    const data = csvToArray(text);
    //document.write(JSON.stringify(data));
    // console.log(Object.keys(data));
    const resultsObj = getWordCount(data);
    console.log(resultsObj);
  };

  reader.readAsText(input);
});
