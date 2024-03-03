import Table from "react-bootstrap/Table";

function InputTable({
  data,
  isDeletedRows,
  handleChangeData,
  handleRemoveRows,
  handleAddMoreRow,
}) {
  return (
    <div className="parcel-value-table">
      <Table striped bordered hover className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Process id</th>
            <th>Arrival time</th>
            <th>Burst Time</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, rowIndex) => {
            return (
              <tr key={rowIndex}>
                <td className="select">
                  <label className="checkBox">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleChangeData(
                          e.target.checked,
                          rowIndex,
                          "isSelected"
                        )
                      }
                      checked={row.isSelected}
                    />
                    <div className="transition"></div>
                  </label>
                </td>
                <td className="input">
                  <input
                    type="text"
                    value={row.processId}
                    onChange={(e) =>
                      handleChangeData(e.target.value, rowIndex, "processId")
                    }
                  />
                </td>
                <td className="input">
                  <input
                    type="text"
                    value={row.arrivalTime}
                    onChange={(e) =>
                      handleChangeData(e.target.value, rowIndex, "arrivalTime")
                    }
                  />
                </td>
                <td className="input">
                  <input
                    type="text"
                    value={row.burstTime}
                    onChange={(e) =>
                      handleChangeData(e.target.value, rowIndex, "burstTime")
                    }
                  />
                </td>
                <td className="input">
                  <input
                    type="text"
                    value={row.priority}
                    onChange={(e) =>
                      handleChangeData(e.target.value, rowIndex, "priority")
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="btn-group">
        <button className="add-btn" onClick={() => handleAddMoreRow()}>
          Add more row
        </button>
        {isDeletedRows && (
          <button className="delete-btn" onClick={() => handleRemoveRows()}>
            Remove row(s)
          </button>
        )}
      </div>
    </div>
  );
}

export default InputTable;
