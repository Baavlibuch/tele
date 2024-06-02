import React from "react";
import Heading from "../heading/Heading";


function Row_data(props) {
  return (
    <div className="level1-sheet">
      <div className="layer_row">
        <Heading />
        <div className="layer_table_values">
          {props.Data.map((item) => (
            <div className="layer-row" key={item.id}>
              <div>{item.name2}</div>
              <div>{item.Statement2}</div>
              <div>{item.next2}</div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Row_data;
