// Documentation of this Component are rooted !

// -------------------------------
// ROOTED DOCUMENTATION!!!
// -------------------------------

// NOTE: - >
// 			SOMEWHERE IN FUTURE, IF DATA BECOMES TOO COMPLICATED YOU"VE TO SHIFT THE NODE POINT, CONSIDER THE AMOUNT AND COMPLEXITY OF DATA for same to
// 			to make the informed decisions.
// 			REMEMBER DON"T DISTURB THE INITIAL FLOW JUST MAKE SOME TWITHCES IN NODE POSITIONS





import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
// Whenever I refer to Namenode it refers to inital node where graph node starts!!!

// THIS COMPONENT WILL CREATE NODE FOR EACH NAME and for Name nextquestions and optionsquestion
// Node are interconnected to each other by relation of nextquestions and optionsquestions, you've to mark
//   					* 		 <- Name ID 
//   					|\
// 	Next question->		* * 	 <- Option ID
// 						  | \ 						  
// 

// Data from Path ->  Telemedicine\frontend\src\components\doctor\persona.js
// LINE 583

const Svg = ({ data }) => {
	// UseRef
	const linksRef = useRef();
	// CREATE NODE, where all the options and nextquestions node will be created!
	const [graphData, setGraphData] = useState([]);
	// THis will store nextquestion node bottom of NAME NODE
	const [nextQuestionPathData, setNextQuestionPathData] = useState([]);
	// THIS WILL Create Options Path that will lay side by side
	const [optionsPathData, setOptionsPathData] = useState([]);
	const [Insertparentnode, setInsertParentNode] = useState([]);
	// THIS Will store final node that will PASSED in D3 module
	const [finalPathData, setFinalPathData] = useState([]);

	// THIS WIll help to adjust the node to bring close when they far away!
	let yPos = 0;
	let yInc = 4; // 12
	let finalPosDec = 0;

	// SET GRAPHDATA to empty array and call createNodes function to generate all the Node 
	useEffect(() => {
		setGraphData([]);
		// Call all the function and create all the node
		createNodes();
	}, [data]);

	useEffect(() => {
		// When the data is full and created succcessfully SetNextqueestionPathDatato, setOptionsPathData will set to empty and woill call the insertNextQuestionPaths insertOptionsPaths function to
		// to create the node for Nextquestion, and options
		if (graphData.length > 0) {
			// Set this one to empty
			setNextQuestionPathData([]);
			setOptionsPathData([]);
			setInsertParentNode([]);
			// Call these functions to crreate node for each Name Node !!
			insertNextQuestionPaths();
			insertOptionsPaths();
			insertParentNode();
		}
		// After the graphData is successfully completed it will be called, Invoked !!
	}, [graphData]);

	useEffect(() => {
		if (graphData.length > 0 && nextQuestionPathData.length > 0 && optionsPathData.length > 0) {
			// Put all the data into updatedFinalPathData
			const updatedFinalPathData = [...graphData, ...nextQuestionPathData, ...optionsPathData, ...Insertparentnode];
			if (updatedFinalPathData.length > 0) {
				// Traverse each node 
				updatedFinalPathData.map((item, index) => {
					updatedFinalPathData.map((subItem, index) => {
						// Traverse each node to once again to find the repeated data that have same yPositions, id, but different xPositions
						if (item.edgeEnd[1] === subItem.edgeEnd[1] && item.edgeEnd[0] != subItem.edgeEnd[0] && item.id === subItem.id) {

							// check which one is greater, 
							// Assign the common position of node to greater value on XPositions
							if (subItem.edgeEnd[0] > item.edgeEnd[0]) {
								// Overlap the Initial node with side node
								// Like Xpos > will be kept and other one will be removed!
								item.edgeEnd[0] = subItem.edgeEnd[0];
								item.edgeStart[0] = subItem.edgeEnd[0];
							} else {
								// Side the Initial positions which one is greater!
								subItem.edgeEnd[0] = item.edgeEnd[0];
								subItem.edgeEnd[0] = item.edgeStart[0];
							}
						}
						// Check for debugging purpose
						// if(item.id == subItem.id && subItem.id == '90.1 Cardiac status'){
						// 	console.log("ITEM 32", item, subItem )
						// }
					});
				});
			}
			// console.log("updatedFinalPathData", updatedFinalPathData);
			setFinalPathData(updatedFinalPathData);
		}
		// 
		// If graphData, nextQuestionPathData, optionsPathData completed this useEffect will be invoked !!
	}, [graphData, nextQuestionPathData, optionsPathData]);

	// Create node for each name ID 
	const createNodes = () => {
		return new Promise((resolve) => {
			setGraphData(
				// Iterate through each data and create endedgeStart, edgeEnd, id for node 
				// Remember endedgeStart, edgeEnd will define the start and endpoint for each node and node will created in edgeEnd
				// endedgeStart will define starting line !!!
				data.map((item, index) => {
					// Create finalPos of node
					const finalPos = index > 0 ? data[index - 1].height + yInc : 40; //22
					yPos += finalPos + finalPosDec;

					// THIS ONE IS FOR SHIFTING PURPOSE, IF DATA BECOME TOO COMPLICATED USE THIS, ELSE LEAVE IT IS AS IT.
					// LIKE NODE SHFITING WHEN EDGES BECOME LONG !!

					if (index < 50 && index % 5 === 0) {
						yInc -= 2;
					}
					if (index === 25) {
						// yInc = 5;
						finalPosDec = 10;
					}
					if (index === 50) {
						finalPosDec = 15;
					}
					if (index === 100 && index % 5 === 0) {
						finalPosDec -= 1;
					}
					yPos -= 10;
					return {
						id: item.id,
						edgeStart: [item.position[0] - 200, yPos],
						edgeEnd: [item.position[0] - 200, yPos],
					};
				})
			);
			resolve();
		});
	};

	// This creates NextQuestionPaths, that straight line where NameNode will be attached to !!
	const insertNextQuestionPaths = async () => {
		// Array to store the inital node!!
		const tempNextQuestionPathData = [];
		// Iterate through each node and find which node has nextquestion
		// If it has nextquestion create a starting point for same and end to node where Nextquestions acutally in NameID
		for (const item of data) {
			if (item.nextQuestion) {
				// To store the starting and endpoint for each Nextquestions
				let tempEdgeEnd;
				let tempEdgeStart;
				let IslowerTriangle = false;
				// Iterate though each node and find the node point, where Node has nextquestions and if it has store the inital point to create the line for the same
				// 
				graphData.map((graphItem, index) => {
					// Store the initial point where line will start
					if (item.id === graphItem.id) {
						tempEdgeStart = graphItem.edgeStart;
					}

					// Store the end node where nextquestion node will be created !!
					if (item.nextQuestion === graphItem.id) {
						tempEdgeEnd = [graphItem?.edgeEnd[0], graphItem?.edgeEnd[1]];
					}
				});

				// Check if that nextquestions exist in the table or not, if not assign the startpoint and create a node at that point
				if (!tempEdgeEnd) {
					tempEdgeEnd = tempEdgeStart;
				}

				// Find the difference 
				const difference = tempEdgeEnd[1] - tempEdgeStart[1];

				// If that difference is greater than 800px just create at distance of 40px and create the node
				if (difference > 800) {
					tempEdgeEnd[1] = tempEdgeStart[1] + 40;
					//  		*
					// 			|  <- 40px distance only if greater than 800px
					// 			*
					IslowerTriangle = true;
				}

				// If node is upside somewhere Create the node below at distance of 30px!!
				// 				*
				// 				|   <- 30px distance only !!!!
				// 				*
				if (difference < 0) {
					tempEdgeEnd[1] = (tempEdgeStart[1] - difference) + 30;
				}


				// Push the data into tempNextQuestionPathData array 
				tempNextQuestionPathData.push({
					IslowerTriangle: IslowerTriangle == true ? true : false,
					id: item.nextQuestion,
					edgeEnd: tempEdgeEnd,
					edgeStart: tempEdgeStart
				});
			}
		}
		// AFter createing allthe nextquestions push into setNextQuestionPathData for finalizing purpose, for fitting !!!
		setNextQuestionPathData(tempNextQuestionPathData);
	};

	// Create the optionsPath for each name Node
	//   			*
	// 				 \       <- options path will be shifted by xPos
	// 				  *
	const insertOptionsPaths = () => {
		const tempOptionsPathData = data.flatMap((item, index) => {
			if (item?.options?.length > 0) {

				// Shift the xpositions of OptionsPath Data 
				let xPos = 0;
				// Count how many shifting is done so that row wise shifting can done for number of same data
				let count = 0;
				return item.options.map((option) => {
					// Iterate through each item options and create node by following properties
					let name;
					let tempEdgeEnd;
					let tempEdgeStart;
					let IsLowerTriangle = false;

					// If nextquestion exist
					if (option.nextQuestion) {
						// Iterate throught each node and create the node and create the nodepoint
						graphData.forEach((graphItem, index) => {
							if (item.id === graphItem.id) {
								// Start point starts from here
								tempEdgeStart = graphItem.edgeStart;
							}

							// End point where Node will be created !!
							if (option.nextQuestion === graphItem.id) {
								name = graphItem.id;
								// Shift by xPos so that they don't overlap with each other
								tempEdgeEnd = [graphItem?.edgeEnd[0] + xPos, graphItem?.edgeEnd[1]];
							}
						});

						// If tempEdgeEnd & tempEdgeStart exist !!
						if (tempEdgeEnd && tempEdgeStart) {
							xPos += 20;  // 16
							const difference = tempEdgeEnd[1] - tempEdgeStart[1];

							let allowDifference = 800;

							if (difference > allowDifference) {
								if (count == 3) {
									tempEdgeEnd[1] += 10;
									count = 0;
								}
								tempEdgeEnd[1] = tempEdgeStart[1] + 30;
								//  		*
								// 			|  <- 30px distance only if greater than 800px
								// 			*
								count++;
								IsLowerTriangle = true;

							}

							if (difference < 0) {
								tempEdgeEnd[1] = (tempEdgeStart[1]) + 30;
								// If node is upside somewhere Create the node below at distance of 30px!!
								// 				*
								// 				|   <- 30px distance only !!!!
								// 		        *
							}
							// Create the node adn return the value, and positions
							return {
								IslowerTriangle: IsLowerTriangle == true ? true : false,
								id: name,
								edgeEnd: tempEdgeEnd,
								edgeStart: tempEdgeStart
							};
						}
					}
					return null;
				});
			}
			return [];
		});
		// set the Options pathData...
		setOptionsPathData(tempOptionsPathData.filter(Boolean));
	};
	// console.log("finalPathData", finalPathData);

	const insertParentNode = () => {
		const SetParentNode = [];
		for (const item of data) {
			if (item.nextQuestion) {
				// To store the starting and endpoint for each Nextquestions
				let tempEdgeEnd;
				let tempEdgeStart;
				// Iterate though each node and find the node point, where Node has nextquestions and if it has store the inital point to create the line for the same
				// 
				graphData.map((graphItem, index) => {
					// Store the initial point where line will start
					if (item.id === graphItem.id) {
						tempEdgeStart = graphItem.edgeStart;
					}

					// Store the end node where nextquestion node will be created !!
					if (item.nextQuestion === graphItem.id) {
						tempEdgeEnd = [graphItem?.edgeEnd[0], graphItem?.edgeEnd[1]];
					}
				});

				// Check if that nextquestions exist in the table or not, if not assign the startpoint and create a node at that point
				if (!tempEdgeEnd) {
					tempEdgeEnd = tempEdgeStart;
				}

				// Find the difference
				const difference = tempEdgeEnd[1] - tempEdgeStart[1];

				// If that difference is greater than 800px just create at distance of 40px and create the node
				if (difference > 800) {
					// Call by value, copy the node positions inorder they occur
					let ParentNodeEnd = tempEdgeEnd.slice();
					let ParentNodeStart = tempEdgeEnd.slice();

					// Shift the parent node upward by 50px
					ParentNodeEnd[1] -= 50;
					// Shift the xPos of end positions 
					// 		   *   <- ParentNode
					//		  /		 
					// 		 *	<- ChildNode
					// 		 |
					//		 *    <- ChildNextQuestions
					//  
					ParentNodeEnd[0] += 30;

					// Push the 
					SetParentNode.push({
						Isuppertriangle: true,
						id: item.id,
						edgeEnd: ParentNodeEnd,
						edgeStart: ParentNodeStart
					});
				}
			}
		}
		setInsertParentNode(SetParentNode);
	}


	// THis will create the node !!
	// Refer to D3 module for more information!!
	const linkGen = d3
		.linkVertical()
		.source((d) => d.edgeEnd)
		.target((d) => d.edgeStart);

	const linkSvg = d3.select(linksRef.current).attr('width', '100%').attr('height', '100%');

	const verticalSpacing = 30;
	const colorScale = d3.scaleOrdinal().domain(finalPathData).range(d3.schemeCategory10);

	const linkNodes = linkSvg
		.selectAll('.node')
		.data(finalPathData)
		.enter()
		.append('g')
		.attr('class', 'node');

	linkNodes
		.each(function (d) {
			const node = d3.select(this);

			// Condition to determine whether to render a triangle or circle
			if (d?.Isuppertriangle) {
				// Render triangle
				node.append('polygon')
					.attr('points', (d) => {
						const x = d.edgeEnd[0];
						const y = d.edgeEnd[1];
						return `${x},${y - 8} ${x + 8},${y + 8} ${x - 8},${y + 8}`;
					})
					.attr('fill', (d) => colorScale(d))
					.append('title')
					.text((d) => d.id);
			} else if (d?.IslowerTriangle) {
				node.append('polygon')
					.attr('points', (d) => {
						const x = d.edgeEnd[0];
						const y = d.edgeEnd[1];
						return `${x},${y + 8} ${x + 8},${y - 8} ${x - 8},${y - 8}`;
					})
					.attr('fill', (d) => colorScale(d))
					.append('title')
					.text((d) => d.id);
			} else {
				// Render circle
				node.append('circle')
					.attr('cx', (d) => d.edgeEnd[0])
					.attr('cy', (d) => d.edgeEnd[1])
					.attr('r', 8)
					.attr('fill', (d) => colorScale(d))
					.append('title')
					.text((d) => d.id);
			}
		});

	linkSvg
		.selectAll('path')
		.data(finalPathData)
		.join('path')
		.attr('d', linkGen)
		.attr('fill', 'none')
		.attr('stroke', 'black');

	return <svg ref={linksRef} className="graph-svg"></svg>;
};



// Node is created and displayed side by side





export default Svg;
