import React from "react";
import "./Card.css";

function Card(props) {
  return (
    <div className="card_main">
      <div>
        <p>{props._id}</p>
        <p>{props.name1}</p>
        <p>{props.Statement1}</p>
      </div>
      <div>
        <p>{props.next1}</p>
        <p>{props.name2}</p>
        <p>{props.Statement2}</p>
        <p>{props.next2}</p>
      </div>
    </div>
  );
}

export default Card;
