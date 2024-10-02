import React from 'react'
import RowTabs from './rowTabs'

const OptionsRowTab = ({optionsContent,searchValue}) => {
  const title  = optionsContent.option_name ? optionsContent.option_name : optionsContent?.statement?.en;
  

  return (
    <div  className='option-sub-row' >
    <div className='options-sub-rowTabs-main'>
      <RowTabs contentName={title} searchValue={searchValue}/>
      <RowTabs contentName={optionsContent.nextQuestion} searchValue={searchValue}/>
      {console.log("just the data")}
    </div>
      <hr className='options-sub-rowTabs-divider'/>
</div>
  )
}

export default OptionsRowTab


