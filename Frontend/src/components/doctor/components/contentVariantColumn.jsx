import React, { useState } from 'react';

import StatementBox from './statementBox';
import RowTabs from './rowTabs';
import { CreateContentVariantData, EditContentVariantData } from '../helper/dbUtils';

const ContentVariantColumn = ({ item ,varient,searchValue}) => {
	const [contentVariantPopUp, setContentVariantPopUp] = useState(false);

	const handleContentTableOpen = (event) => {
		event.stopPropagation();
		setContentVariantPopUp(true);
	};

	const handleContentTableClose = (event) => {
		event.stopPropagation();
		setContentVariantPopUp(false);
	};

	const [newDataVariant, setNewDataVariant] = useState({
		title:'',
		statementEn:'',
		statementHi:'',
	}); 


	const newInputsField = [
		{placeholder:"Content Variant Title", type:"new",name:"title", textValue:newDataVariant.title},
		{placeholder:"Content Variant Statement in English", type:"new", name:"statementEn", textValue:newDataVariant.statementEn },
		{placeholder:"Content Variant Statement in Hindi", type:"new", name:"statementHi" ,textValue:newDataVariant.statementHi },
	]


	const handleNewData = (e) => {
        e.preventDefault();

        const name = e.target.name;
        const value = e.target.value;

        setNewDataVariant(prev => ({
            ...prev,
            [name]:value
        }))
    };


	return (
		<div>
			{contentVariantPopUp ? (
			<StatementBox
				handleNewData={handleNewData}
				createFunction={CreateContentVariantData}
				editFunction={EditContentVariantData}
				handleContentTable={handleContentTableClose}
				newData={newDataVariant}
				content={varient}
				dataId={item._id}
				titleKey={"Variant Name"}
				newInputsField={newInputsField}
				searchValue={searchValue}
				headings={["statement","content name","variant probability"]}
			/>
		) : (
			<div className="rowTabs-main" onClick={handleContentTableOpen}>
				{varient &&
					(varient.map((content) => (
						<RowTabs contentName={content.content_variant_name} key={content._id} />
					)
				))}
			</div>
		)}
		</div>
	);
};

export default ContentVariantColumn;
