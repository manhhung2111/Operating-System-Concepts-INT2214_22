import Table from "react-bootstrap/Table";

function ResultTable({ data, avgTime }) {
  return (
    <div className="result-table">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Process Id</th>
            <th>Response Time</th>
            <th>Waiting Time</th>
            <th>TAT</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((process, index) => {
            return (
              <tr key={index}>
                <td>{process.processId}</td>
                <td>{process.responseTime}</td>
                <td>{process.waitingTime}</td>
                <td>{process.turnaroundTime}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <h5>Average response time: {avgTime.avgResponseTime}</h5>
      <h5>Average waiting time: {avgTime.avgWaitingTime}</h5>
      <h5>Average turn around time: {avgTime.avgTurnaroundTime}</h5>
    </div>
  );
}

export default ResultTable;
