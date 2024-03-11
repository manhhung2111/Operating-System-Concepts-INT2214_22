import { useEffect, useState } from "react";
import ResultTable from "./ResultTable";
import _ from "lodash";

function GanttChart({ data, type, originalData }) {
  const [metrics, setMetrics] = useState([]);
  const [avgTime, setAvgTime] = useState({});
  const getSchedulerType = () => {
    if (type === "FCFS") {
      return "First Come First Served";
    } else if (type === "SJF") {
      return "Preemptive SJF";
    } else if (type === "NON-SJF") {
      return "Non-preemptive SJF";
    } else if (type === "Non-Priority") {
      return "Non-preemptive Priority";
    }
  };

  const computeFCFSMetrics = () => {
    let totalTurnaroundTime = 0;
    let totalWaitingTime = 0;

    let fcfs = [];
    const clone = _.cloneDeep(data);
    clone?.sort((a, b) => {
      const processA = a.processId.toLowerCase();
      const processB = b.processId.toLowerCase();
      if (processA < processB) return -1;
      if (processA > processB) return 1;
      return 0;
    });

    clone.forEach((process) => {
      const tmp = {};
      tmp.turnaroundTime = process.endTime - process.arrivalTime;
      tmp.waitingTime = tmp.turnaroundTime - process.burstTime;
      tmp.responseTime = tmp.turnaroundTime - process.burstTime;
      tmp.processId = process.processId;
      totalTurnaroundTime += tmp.turnaroundTime;
      totalWaitingTime += tmp.waitingTime;

      fcfs.push(tmp);
    });

    const totalProcesses = data.length;
    const avgTurnaroundTime = totalTurnaroundTime / totalProcesses;
    const avgWaitingTime = totalWaitingTime / totalProcesses;
    const avgResponseTime = avgWaitingTime; // For FCFS, response time is same as waiting time
    setAvgTime((prev) => ({
      avgResponseTime,
      avgTurnaroundTime,
      avgWaitingTime,
    }));
    setMetrics((prev) => fcfs);
  };

  const computeSJFMetrics = () => {
    function findWaitingTime(proc, n, wt) {
      let newProc = proc?.map((process) => ({
        bt: parseInt(process.burstTime),
        art: parseInt(process.arrivalTime),
      }));
      let rt = new Array(n);

      // Copy the burst time into rt[]
      for (let i = 0; i < n; i++) rt[i] = newProc[i].bt;

      let complete = 0,
        t = 0,
        minm = Number.MAX_VALUE;
      let shortest = 0,
        finish_time;
      let check = false;

      // Process until all processes gets
      // completed
      while (complete !== n) {
        // Find process with minimum
        // remaining time among the
        // processes that arrives till the
        // current time`
        for (let j = 0; j < n; j++) {
          if (newProc[j].art <= t && rt[j] < minm && rt[j] > 0) {
            minm = rt[j];
            shortest = j;
            check = true;
          }
        }

        if (check === false) {
          t++;
          continue;
        }

        // Reduce remaining time by one
        rt[shortest]--;

        // Update minimum
        minm = rt[shortest];
        if (minm === 0) minm = Number.MAX_VALUE;

        // If a process gets completely
        // executed
        if (rt[shortest] === 0) {
          // Increment complete
          complete++;
          check = false;

          // Find finish time of current
          // process
          finish_time = t + 1;

          // Calculate waiting time
          wt[shortest] =
            finish_time - newProc[shortest].bt - newProc[shortest].art;

          if (wt[shortest] < 0) wt[shortest] = 0;
        }
        // Increment time
        t++;
      }
    }
    function findTurnAroundTime(proc, n, wt, tat) {
      // calculating turnaround time by adding
      // bt[i] + wt[i]
      let newProc = proc?.map((process) => ({
        bt: parseInt(process.burstTime),
        art: parseInt(process.arrivalTime),
      }));
      for (let i = 0; i < n; i++) tat[i] = newProc[i].bt + wt[i];
    }
    let wt = new Array(originalData.length),
      tat = new Array(originalData.length);
    let total_wt = 0,
      total_tat = 0,
      total_res = 0;
    let response = {};
    for (let i = 0; i < originalData.length; i++) {
      response[originalData[i].processId] = null;
    }

    for (let i = 0; i < data.length; i++) {
      if (response[data[i].processId] == null) {
        response[data[i].processId] =
          data[i].startTime - parseInt(data[i].arrivalTime);
      }
    }

    // Function to find waiting time of all
    // processes
    findWaitingTime(originalData, originalData.length, wt);

    // Function to find turn around time for
    // all processes
    findTurnAroundTime(originalData, originalData.length, wt, tat);

    for (let i = 0; i < originalData.length; i++) {
      total_wt = total_wt + wt[i];
      total_tat = total_tat + tat[i];
      total_res = total_res + response[originalData[i].processId];
    }

    const sjf = originalData.map((process, index) => ({
      processId: process.processId,
      waitingTime: wt[index],
      turnaroundTime: tat[index],
      responseTime: response[process.processId],
    }));

    const totalProcesses = originalData.length;
    const avgTurnaroundTime = total_tat / totalProcesses;
    const avgWaitingTime = total_wt / totalProcesses;
    const avgResponseTime = total_res / totalProcesses; // For FCFS, response time is same as waiting time
    setAvgTime((prev) => ({
      avgResponseTime,
      avgTurnaroundTime,
      avgWaitingTime,
    }));
    setMetrics((prev) => sjf);
  };

  const computeNonSJFMetrics = () => {
    let totalTurnaroundTime = 0;
    let totalWaitingTime = 0;

    let nonsjf = [];
    const clone = _.cloneDeep(data);
    clone?.sort((a, b) => {
      const processA = a.processId.toLowerCase();
      const processB = b.processId.toLowerCase();
      if (processA < processB) return -1;
      if (processA > processB) return 1;
      return 0;
    });

    clone.forEach((process) => {
      const tmp = {};
      tmp.turnaroundTime = process.endTime - process.arrivalTime;
      tmp.waitingTime = tmp.turnaroundTime - process.burstTime;
      tmp.responseTime = tmp.turnaroundTime - process.burstTime;
      tmp.processId = process.processId;
      totalTurnaroundTime += tmp.turnaroundTime;
      totalWaitingTime += tmp.waitingTime;

      nonsjf.push(tmp);
    });

    const totalProcesses = data.length;
    const avgTurnaroundTime = totalTurnaroundTime / totalProcesses;
    const avgWaitingTime = totalWaitingTime / totalProcesses;
    const avgResponseTime = avgWaitingTime; // For FCFS, response time is same as waiting time
    setAvgTime((prev) => ({
      avgResponseTime,
      avgTurnaroundTime,
      avgWaitingTime,
    }));
    setMetrics((prev) => nonsjf);
  };

  const computeNonPriorityMetrics = () => {
    let totalTurnaroundTime = 0;
    let totalWaitingTime = 0;

    let nonpriority = [];
    const clone = _.cloneDeep(data);
    clone?.sort((a, b) => {
      const processA = a.processId.toLowerCase();
      const processB = b.processId.toLowerCase();
      if (processA < processB) return -1;
      if (processA > processB) return 1;
      return 0;
    });

    clone.forEach((process) => {
      const tmp = {};
      tmp.turnaroundTime = process.endTime - process.arrivalTime;
      tmp.waitingTime = tmp.turnaroundTime - process.burstTime;
      tmp.responseTime = tmp.turnaroundTime - process.burstTime;
      tmp.processId = process.processId;
      totalTurnaroundTime += tmp.turnaroundTime;
      totalWaitingTime += tmp.waitingTime;

      nonpriority.push(tmp);
    });

    const totalProcesses = data.length;
    const avgTurnaroundTime = totalTurnaroundTime / totalProcesses;
    const avgWaitingTime = totalWaitingTime / totalProcesses;
    const avgResponseTime = avgWaitingTime; // For Non-priority, response time is same as waiting time
    setAvgTime((prev) => ({
      avgResponseTime,
      avgTurnaroundTime,
      avgWaitingTime,
    }));
    setMetrics((prev) => nonpriority);
  };

  useEffect(() => {
    if (type === "FCFS") {
      computeFCFSMetrics();
    } else if (type === "SJF") {
      computeSJFMetrics();
    } else if (type === "NON-SJF") {
      computeNonSJFMetrics();
    } else if (type === "Non-Priority") {
      computeNonPriorityMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  return (
    <div className="scheduler">
      <h3>{getSchedulerType()}</h3>
      <div className="gantt-chart">
        {data.map((process, index) => {
          return (
            <div className="process">
              <div className="processId">{process.processId}</div>
              <div className="time">
                <p>{process.startTime}</p>
                <p>{process.endTime} {index !== data.length-1 && "|"}</p>
              </div>
            </div>
          );
        })}
      </div>
      <ResultTable data={metrics} avgTime={avgTime} />
    </div>
  );
}

export default GanttChart;
