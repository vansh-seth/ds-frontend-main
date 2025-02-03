import React, { useState } from "react";
import { Steps, Button, Row, Col, Select, ConfigProvider, theme } from 'antd';
import Navbar from "./Navbar";
import RefiningPanel from "./RefiningPanel";
import NetworkBackground from './NetworkBackground';

const { Step } = Steps;
const { Option } = Select;

const Upload = () => {
  const [current, setCurrent] = useState(0);
  const [selectedFile, setSelectedFile] = useState("");
  const [cleanedFileAvailable, setCleanedFileAvailable] = useState(false);
  const [algo, setAlgo] = useState("simple");
  const [response, setResponse] = useState("");
  const [stratifiedCol, setStratifiedCol] = useState("");
  const [cols, setCols] = useState([]);
  const [mergeColumns, setMergeColumns] = useState("");
  const [filler, setFiller] = useState(",");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [mergeRequest, setMergeRequest] = useState(false);
  const [numColumnsToMerge, setNumColumnsToMerge] = useState(0);
  const [showRefining, setShowRefining] = useState(false);
  const [selectedRefiningColumns, setSelectedRefiningColumns] = useState([]);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setCleanedFileAvailable(false);
    setShowRefining(false);
    setSelectedRefiningColumns([]);
  };

  const handleCleanData = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", selectedFile);

    fetch("http://127.0.0.1:8000/cleandata/", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cleaned_file) {
          alert(data.message);
          setCleanedFileAvailable(true);
          setCols(data.columns || []);
        } else {
          alert("Error during cleaning: " + (data.error || "Unknown error"));
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("An error occurred while cleaning the data.");
      });
  };

  const handleColumnSelect = (e, index) => {
    const selected = [...selectedColumns];
    selected[index] = e.target.value;
    setSelectedColumns(selected);
  };

  const handleRadio = (e) => {
    setAlgo(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cleanedFileAvailable || !response) {
      alert("Please complete all fields and clean data first.");
      return;
    }

    const formData = new FormData();
    formData.append("response", response);
    formData.append("algo", algo);
    formData.append("stratify_col", stratifiedCol);
    formData.append("csv_file", selectedFile);

    const url = algo === "simple"
      ? "http://127.0.0.1:8000/randomsample/"
      : "http://127.0.0.1:8000/sklearnsample/";

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        next();
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("An error occurred during sampling.");
      });
  };

  const handleMergeColumns = () => {
    if (numColumnsToMerge > cols.length) {
      alert(`You cannot merge more than ${cols.length} columns.`);
      return;
    }
    setMergeRequest(true);
  };

  const handleNumColumnsToMerge = (e) => {
    setNumColumnsToMerge(parseInt(e.target.value));
    setSelectedColumns(new Array(parseInt(e.target.value)).fill(""));
  };

  const handleMergeRequestChange = (e) => {
    setMergeRequest(e.target.value === "yes");
  };

  const handleFillerChange = (e) => {
    setFiller(e.target.value);
  };

  const handleRefiningColumnsChange = (columns) => {
    setSelectedRefiningColumns(columns);
  };

  const handleDataRefine = () => {
    const formData = new FormData();
    formData.append("csv_file", selectedFile);
    
    fetch("http://127.0.0.1:8000/getcolumns/", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.columns) {
          setCols(data.columns);
          // next();
        }
      })
      .catch((err) => {
        console.error("Error refreshing columns:", err);
      });
  };

  const handleRefiningDone = () => {  // New function to be passed to RefiningPanel
    next(); // Now you can safely call next() to advance the stepper.
    setShowRefining(false);
    setSelectedRefiningColumns([]);
}
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const renderDataUploadStep = () => (
    <div className="w-full">
      <h1 className="text-5xl text-teal-400 font-bold mb-4 text-center">
        Data Upload
      </h1>
      <form onSubmit={handleCleanData} className="flex flex-col gap-2">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="rounded-md p-2 border border-gray-300"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-teal-400 text-white py-2 px-4 rounded-md hover:bg-teal-500"
          >
            Upload and Clean Data
          </button>
        </div>
      </form>
    </div>
  );

  const renderDataCleansingStep = () => (
    <div className="w-full">
      <h2 className="text-2xl text-teal-400 font-bold mb-4">Data Refining</h2>
      {cleanedFileAvailable ? (
        <>
          <div className="mb-4">
            <label className="block mb-2">Select columns to refine:</label>
            <select
              multiple
              value={selectedRefiningColumns}
              onChange={(e) => handleRefiningColumnsChange(
                Array.from(e.target.selectedOptions, option => option.value)
              )}
              className="w-full p-2 text-black rounded-md"
            >
              {cols.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <RefiningPanel
            selectedColumns={selectedRefiningColumns}
            onRefine={handleRefiningDone}
          />
          <div className="mt-4">
            <label>
              Do you want to merge columns?{" "}
              <input
                type="radio"
                value="yes"
                checked={mergeRequest === true}
                onChange={handleMergeRequestChange}
                className="mr-2"
              />{" "}
              Yes
              <input
                type="radio"
                value="no"
                checked={mergeRequest === false}
                onChange={handleMergeRequestChange}
                className="ml-4"
              />{" "}
              No
            </label>

            {mergeRequest && (
              <div>
                <div className="mt-4">
                  <label>
                    How many columns would you like to merge? (max {cols.length} columns)
                  </label>
                  <input
                    type="number"
                    value={numColumnsToMerge}
                    onChange={handleNumColumnsToMerge}
                    min="2"
                    max={cols.length}
                    className="rounded-md p-2 border border-gray-300 text-black ml-2"
                  />
                </div>

                {numColumnsToMerge > 0 && numColumnsToMerge <= cols.length && (
                  <div className="mt-4">
                    <label>Select columns to merge:</label>
                    {[...Array(numColumnsToMerge)].map((_, index) => (
                      <select
                        key={index}
                        value={selectedColumns[index]}
                        onChange={(e) => handleColumnSelect(e, index)}
                        className="rounded-md p-2 border border-gray-300 text-black ml-2"
                      >
                        <option value="">Select column</option>
                        {cols.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <label>
                    Enter a filler string to join the columns (default is ","):
                  </label>
                  <input
                    type="text"
                    value={filler}
                    onChange={handleFillerChange}
                    className="rounded-md p-2 border border-gray-300 text-black ml-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleMergeColumns}
                  className="bg-teal-400 text-white py-2 px-4 rounded-md mt-4"
                >
                  Merge Columns
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div>Please upload and clean data first</div>
      )}
    </div>
  );

  const renderSamplingStep = () => (
    <div className="w-full">
      <h2 className="text-2xl text-teal-400 font-bold mb-4">Data Sampling</h2>
      {cleanedFileAvailable ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              value="simple"
              checked={algo === "simple"}
              onChange={handleRadio}
              className="w-4 h-4"
            />
            <label>Simple random sampling</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              value="stratified"
              checked={algo === "stratified"}
              onChange={handleRadio}
              className="w-4 h-4"
            />
            <label>Stratified random sampling</label>
          </div>
          {cols.length > 0 && (
            <>
              <div>
                <label>Dependent Column:</label>
                <select
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="text-black ml-2"
                >
                  <option value="">Select column</option>
                  {cols.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              {algo === "stratified" && (
                <div>
                  <label>Stratified Column:</label>
                  <select
                    value={stratifiedCol}
                    onChange={(e) => setStratifiedCol(e.target.value)}
                    className="text-black ml-2"
                  >
                    <option value="">Select column</option>
                    {cols
                      .filter((col) => col !== response)
                      .map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            className="bg-teal-400 text-white py-2 px-4 rounded-md hover:bg-teal-500"
          >
            Submit for Sampling
          </button>
        </form>
      ) : (
        <div>Please upload and clean data first</div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (current) {
      case 0:
        return renderDataUploadStep();
      case 1:
        return renderDataCleansingStep();
      case 2:
        return renderSamplingStep();
      case 3:
        return (
          <div className="w-full">
            <h2 className="text-2xl text-teal-400 font-bold mb-4">Data Evaluation</h2>
            {/* Add your evaluation component here */}
          </div>
        );
      case 4:
        return (
          <div className="w-full">
            <h2 className="text-2xl text-teal-400 font-bold mb-4">Deploy</h2>
            {/* Add your deployment component here */}
          </div>
        );
      default:
        return null;
    }
  };
  const customTheme = {
    components: {
      Steps: {
        colorPrimary: '#2dd4bf',
        controlItemBgActive: 'black',
        colorText: '#2dd4bf',
        colorTextDescription: '#2dd4bf',
        colorTextLabel: '#2dd4bf',
        controlHeight: 32,
      },
    },
    token: {
      colorPrimary: '#2dd4bf',
    },
  };

  const customStepStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  
  const getStepTitle = (title, index, current, totalSteps) => (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          position: "relative",
          fontWeight: "bold",
          color: index <= current ? "#2dd4bf" : "#888",
          paddingBottom: "4px",
        }}
      >
        {title}
        {index <= current && (
          <span
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "2px",
              backgroundColor: "#2dd4bf",
            }}
          />
        )}
      </span>
  
      {/* Add arrow only if it's NOT the last step */}
      {index < totalSteps - 1 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </span>
  );
  
  const totalSteps = 4; // Adjust this if you add more steps

  const onStepChange = (newStep) => {
    setCurrent(newStep); // Update the current step when a step is clicked
  };

  return (
    <ConfigProvider theme={customTheme}>
    <div className="text-white">
      <NetworkBackground />
      <Navbar />
      <div className="container mx-auto p-6">
        <Row className="dvc-home-div">
        <Steps current={current} className="w-full mb-8" style={customStepStyle} onChange={onStepChange}>
            <Step title={getStepTitle("Data Upload", 0, current, totalSteps)} />
            <Step title={getStepTitle("Data Cleansing", 1, current, totalSteps)} />
            <Step title={getStepTitle("Data Sample", 2, current, totalSteps)} />
            <Step title={getStepTitle("Data Evaluation", 3, current, totalSteps)} />
          </Steps>
          {renderCurrentStep()}
        </Row>

        <Row className="dvc-home-div mt-4">
          <Col span={24}>
            <div className="steps-action">
              {current > 0 && (
                <Button 
                  type="primary" 
                  className="bg-teal-400 mr-2"
                  onClick={prev}
                >
                  Previous
                </Button>
              )}
              {current < 4 && (
                <Button
                  type="primary"
                  className="bg-teal-400"
                  onClick={next}
                >
                  Next
                </Button>
              )}
              {current === 4 && (
                <Button
                  type="primary"
                  className="bg-teal-400"
                  onClick={() => alert('Process Complete!')}
                >
                  Done
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
    </ConfigProvider>
  );
};

export default Upload;