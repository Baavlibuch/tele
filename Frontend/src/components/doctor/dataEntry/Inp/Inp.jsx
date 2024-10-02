import io from "socket.io-client";
import "./Inp.css";
const socket = io.connect("http://localhost:3001");
import React, { useEffect, useState, useRef } from "react";

function Inp(props) {

  const [name1, setName1] = useState("");
  const [Statement1, setStatement1] = useState("");
  const [next1, setNext1] = useState("");
  const [name2, setName2] = useState("");
  const [Statement2, setStatement2] = useState("");
  const [next2, setNext2] = useState("");
  const [val, setVal] = useState(300);


  const inputRef = useRef(null);
  const sendMessage = () => {
    const msg = {
      name1: name1,
      Statement1: Statement1,
      next1: next1,
      name2: name2,
      Statement2: Statement2,
      next2: next2,
    };

    socket.emit("sending", msg);
    setName1(" ");
    setName2("");
    setNext1("");
    setNext2("");
    setStatement2("");
    setStatement1("");
    inputRef.current.focus();



  };

  useEffect(() => {
    socket.on("send_last_val", async (asa, dd) => {

      if (asa === null) {
        setVal(300);
      } else {
        setVal(asa._id + 1);
      }
    });
  }, []);

  return (
    <div className="main">
      <div className="inp">
        <div className="i1">
          {/* <input placeholder="Id" /> */}
          {val}
        </div>
        <div className="i2">
          <input
            placeholder="Name"
            value={name1}
            onChange={(event) => setName1(event.target.value)}
            ref={inputRef}
            autoFocus
          />
        </div>
        <div className="i3">
          <input
            placeholder="Statement"
            type="text"
            value={Statement1}
            onChange={(event) => setStatement1(event.target.value)}
          />
        </div>
        <div className="i4">
          <input
            placeholder="Next"
            type="text"
            value={next1}
            onChange={(event) => setNext1(event.target.value)}
          />
        </div>
        <div className="i5">
          <input
            placeholder="Option's Name"
            type="text"
            value={name2}
            onChange={(event) => setName2(event.target.value)}
          />
        </div>
        <div className="i6">
          <input
            placeholder="Option's Statement"
            type="text"
            value={Statement2}
            onChange={(event) => setStatement2(event.target.value)}
          />
        </div>
        <div className="i7">
          <input
            placeholder="Option's Next"
            type="text"
            value={next2}
            onChange={(event) => setNext2(event.target.value)}
          />
        </div>
      </div>
      <div>
        <button onClick={sendMessage}>Submit</button>
      </div>
    </div>
  );
}

export default Inp;
