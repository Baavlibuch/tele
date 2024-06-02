import React,{useState,useEffect} from 'react';
import chatgpticon from '../../../../src/data/chatgpt-icon.svg';

const Dropoption = ({ item, alert, alertvalue, setAlert, setAlertValue }) => {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleContextMenu = (e) => {
			e.preventDefault();
			setPosition({ x: e.pageX, y: e.pageY });
			setAlert(!alert);
		};

		document.addEventListener('contextmenu', handleContextMenu);

		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	}, [alert, setAlert]);

	function translate() {
		socket.emit('translate', item.en, dataId, index, (res) => {
			if (res !== null) {
				setAlertValue(res.data);
				setAlert(!alert);
				console.log('this is fun', alertvalue);
			}
		});
		setAlert(!alert);
		if (Index === null) {
			setIndex(index);
		} else {
			setIndex(null);
		}
	}

	return (
		<div className="box" 
		style={{ position: 'absolute', top: position.y, left: position.x }}>
			<div>
				<img src={chatgpticon} alt="" className="img" onClick={translate} />
				Translate
			</div>
		</div>
	);
};

export default Dropoption;
