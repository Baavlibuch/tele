import React,{useState} from "react";
import reactdom from "react-dom";
import "./Field.css";
import Rowdata from "../row_data/Row_Data";



function Field(props) {

 


  return (
    <div className="root-row">
      <div className="f1">{props.id}</div>
      <div className="f2">{props.name1}</div>
      <div className="f3">{props.Statement1}</div>
      <div className="f4">{props.next1}</div>
      <div className="f5" >
        
 
        ssd
      </div>
    </div>
  );
}

export default Field;
