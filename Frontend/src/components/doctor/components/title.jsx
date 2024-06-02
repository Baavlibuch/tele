import React from 'react';


const Title = ({ title, titleKey, headings }) => {
	{
		/* {titleKey}: {title} */
	}
	return (
		<div
			className=""
			style={{
				width:"80%",
				display: 'flex',
				justifyContent: 'space-between',
				flexDirection: 'row',
				// flexWrap: 'nowrap',
				fontSize: '12px',
				gap: '5px'
			}}
		>
			{/* <div style={{}}>name</div> */}
			{/* <div style={{}}>probability of option</div> */}
			{headings?.map((item, index) => (
				<div key={index}>{item}</div>
			))}
		</div>
	);
};

export default Title;
{/* <div style={{}}>statement</div>
<div style={{}}>next Question</div>
<div style={{}}>value</div> */}
