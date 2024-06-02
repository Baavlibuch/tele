import React, { useState, useEffect } from 'react';

function Level(props) {
	const [data, setData] = useState(props.data);
	useEffect(() => {
		setData(props.data);
	}, [props.data]);
	useEffect(() => {
		setData(props.data);
	});

	return (
		<div className="Level fadeInUp" style={{ animationDelay: '0.8s' }}>
			<div className="level-item is-cherry">
				<h2>पुष्टीकृत</h2>
				<h1>{data.confirmed} </h1>
			</div>

			<div className="level-item is-blue">
				<h2 className="heading">संक्रमित</h2>
				<h1 className="title has-text-info">{data.active}</h1>
			</div>

			<div className="level-item is-green">
				<h2 className="heading">उपचारित</h2>
				<h1 className="title has-text-success">{data.recovered} </h1>
			</div>

			<div className="level-item is-gray">
				<h2 className="heading">मृतक</h2>
				<h1 className="title has-text-grey">{data.deaths}</h1>
			</div>
		</div>
	);
}

export default Level;
