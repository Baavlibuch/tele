import {checksearch} from "../../helper/utils";

const DecisionRow = ({decision, searchValue, editMode, index, setDecisions}) => {

  const handleDecisionOperationChange = (event) => {
    const { value } = event.target;
    setDecisions(prev => {
      const list = [...prev];
      list[index].operation = value;
      return list;
    });
  };

  const handleDecisionValueChange = (event) => {
    const { value } = event.target;
    setDecisions(prev => {
      const list = [...prev];
      list[index].value = value;
      return list;
    });
  };

  const handleDecisionBranchChange = (event) => {
    const { value } = event.target;
    setDecisions(prev => {
      const list = [...prev];
      list[index].branch = value;
      return list;
    });
  };

  if (editMode) {
    return (
      <div className="decision-row">
        <select className="decision-operation" 
          defaultValue={decision.operation} 
          onChange={handleDecisionOperationChange}>
            <option value="<">{'<'}</option>
            <option value="<=">{'<='}</option>
            <option value=">">{'>'}</option>
            <option value=">=">{'>='}</option>
            <option value="==">{'=='}</option>
            <option value="!=">{'!='}</option>
        </select>
        <input className="decision-value" 
          placeholder="Value" 
          defaultValue={decision.value} 
          type="number" 
          step="0.5" 
          onChange={handleDecisionValueChange} />
        <input className="decision-branch" 
          placeholder="Branch" 
          defaultValue={decision.branch} 
          onChange={handleDecisionBranchChange} />
      </div>
    );
  }

  return (
      <div className="decision-row">
        <div className="decision-operation">{decision.operation}</div>
        <div className="decision-value">{decision.value}</div>
        <div className="decision-branch">{checksearch(decision.branch, searchValue)}</div>
      </div>
  );
};

export default DecisionRow;
