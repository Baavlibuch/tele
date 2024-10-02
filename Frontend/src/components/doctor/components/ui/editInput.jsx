import React from 'react';

const Input = ({ placeHolder, textValue, handleText, name, type }) => {
	return (
		<textarea
			placeholder={placeHolder}
			type="text"
			value={textValue}
			name={name}
			className={`${type === 'new' ? 'NewInput' : 'EditInput'}`}
			onChange={handleText}
		/>
	);
};

export default Input;
