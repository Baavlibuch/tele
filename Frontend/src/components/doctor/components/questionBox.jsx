import React from 'react'

import { shortText } from '../helper/utils'

const QuestionBox = ({ messageId, langType, statement, optionStatement, type  }) => {
  return (
    <div className="question-box">
        <div className="border question-messageId">
            {messageId}
        </div>
        <div className="border question-statement">
            {
                langType === "english" ? 
                statement.en ? shortText(statement.en) : "NAN" 
                : 
                statement.hi ? shortText(statement.hi) : "NAN" 
            }
        </div>                    
        <div className="border question-statement">
            {
                langType === "english" ? 
                optionStatement?.en ? shortText(optionStatement?.en) : "NAN" 
                : 
                optionStatement.hi ? shortText(optionStatement.hi) : "NAN" 
            }
        </div>                    
    </div>
  )
}

export default QuestionBox
