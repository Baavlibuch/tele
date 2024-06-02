import React, { useEffect, useState } from "react";
import "./Fied_row.css";
import Field from "../Field/Field";
import io from "socket.io-client";
import "../Field/Field.css";

const socket = io.connect("http://localhost:3001");

function Fied_row(props) {
  return (
    <>
      <div className="field">
        {props.dat.map((item) => (
          <div className="root-row">
            <div className="f1">{item._id}</div>
            <div className="f2">{item.name1}</div>
            <div className="f3">{item.Statement1}</div>
            <div className="f4">{item.next1}</div>
            <div className="f5">ssd</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Fied_row;
