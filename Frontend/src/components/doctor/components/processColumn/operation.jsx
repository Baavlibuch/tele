import { useState } from 'react';

const Operation = ({ operation, index }) => {

  const [viewOperation, setViewOperation] = useState(true);

  const handleChange = (event) => {
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setViewOperation(true);
    }
  };

  return (
    <>
    { viewOperation?
        <p className="operation"
          onClick={() => setViewOperation(false)} >
            {operation}
        </p> :
        <select value={operation} 
          className="operation"
          onChange={handleChange}
          onKeyDown={handleKeyDown} >
            <option value="sum">{'sum'}</option>
            <option value="average">{'average'}</option> {/* TODO: add more operations. Not sure if average should be here. */}
        </select>
    }
    </>
  );
}

export default Operation;
