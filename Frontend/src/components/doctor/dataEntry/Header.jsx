import React, { useState } from 'react';
// import "./Header.css";
import Rowdata from './row_data/Row_Data';

function Header({
	handle,
	collapse,
	tooglemetadatafunction,
	toogleidfunction,
	tooglesemanticfunction
}) {
	return (
		<div className="root-head-main">
            <div className="c0">Graph</div>
			<div className="root-head">
				<div className={collapse.toogleid ? 'c1' : 'handlecleann'} onClick={toogleidfunction}>
					ID
				</div>
				<div className="c2">Name</div>
				<div className="cflow">Flow</div>
				<div className="c3">Statement/Content Variants</div>
				<div className="c4">Next</div>
				<div className="c5" onClick={handle}>
					Options
				</div>
        <div className="process">Process</div>
				<div className="type">
					Type
				</div>
				<div
					className={collapse.tooglesemantic === true ? 'c6' : 'handlecleann'}
					onClick={tooglesemanticfunction}
				>
					Semantic
				</div>
				<div
					className={collapse.tooglemetadata === true ? 'c-metaData' : 'handlecleann'}
					onClick={tooglemetadatafunction}
				>
					Meta Data
				</div>
			</div>
		</div>
	);
}

export default Header;
