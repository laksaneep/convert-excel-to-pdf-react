import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./components/ui/button";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  // onchange states
  const [excelFile, setExcelFile] = useState<string | ArrayBuffer | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  // submit state
  const [excelData, setExcelData] = useState<string | ArrayBuffer | null>(null);

  // onchange event
  const handleFile = (e) => {
    const fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          if (e.target) setExcelFile(e.target.result);
        };
      } else {
        setTypeError("Please select only excel file types");
        setExcelFile(null);
      }
    } else {
      console.log("Please select your file");
    }
  };

  // submit event
  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(
        worksheet
      ) as unknown as ArrayBuffer;
      setExcelData(data.slice(0, 10));
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, { html: "#data-table", theme: "grid" });
    doc.save("table.pdf");
  };

  return (
    <div className="h-screen flex flex-col gap-4 w-full items-center justify-center">
      <h3>Upload & View Excel Sheets</h3>

      {/* form */}
      <form
        className="form-group flex gap-4 min-w-96"
        onSubmit={handleFileSubmit}
      >
        <input
          type="file"
          className="form-control form-control-container"
          required
          onChange={handleFile}
        />
        <div className="flex gap-2">
          <Button variant="outline" type="submit">
            UPLOAD
          </Button>
          {/* <Button onClick={() => toPDF()}>DOWNLOAD PDF FILE</Button> */}
          <Button onClick={handleDownloadPdf}>DOWNLOAD PDF FILE</Button>
        </div>
        {typeError && (
          <div className="alert alert-danger" role="alert">
            {typeError}
          </div>
        )}
      </form>

      {/* view data */}
      <div
        id="element-to-print"
        className="flex border min-w-96 items-center justify-center min-h-24"
      >
        {excelData ? (
          <div className="relative max-w-screen-lg overflow-x-auto">
            <table
              id="data-table"
              className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
            >
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th className="px-6 py-3" key={key}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {Object.keys(individualExcelData).map((key) => (
                      <td className="px-6 py-4" key={key}>
                        {individualExcelData[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No File is uploaded yet!</div>
        )}
      </div>
    </div>
  );
}

export default App;
