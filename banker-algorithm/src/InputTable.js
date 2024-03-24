import Table from "react-bootstrap/Table";

function InputTable({ data, handleChangeData, resources }) {
  return (
    <div className="parcel-value-table">
      <Table striped bordered hover className="table">
        <thead>
          <tr>
            <th rowSpan={2}>Process id</th>
            <th colSpan={+resources}>Allocation</th>
            <th colSpan={+resources}>Max</th>
            <th colSpan={+resources}>Need</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            {data[0].allocation.map((value, index) => {
              return (
                <td style={{ textAlign: "center" }}>
                  {String.fromCharCode(index + "A".charCodeAt(0))}
                </td>
              );
            })}
            {data[0].allocation.map((value, index) => {
              return (
                <td style={{ textAlign: "center" }}>
                  {String.fromCharCode(index + "A".charCodeAt(0))}
                </td>
              );
            })}
            {data[0].allocation.map((value, index) => {
              return (
                <td style={{ textAlign: "center" }}>
                  {String.fromCharCode(index + "A".charCodeAt(0))}
                </td>
              );
            })}
          </tr>
          {data?.map((row, rowIndex) => {
            return (
              <tr key={rowIndex}>
                <td className="input">
                  <input type="text" value={`P${rowIndex}`} disabled={true} />
                </td>
                {row.allocation?.map((value, index) => {
                  return (
                    <td className="input">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleChangeData(
                            e.target.value,
                            index,
                            "allocation",
                            rowIndex
                          )
                        }
                      />
                    </td>
                  );
                })}
                {row.max?.map((value, index) => {
                  return (
                    <td className="input">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleChangeData(
                            e.target.value,
                            index,
                            "max",
                            rowIndex
                          )
                        }
                      />
                    </td>
                  );
                })}
                {row.need?.map((value, index) => {
                  return (
                    <td className="input">
                      <input type="text" value={value} disabled />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default InputTable;
