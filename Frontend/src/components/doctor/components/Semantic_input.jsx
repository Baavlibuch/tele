import React, { useState } from 'react';
import { AddSemantic } from '../helper/dbUtils';

const Semantic_input = ({ itemid, type, setOntologies_data, setTopic_data }) => {
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log("clicked");
      AddSemantic(itemid, value, type, setOntologies_data, setTopic_data);
      setEditable(false);
	  setValue("")
    } else if (e.key === 'Escape') {
      setEditable(false);
    }
  };

  return (
    <div>
      {!editable ? (
        <button onClick={() => setEditable(true)}>+</button>
      ) : (
        <textarea
          className="topic-font"
          rows="2"
          autoFocus
          type=""
          value={value}
          onClick={() => {}}
          placeholder={'Enter the message ...'}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      )}
    </div>
  );
};

export default Semantic_input;
