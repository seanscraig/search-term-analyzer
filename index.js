const uploadForm = document.getElementById("upload-form");
const csvFile = document.getElementById("csv-file");

uploadForm.addEventListener("submit", function (event) {
  // prevents the default behavior of the page refreshing
  event.preventDefault();

  console.log("File uploaded");

  const input = csvFile.files[0];

  // create a new instance of FileReader class
  const reader = new FileReader();

  // Once the reading is done
  reader.onload = function (event) {
    document.write(event.target.result); // The CSV content as string
  };

  reader.readAsText(input);
});
