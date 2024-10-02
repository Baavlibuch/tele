import React, { useEffect, useState } from 'react';
import { checksearch } from '../helper/utils';
import ContentVariantColumn from './contentVariantColumn';
import NormalStatement from './normalStatement';

const StatementVarient = ({ item, searchValue }) => {
	const [statement, setStatement] = useState(item.statement);
	const [varient, setVarient] = useState(item.content_variants);
	useEffect(() => {
		console.log(varient.length);
	}, [varient]);

	return (
		<>
			{varient.length > 0 ? (
				<ContentVariantColumn
					key={`f3-${item._id}-ContentVariantColumn`}
					item={item}
					varient={varient}
					searchValue={searchValue}
				/>
			) : (
				<NormalStatement
					key={`f3-${item._id}-normalStatement`}
					statement={statement}
					dataId={item._id}
					searchValue={searchValue}
					checksearch={checksearch}
					items={item}
					setStatement={setStatement}
					setVarient={setVarient}
				/>
			)}
		</>
	);
};

export default StatementVarient;
