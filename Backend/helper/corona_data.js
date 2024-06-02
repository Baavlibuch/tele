const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

setInterval(() => {
	fetch('https://api.covid19india.org/data.json')
		.then((response) => response.json())
		.then((result) => {
			const obj = {
				national_stats: result.statewise.filter(({ statecode }) => statecode === 'TT')[0],
				rajasthan_stats: result.statewise.filter(({ statecode }) => statecode === 'RJ')[0]
			};
			fs.writeFile(
				path.join(__dirname, '../data/cases.json'),
				JSON.stringify(obj),
				'utf8',
				(err) => {}
			);
		})
		.catch((err) => console.error(err));
}, 10 * 60 * 1000);
