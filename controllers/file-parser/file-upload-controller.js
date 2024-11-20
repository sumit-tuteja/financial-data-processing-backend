const xlsx = require("xlsx");

exports.handleFileUpload = function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Missing required parameter: file",
      });
    }
    const file = req?.file?.path;
    const fileName = req?.file?.filename;
    const workbook = xlsx?.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rowsData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    let firstColumnValues = [];
    let undefinedCount = 0;

    // get first column values as we need to map it and stop after encountering more than two consecutive empty rows
    for (let row of rowsData) {
      const value = row[0]; // first column value

      if (value === undefined || value === null || value === "") {
        undefinedCount += 1;
      } else {
        undefinedCount = 0;
      }

      if (undefinedCount <= 2) {
        firstColumnValues.push(value);
      } else {
        break;
      }
    }
    const filteredFirstColumnValues = firstColumnValues.filter(
      (value) => value != null
    ); // empty fields removal
    res
      .status(200)
      .send({ firstColumnValues: filteredFirstColumnValues, fileName });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};