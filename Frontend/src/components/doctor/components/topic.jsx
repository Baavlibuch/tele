import React, { useState } from 'react';
import Semantic_input from './Semantic_input';
import io from 'socket.io-client';
const socket = io.connect('/doctor/persona');
// import { checksearch } from '../helper/utils';

const Topic = ({ item, checksearch, searchValue }) => {
	const [target1, setTarget1] = useState(null);
	const [target2, setTarget2] = useState(null);
	const [val1, setVal1] = useState(null);
	const [val2, setVal2] = useState(null);
	const [topic_data, setTopic_data] = useState(
		item.Topic
		// .length > 0 ? item.Topic : ['heart attack', 'liver attack', 'eye problem']
	);
	const [ontologies_data, setOntologies_data] = useState(
		item.Ontologies
		// .length > 0
		// 	? item.Ontologies
		// 	: ['Ontologies', 'Ontologies attack', 'Ontologies problem', 'Ontologies']
	);

	const handleeditsemantic = (e, type, index) => {
		if (e.key === 'Enter') {
			console.log('just clicekd enter');
			try {
				socket.emit(
					'edit_semantic',
					item._id,
					type === 'topic' ? val1 : val2,
					type,
					index,
					(res) => {
						if (res.status === 'done') {
							console.log(res.datas);
							if (typeof setTopic_data === 'function') {
								setTopic_data(
									res.datas.Topic === null || res.datas.Topic === undefined ? [] : res.datas.Topic
								);
							}

							if (typeof setOntologies_data === 'function') {
								setOntologies_data(
									res.datas.Ontologies === null || res.datas.Ontologies === undefined
										? []
										: res.datas.Ontologies
								);
							}
							if (type === 'topic') {
								setTarget1(null);
							} else {
								setTarget2(null);
							}
						} else if (res.status === 'error') {
							console.log('error');
						}
					}
				);
			} catch (e) {
				console.log(e);
			}
		} else if (e.key === 'Escape') {
			if (type === 'topic') {
				setTarget1(null);
			} else {
				setTarget2(null);
			}
			setVal1(null);
		}
	};

	return (
		<div className="topic-column">
			<div className="topic-horizantal">
				{topic_data.map((topic, index) => (
					<div
						className="topic-element"
						onClick={() => {
							setTarget1(index);
							setVal1(topic);
						}}
					>
						{target1 === index ? (
							<input
								value={val1}
								onChange={(e) => {
									setVal1(e.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleeditsemantic(e, 'topic', index);
									} else if (e.key === 'Escape') {
										e.preventDefault();
										// console.log("loggged for the target 1");
										setTarget1(null);
									}
								}}
							/>
						) : (
							checksearch(topic, searchValue)
							// topic
						)}
					</div>
				))}
				<div className="topic-element">
					<Semantic_input type={'topic'} itemid={item._id} setTopic_data={setTopic_data} />
				</div>
			</div>
			<div className="topic-horizantal">
				{ontologies_data.map((topic, index) => (
					<div
						className="topic-element"
						onClick={() => {
							setTarget2(index);
							setVal2(topic);
						}}
					>
						{target2 === index ? (
							<input
								value={val2}
								onChange={(e) => {
									setVal2(e.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleeditsemantic(e, 'Ontologies', index);
									} else if (e.key === 'Escape') {
										e.preventDefault();
										setTarget2(null);
									}
								}}
							/>
						) : (
							checksearch(topic, searchValue)
							// topic
						)}
					</div>
				))}
				<div className="topic-element">
					<Semantic_input
						type={'Ontologies'}
						itemid={item._id}
						setOntologies_data={setOntologies_data}
					/>
				</div>
			</div>
		</div>
	);
};

export default Topic;
