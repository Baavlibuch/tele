import { checksearch } from "../../helper/utils";

const FactorRow = ({factor, searchValue, editMode, index, setFactors}) => {

  const handleFactorNameChange = (event) => {
    const { value } = event.target;
    setFactors(prev => {
      const list = [...prev];
      list[index].name = value;
      return list;
    });
  };

  const handleFactorValueChange = (event) => {
    const { value } = event.target;
    setFactors(prev => {
      const list = [...prev];
      list[index].value = value;
      return list;
    });
  };

  if (editMode) {
    return (
      <div className="factor-row">
        <input className="factor-name" placeholder="Factor Name" defaultValue={factor.name} onChange={handleFactorNameChange} />
        <input className="factor-value" placeholder="Value" defaultValue={factor.value} type="number" step="0.5" onChange={handleFactorValueChange} />
      </div>
    );
  }

  return (
    <div className="factor-row">
      <div className="factor-name">{checksearch(factor.name, searchValue)}</div>
      {factor.value !== null && <div className="factor-value">{factor.value}</div>}
    </div>
  );
};

export default FactorRow;
