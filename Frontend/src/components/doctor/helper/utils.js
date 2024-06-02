import React from 'react';

export const shortText = (text) => {
	if (text === undefined || text === null || text === '') {
		return text;
	}
	const finalShortText = text.substring(0, 50) + '...';

	return finalShortText;
};

export const checksearch = (content, search) => {
    if (search === '' || content === '' ||
        search === null || content === null ||
        search === undefined || content === undefined) {
        return content;
    } 

	const paragraphs = content.split('\n'); // Split content into paragraphs
	const modified_paragraphs = paragraphs.map((paragraph, index) => (
		<p key={`paragraph-${index}`}>
			{paragraph.split(search).map((part, partIndex, array) =>
				partIndex !== array.length - 1 ? (
					<React.Fragment key={`part-${index}-${partIndex}`}>
						{part}
						<span className="highlight" style={{ backgroundColor: 'orange' }}>
							{search}
						</span>
					</React.Fragment>
				) : (
					part
				)
			)}
		</p>
	));

	return modified_paragraphs;
};
