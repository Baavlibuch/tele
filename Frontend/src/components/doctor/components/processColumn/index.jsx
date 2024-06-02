import './index.scss';
import React, { useEffect, useState } from 'react';
import FactorRow from './factorRow';
import DecisionRow from './decisionRow';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Heading from './heading';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io.connect('/doctor/persona');

const ProcessColumn = ({ item, searchValue }) => {

  if (!item.process) {
    return null;
  }

  const [factorPopup, setFactorPopup] = useState(false);
  const [decisionPopup, setDecisionPopup] = useState(false);
  const [factors, setFactors] = useState(item.process.factors);
  const [decisions, setDecisions] = useState(item.process.decision);

  const showFactorPopup = () => {
    setFactorPopup(true);
  };

  const showDecisionPopup = () => {
    setDecisionPopup(true);
  };

  const addNewFactor = () => {
    setFactors(prev => [...prev, { name: '', value: null }]);
  };

  const addNewDecision = () => {
    setDecisions(prev => [...prev, { operation: '<', value: null, branch: '' }]);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFactorPopup(false);
        setDecisionPopup(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    socket.emit('update_process_factors', { message_id: item._id, factors }, (data) => {
      if (data.status === 'error') {
        toast.error(data.message);
      }
    });
  }, [factors]);

  useEffect(() => {
    socket.emit('update_process_decision', { message_id: item._id, decisions }, (data) => {
      if (data.status === 'error') {
        toast.error(data.message);
      }
    });
  }, [decisions]);

  return (
    <div className="process-column-container">
      <div>
        {factorPopup && 
          <Heading 
            headings={['Name', 'Value']} 
            className="factor-title" />
        }
        <div className='factor-container'>
          <div className={`factor-row-container ${factorPopup ? 'factor-row-container-popup' : ''} `} 
            onClick={showFactorPopup}>
            {factors.map((factor, index) => (
              <FactorRow 
                key={index} 
                factor={factor} 
                searchValue={searchValue} 
                setFactors={setFactors}
                index={index}
                editMode={factorPopup} />
            ))}
          </div>
          {factorPopup && (
            <AddCircleOutlineOutlinedIcon
			  	    className="add-icon"
			  	    onClick={addNewFactor}
			      />
          )}
        </div>
      </div>
      <div>
        {decisionPopup && 
          <Heading 
            headings={['Operation', 'Value', 'Branch']} 
            className="decision-title" />
        }
        <div className='decision-container'>
          <div className={`decision-row-container ${decisionPopup ? 'decision-row-container-popup' : ''} `} 
            onClick={showDecisionPopup}>
            {decisions.map((decision, index) => (
              <DecisionRow 
                key={index} 
                decision={decision} 
                searchValue={searchValue} 
                setDecisions={setDecisions}
                index={index}
                editMode={decisionPopup} />
            ))}
          </div>
          {decisionPopup && (
            <AddCircleOutlineOutlinedIcon
              className="add-icon"
              onClick={addNewDecision}
            />
          )}
        </div>
      </div>
    </div>
  );

};

export default ProcessColumn;
