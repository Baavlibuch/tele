import React from 'react';
import { checksearch } from '../helper/utils';

const RowTabs = ({ contentName, searchValue }) => {
	return <div className="rowTab-subMain">{checksearch(contentName ?? '', searchValue)}</div>;
};

export default RowTabs;
