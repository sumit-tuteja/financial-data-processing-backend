const express = require("express");
const fileUploader = require("../../../controllers/file-parser/file-upload-controller");
const xlsx = require("xlsx");
jest.mock("xlsx");

const app = express();
app.use(express.json());
app.post("/fileparse", fileUploader.handleFileUpload);

describe("POST /fileparse", () => {
  let req, res;

  beforeEach(() => {
    req = {
      file: {
        filename: "test-file.xlsx",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  it("should return 400 if file is missing", async () => {
    const missingFileReq = { file: null };
    await fileUploader.handleFileUpload(missingFileReq, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing required parameter: file",
    });
  });

  it("should return 200 with first column values", async () => {
    const mockSheetData = [
      ["Income statement"],
      ["Non-Recurring Revenues", 532757, 437315, 538135, 482849],
      ["Recurring Revenues", 399905, 237135, 326911, 242703],
      ["Total Revenues", 932662, 674450, 865046, 725552],
      ["Cost of Goods Sold", 545089, 471987, 506753, 453642],
      ["Gross Profit", 387573, 202463, 358293, 271910],
      ["Sales & Marketing Expenses", 222354, 195684, 221709, 277589],
    ];

    const mockWorkbook = {
      SheetNames: ["Sheet1"],
      Sheets: {},
    };
    xlsx.readFile.mockReturnValue(mockWorkbook);
    xlsx.utils.sheet_to_json.mockReturnValue(mockSheetData);

    await fileUploader.handleFileUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      firstColumnValues: [
        "Income statement",
        "Non-Recurring Revenues",
        "Recurring Revenues",
        "Total Revenues",
        "Cost of Goods Sold",
        "Gross Profit",
        "Sales & Marketing Expenses",
      ],
      fileName: "test-file.xlsx",
    });
  });

  it("should handle error if xlsx.readFile fails", async () => {
    const error = new Error("Error reading file");
    xlsx.readFile.mockImplementation(() => {
      throw error;
    });

    await fileUploader.handleFileUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "An error occurred",
      error: error.message,
    });
  });

  it("should skip empty rows after two consecutive empty rows", async () => {
    const mockSheetData = [
      ["Income statement"],
      [],
      ["Non-Recurring Revenues", 532757, 437315, 538135, 482849],
      ["Recurring Revenues", 399905, 237135, 326911, 242703],
      ["Total Revenues", 932662, 674450, 865046, 725552],
      ["Cost of Goods Sold", 545089, 471987, 506753, 453642],
      ["Gross Profit", 387573, 202463, 358293, 271910],
      ["Sales & Marketing Expenses", 222354, 195684, 221709, 277589],
      [],
      [],
      [],
    ];

    const mockWorkbook = {
      SheetNames: ["Sheet1"],
      Sheets: {},
    };
    xlsx.readFile.mockReturnValue(mockWorkbook);
    xlsx.utils.sheet_to_json.mockReturnValue(mockSheetData);

    await fileUploader.handleFileUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      firstColumnValues: [
        "Income statement",
        "Non-Recurring Revenues",
        "Recurring Revenues",
        "Total Revenues",
        "Cost of Goods Sold",
        "Gross Profit",
        "Sales & Marketing Expenses",
      ],
      fileName: "test-file.xlsx",
    });
  });
});
