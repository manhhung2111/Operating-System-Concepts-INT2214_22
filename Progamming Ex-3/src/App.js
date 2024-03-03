import "./App.scss";
import { useState } from "react";
import _ from "lodash";
import InputTable from "./InputTable";
import Button from "react-bootstrap/Button";
import GanttChart from "./GanttChart";

function App() {
  const initialData = {
    isSelected: false,
    processId: "",
    arrivalTime: "",
    burstTime: "",
    priority: "0",
  };

  const [data, setData] = useState([initialData]);
  const [isDeletedRows, setIsDeletedRows] = useState(false);
  const [FCFS, setFCFS] = useState([]);
  const [nonSJF, setNonSJF] = useState([]);
  const [SJF, setSJF] = useState([]);
  const [nonPriority, setNonPriority] = useState([]);

  const handleChangeData = (value, index, key) => {
    const clone = _.cloneDeep(data);
    clone[index][key] = value;
    const isDeleted = clone.some((row) => row.isSelected === true);
    setIsDeletedRows(isDeleted);
    setData((prev) => clone);
  };

  const handleRemoveRows = async () => {
    const clone = _.cloneDeep(data);
    const newArr = _.cloneDeep(clone.filter((row) => row.isSelected === false));

    setData((prev) => newArr);
    setIsDeletedRows(false);
  };

  const handleAddMoreRow = () => {
    const clone = _.cloneDeep(data);
    setData((prev) => [...clone, initialData]);
  };

  const computeFCFS = () => {
    const clone = _.cloneDeep(data);
    if (clone.length > 1) {
      clone.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
    let currentTime = 0;
    let fcfs = [];
    clone.forEach((process) => {
      if (currentTime < +process.arrivalTime) {
        currentTime = +process.arrivalTime;
      }
      const tmp = {
        processId: process.processId,
        arrivalTime: process.arrivalTime,
        burstTime: process.burstTime,
        startTime: currentTime,
        endTime: currentTime + +process.burstTime,
      };
      fcfs.push(tmp);
      currentTime = tmp.endTime;
    });
    setFCFS(fcfs);
  };

  const computeSJF = () => {
    let clone = _.cloneDeep(data);

    let currentTime = 0;
    let sjf = [];
    if (clone.length > 1) {
      clone.sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime; // Sort by arrival time
        } else {
          return a.burstTime - b.burstTime; // If same arrival time, sort by burst time
        }
      });
    }

    // run the first process for 1 time
    let prevProcess = clone[0];

    prevProcess.burstTime = parseInt(prevProcess.burstTime) - 1;
    currentTime++;
    prevProcess.startTime = currentTime - 1;
    while (clone.length > 0) {
      // for(let i = 0; i < 5; i++)
      // select the shortest remaining burst time process
      let nextProcess = null;
      let minBurstTime = +clone[0].burstTime;

      for (let i = 0; i < clone.length; i++) {
        if (+clone[i].arrivalTime <= currentTime) {
          if (+clone[i].burstTime < minBurstTime) {
            minBurstTime = +clone[i].burstTime;
            nextProcess = clone[i];
          } else if (+clone[i].burstTime === minBurstTime) {
            if (
              nextProcess !== null &&
              prevProcess.processId === nextProcess.processId
            )
              continue;
            nextProcess = clone[i];
          }
        }
      }

      // console.log(prevProcess, nextProcess);
      if (nextProcess === null) {
        break;
      }
      if (prevProcess.processId === nextProcess.processId) {
        if (parseInt(prevProcess.burstTime) === 0) {
          const tmp = {
            processId: prevProcess.processId,
            startTime: prevProcess.startTime,
            endTime: currentTime,
            arrivalTime: prevProcess.arrivalTime,
          };
          sjf.push(tmp);
          clone = clone.filter(
            (process) => process.processId !== tmp.processId
          );
        } else {
          nextProcess.burstTime = parseInt(nextProcess.burstTime) - 1;
          currentTime++;
        }
      } else {
        if (prevProcess.burstTime !== 0) {
          const tmp = {
            arrivalTime: prevProcess.arrivalTime,
            processId: prevProcess.processId,
            startTime: prevProcess.startTime,
            endTime: currentTime,
          };
          sjf.push(tmp);
        }

        prevProcess = nextProcess;
        prevProcess.startTime = currentTime;
        prevProcess.burstTime = parseInt(prevProcess.burstTime) - 1;
        currentTime++;
      }
    }
    setSJF((prev) => sjf);
  };

  const computeNonSJF = () => {
    let clone = _.cloneDeep(data);

    if (clone.length > 1) {
      clone.sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime; // Sort by arrival time
        } else {
          return a.burstTime - b.burstTime; // If same arrival time, sort by burst time
        }
      });
    }
    let currentTime = 0;
    let nonsjf = [];
    // run the first arrival process
    if (currentTime < +clone[0].arrivalTime) {
      currentTime = +clone[0].arrivalTime;
    }
    const tmp1 = {
      processId: clone[0].processId,
      arrivalTime: clone[0].arrivalTime,
      burstTime: clone[0].burstTime,
      startTime: currentTime,
      endTime: currentTime + +clone[0].burstTime,
    };
    nonsjf.push(tmp1);
    currentTime = tmp1.endTime;
    clone = clone.filter((process) => process.processId !== tmp1.processId);
    while (clone.length > 0) {
      console.log(clone);

      // select the shortest burst time process after the first process is done
      let nextProcess = null;
      let minBurstTime = +clone[0].burstTime;

      for (let i = 0; i < clone.length; i++) {
        const process = clone[i];
        if (+process.arrivalTime <= currentTime) {
          if (+process.burstTime <= minBurstTime) {
            minBurstTime = +process.burstTime;
            nextProcess = process;
          }
        }
      }

      //remove that process from queue and calculate time
      if (nextProcess !== null) {
        clone = clone.filter(
          (process) => process.processId !== nextProcess.processId
        );
        const tmp = {
          processId: nextProcess.processId,
          arrivalTime: nextProcess.arrivalTime,
          burstTime: nextProcess.burstTime,
          startTime: currentTime,
          endTime: currentTime + +nextProcess.burstTime,
        };
        nonsjf.push(tmp);
        currentTime = tmp.endTime;
      }
    }
    setNonSJF((prev) => nonsjf);
  };

  const computeNonPriority = () => {
    let clone = _.cloneDeep(data);
    if (clone.length > 1) {
      clone.sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime; // Sort by arrival time
        } else {
          return a.priority - b.priority; // If same arrival time, sort by priority. Lower priority, higher order
        }
      });
    }
    let currentTime = 0;
    let nonPriority = [];
    // run the first arrival process
    if (currentTime < +clone[0].arrivalTime) {
      currentTime = +clone[0].arrivalTime;
    }
    const tmp1 = {
      processId: clone[0].processId,
      arrivalTime: clone[0].arrivalTime,
      burstTime: clone[0].burstTime,
      startTime: currentTime,
      endTime: currentTime + +clone[0].burstTime,
    };
    nonPriority.push(tmp1);
    currentTime = tmp1.endTime;
    clone.shift();
    while (clone.length > 0) {
      // select the shortest burst time process after the first process is done
      let nextProcess = null;
      let minPriority = clone[0].priority;

      for (let i = 0; i < clone.length; i++) {
        const process = clone[i];
        if (process.arrivalTime <= currentTime) {
          if (process.priority <= minPriority) {
            minPriority = process.priority;
            nextProcess = process;
          }
        }
      }

      //remove that process from queue and calculate time
      if (nextProcess !== null) {
        clone = clone.filter(
          (process) => process.processId !== nextProcess.processId
        );
        const tmp = {
          processId: nextProcess.processId,
          arrivalTime: nextProcess.arrivalTime,
          burstTime: nextProcess.burstTime,
          startTime: currentTime,
          endTime: currentTime + +nextProcess.burstTime,
        };
        nonPriority.push(tmp);
        currentTime = tmp.endTime;
      }
    }
    setNonPriority((prev) => nonPriority);
  };

  const handleSubmit = () => {
    computeFCFS();
    computeSJF();
    computeNonSJF();
    computeNonPriority();
  };
  return (
    <div className="App">
      <div className="user-input">
        <InputTable
          data={data}
          handleAddMoreRow={handleAddMoreRow}
          handleChangeData={handleChangeData}
          handleRemoveRows={handleRemoveRows}
          isDeletedRows={isDeletedRows}
        />
      </div>
      <Button variant="success" onClick={() => handleSubmit()}>
        Calculate
      </Button>{" "}
      <div className="scheduler-grid">
        {FCFS.length > 0 && <GanttChart data={FCFS} type={"FCFS"} />}
        {nonSJF.length > 0 && <GanttChart data={nonSJF} type={"NON-SJF"} />}
        {SJF.length > 0 && (
          <GanttChart data={SJF} type={"SJF"} originalData={data} />
        )}
        {nonPriority.length > 0 && (
          <GanttChart data={nonPriority} type={"Non-Priority"} />
        )}
      </div>
    </div>
  );
}

export default App;
