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
  const [solution, setSolution] = useState([]);
  const [request, setRequest] = useState({ process: "", value: [] });

  const handleChangeData = (value, index, key, processId) => {
    const clone = _.cloneDeep(data);
    clone[processId][key][index] = +value;
    setData((prev) => clone);
  };

  const handleRenderResources = () => {
    const total = +resources;
    const newInstances = Array(total).fill(0);
    setInstances((prev) => newInstances);
    setAvailable((prev) => newInstances);
    setRequest((prev) => ({ ...prev, value: newInstances }));
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

  const handleFindSequence = (available) => {
    let work = [...available];
    let finish = new Array(5).fill(false);
    let safeSequence = [];

    for (let i = 0; i < 5; i++) {
      if (finish[i]) continue;
      let processCanRun = true;
      for (let j = 0; j < +resources; j++) {
        if (data[i].need[j] > work[j]) {
          processCanRun = false;
          break;
        }
      }
      if (processCanRun) {
        const tmp = {
          need: data[i].need,
          work: [...work],
          process: `P${i}`,
        };
        safeSequence.push(tmp);
        for (let j = 0; j < +resources; j++) {
          work[j] += +data[i].allocation[j];
          work[j] = Math.min(work[j], +instances[j]);
        }
        finish[i] = true;
        i = -1; // Restart the loop
      }
    }

    // Check if all processes are finished
    if (safeSequence.length === 5) {
      setSolution((prev) => safeSequence);
      return safeSequence;
    } else {
      setSolution((prev) => []);
      alert("Deadlock!");
      return null;
    }
  };

  const requestProcess = () => {
    // Check if the request is within the need
    const processIndex = +request.process.split("P")[1];
    for (let i = 0; i < +resources; i++) {
      if (request.value[i] > data[processIndex].need[i]) {
        alert("Request is not granted since request exceeds need");
        return false;
      }
    }

    // Check if the request is within the available resources
    for (let i = 0; i < +resources; i++) {
      if (request.value[i] > available[i]) {
        alert(
          "Request is not granted since there is not enough available resources"
        );
        return false; // Not enough available resources
      }
    }

    // Simulate granting the request
    const cloneAvailable = _.cloneDeep(available);
    const cloneData = _.cloneDeep(data);
    for (let i = 0; i < +resources; i++) {
      cloneAvailable[i] -= request.value[i];
      cloneData[processIndex].allocation[i] += +request.value[i];
      cloneData[processIndex].need[i] -= +request.value[i];
    }
    setAvailable((prev) => cloneAvailable);
    setData((prev) => cloneData);

    let work = [...cloneAvailable];
    let finish = new Array(5).fill(false);
    let safeSequence = [];

    for (let i = 0; i < 5; i++) {
      if (finish[i]) continue;
      let processCanRun = true;
      for (let j = 0; j < +resources; j++) {
        if (cloneData[i].need[j] > work[j]) {
          processCanRun = false;
          break;
        }
      }
      if (processCanRun) {
        const tmp = {
          need: cloneData[i].need,
          work: [...work],
          process: `P${i}`,
        };
        safeSequence.push(tmp);
        for (let j = 0; j < +resources; j++) {
          work[j] += +cloneData[i].allocation[j];
          work[j] = Math.min(work[j], +instances[j]);
        }
        finish[i] = true;
        i = -1; // Restart the loop
      }
    }

    // Check if all processes are finished
    if (safeSequence.length === 5) {
      setSolution((prev) => safeSequence);
      return safeSequence;
    } else {
      setSolution((prev) => []);
      alert("Deadlock!");
      return null;
    }
  };

  const handleChangeRequestValue = (value, index) => {
    const clone = _.cloneDeep(request);
    clone.value[index] = +value;
    setRequest((prev) => clone);
  };

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
                onClick={() => handleFindSequence(available)}
              >
                Find sequence
              </Button>{" "}
              <Button
                variant="dark"
                className="button"
                onClick={() => requestProcess()}
              >
                Request resource
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
      {instances.length > 0 && (
        <div className="available-request">
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
          <div className="request">
            <Table striped bordered hover className="table">
              <thead>
                <tr>
                  <th colSpan={+resources + 1} style={{ textAlign: "center" }}>
                    Request resource
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Process Id</td>
                  {data[0].allocation.map((value, index) => {
                    return (
                      <td style={{ textAlign: "center" }}>
                        {String.fromCharCode(index + "A".charCodeAt(0))}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="input">
                    <input
                      type="text"
                      value={request.process}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          process: e.target.value,
                        }))
                      }
                    />
                  </td>
                  {request.value.map((value, index) => {
                    return (
                      <td className="input">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleChangeRequestValue(e.target.value, index)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      )}
      {solution.length > 0 && (
        <div>
          <p>{`Safe sequence: ${solution[0].process}, ${solution[1].process}, ${solution[2].process}, ${solution[3].process}, ${solution[4].process},`}</p>
          <p>{`Step 1: Since need[${
            solution[0].process?.split("P")[1]
          }] = (${JSON.stringify(solution[0].need)}) <= work = ${JSON.stringify(
            solution[0].work
          )}`}</p>
          <p>{`Step 2: Since need[${
            solution[1].process?.split("P")[1]
          }] = (${JSON.stringify(solution[1].need)}) <= work = ${JSON.stringify(
            solution[1].work
          )}`}</p>
          <p>{`Step 3: Since need[${
            solution[2].process?.split("P")[1]
          }] = (${JSON.stringify(solution[2].need)}) <= work = ${JSON.stringify(
            solution[2].work
          )}`}</p>
          <p>{`Step 4: Since need[${
            solution[3].process?.split("P")[1]
          }] = (${JSON.stringify(solution[3].need)}) <= work = ${JSON.stringify(
            solution[3].work
          )}`}</p>
          <p>{`Step 5: Since need[${
            solution[4].process?.split("P")[1]
          }] = (${JSON.stringify(solution[4].need)}) <= work = ${JSON.stringify(
            solution[4].work
          )}`}</p>
        </div>
      )}
    </div>
  );
}

export default App;
