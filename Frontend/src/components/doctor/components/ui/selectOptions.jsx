import React from 'react'

const SelectOptions = ({
    name,
    onChange,
    selectOptions,
}) => {
  return (
       <select className='customSelect' name={name} onChange={onChange}>
            {selectOptions.map(option => (
                <option value={option.values}>{option.showValues}</option>
            ))}
        </select>
  )
}

export default SelectOptions
