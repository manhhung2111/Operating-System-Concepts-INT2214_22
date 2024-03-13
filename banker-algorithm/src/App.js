import "./App.scss";
import { useState } from "react";
import _, { cloneDeep } from "lodash";
import InputTable from "./InputTable";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

function App() {
  let initialData = [
    { allocation: [], max: [], need: [] },
    { allocation: [], max: [], need: [] },
    { allocation: [], max: [], need: [] },
    { allocation: [], max: [], need: [] },
    { allocation: [], max: [], need: [] },
  ];

  const [data, setData] = useState(initialData);
  const [resources, setResources] = useState("");
  const [instances, setInstances] = useState([]);
  const [available, setAvailable] = useState([]);

  const handleChangeData = (value, index, key, processId) => {
    const clone = _.cloneDeep(data);
    clone[processId][key][index] = value;
    setData((prev) => clone);
  };

  const handleRenderResources = () => {
    const total = +resources;
    const newInstances = Array(total).fill(0);
    setInstances((prev) => newInstances);
    setAvailable((prev) => newInstances);
    const clone = cloneDeep(data);
    clone.forEach((process) => {
      process.allocation = Array(total).fill(0);
      process.max = Array(total).fill(0);
      process.need = Array(total).fill(0);
    });
    setData((prev) => clone);
  };

  const handleChangeInstances = (index, value) => {
    const clone = _.cloneDeep(instances);
    clone[index] = +value;
    setInstances((prev) => clone);
  };

  const handleCalculate = () => {
    const clone = _.cloneDeep(data);
    clone.forEach((process) => {
      for (let i = 0; i < process.allocation.length; i++) {
        process.need[i] = +process.max[i] - +process.allocation[i];
      }
    });

    const availableClone = _.cloneDeep(available);
    for (let i = 0; i < instances.length; i++) {
      let totalAllocation = 0;
      clone.forEach((process) => {
        totalAllocation += +process.allocation[i];
      });

      availableClone[i] = +instances[i] - totalAllocation;
    }
    setData((prev) => clone);
    setAvailable((prev) => availableClone);
  };

  const handleReset = () => {};
  return (
    <div className="App">
      <h2 className="header">Banker's Algorithm Simulator</h2>
      <div className="instances">
        <div className="input-group">
          <label class="label">No.of resources</label>
          <input
            autocomplete="off"
            value={resources}
            onChange={(e) => setResources((prev) => e.target.value)}
            class="input"
            type="text"
          ></input>
          <Button variant="success" onClick={() => handleRenderResources()}>
            Fill
          </Button>{" "}
        </div>
        <div className="content">
          <div className="resources">
            {instances.length > 0 &&
              instances.map((instance, index) => {
                return (
                  <div className="input-group">
                    <label class="label">
                      No. of instances of{" "}
                      {String.fromCharCode(index + "A".charCodeAt(0))}
                    </label>
                    <input
                      autocomplete="off"
                      value={instance}
                      onChange={(e) =>
                        handleChangeInstances(index, e.target.value)
                      }
                      class="input"
                      type="text"
                    ></input>
                  </div>
                );
              })}
          </div>
          {instances.length > 0 && (
            <div className="right-content">
              <Button
                variant="success"
                className="button"
                onClick={() => handleCalculate()}
              >
                Calculate
              </Button>{" "}
              <Button
                variant="warning"
                className="button"
                onClick={() => handleReset()}
              >
                Reset
              </Button>{" "}
            </div>
          )}
        </div>
      </div>
      {instances.length > 0 && (
        <div className="user-input">
          <InputTable
            data={data}
            handleChangeData={handleChangeData}
            resources={resources}
          />
        </div>
      )}
      <div className="available">
        <Table striped bordered hover className="table">
          <thead>
            <tr>
              <th colSpan={+resources} style={{ textAlign: "center" }}>
                Available
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {data[0].allocation.map((value, index) => {
                return (
                  <td style={{ textAlign: "center" }}>
                    {String.fromCharCode(index + "A".charCodeAt(0))}
                  </td>
                );
              })}
            </tr>
            <tr>
              {available.map((value) => {
                return <td>{value}</td>;
              })}
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default App;
