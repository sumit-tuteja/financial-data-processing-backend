const xlsx = require("xlsx");
const path = require("path");

// function to find value from array in this case we have sheet data into array
const findObjectByValue = async (arr, value) => {
  return arr.find((obj) => {
    const firstValue = Object.values(obj)[0];
    return firstValue === value;
  });
};

// function to add values if we have more than one field to map with single gaap standard label.
const mergeAndAddValues = async (arr, stanLabelKey) => {
  const summedValues = {};
  arr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key !== "__EMPTY") {
        if (!summedValues[key]) {
          summedValues[key] = 0;
        }
        summedValues[key] += obj[key];
      }
    });
  });
  return [
    {
      __EMPTY: stanLabelKey,
      ...summedValues,
    },
  ];
};

exports.handleDataMap = async function (req, res) {
  try {
    const data = req.body;
    if (!data.fileName || !data.mapList) {
      return res.status(400).json({
        message: "Missing required parameter: fileName or mapList",
      });
    }
    let finalResult = [];
    const fileName = data.fileName;
    const dataEntriesToMap = Object.entries(data.mapList);
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rowsData = xlsx.utils.sheet_to_json(sheet);

    const groupedMappingList = {};

    // create group to map data entries if there are more than one field to map to same label group them together
    for (const [key, value] of dataEntriesToMap) {
      if (!groupedMappingList[value]) {
        groupedMappingList[value] = [];
      }
      groupedMappingList[value].push(key);
    }

    const standardGAAPLabelKeysToMap = Object.keys(groupedMappingList);

    for (const stanLabelKey of standardGAAPLabelKeysToMap) {
      const values = Object.values(groupedMappingList[stanLabelKey]);
      if (values.length > 0) {
        const tempArray = [];
        for (const value of values) {
          const result = await findObjectByValue(rowsData, value);
          tempArray.push(result);
        }
        let result = await mergeAndAddValues(tempArray, stanLabelKey);
        finalResult.push(result[0]);
      }
    }
    res.status(200).send(finalResult);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};