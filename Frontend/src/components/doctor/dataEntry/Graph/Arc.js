import React from "react";
import * as d3 from "d3";
import { group } from "d3";

const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];
const MARGIN = { top: 70, right: 10, bottom: 70, left: 80 };
const TEXT_TO_NODE_PADDING = 20;

const ArcDiagram = ({ width, height, data }) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allNodeNames = data.nodes.map((node) => node.id);
  const allNodeGroups = [...new Set(data.nodes.map((node) => node.group))];

  const yScale = d3.scalePoint().range([0, boundsHeight]).domain(allNodeNames);
  const colorScale = d3.scaleOrdinal().domain(allNodeGroups).range(COLORS);
  var value = [] ;


  const allNodes = data.nodes.map((node, i) => {
    var cornerOffset_Group1 = i;
    value[0] = cornerOffset_Group1 ;
    var cornerOffset_Group2 = i - 40;
    value[1] = cornerOffset_Group2 ;
    var cornerOffset_Group3 = i - 50;
    value[2] = cornerOffset_Group3 ;
    var cornerOffset_Group4 = i - 60;
    value[3] = cornerOffset_Group4 ;
    var cornerOffset_Group5 = i - 70;
    value[4] = cornerOffset_Group5 ;

    var lining = () => {
      if (node.group === "Group 1") {
        return cornerOffset_Group1;
      }
      if (node.group === "Group 2") {
        return cornerOffset_Group2;
      } 
      if (node.group === "Group 3") {
        return cornerOffset_Group3;
      } 
      if (node.group === "Group 4") {
        return cornerOffset_Group4;
      } 
      if (node.group === "Group 5") {
        return cornerOffset_Group5;
      }  
      
      else {
        return 0;
      }
    };

    return (
      <g key={node.id}>
        <circle
          cx={lining()}
          cy={yScale(node.id)}
          r={4}
          fill={colorScale(node.group)}
        />
       {/* <text
          x={-TEXT_TO_NODE_PADDING}
          y={yScale(node.id)}
          textAnchor="end"
          fontSize={14}
          alignmentBaseline="middle"
        >
          {node.id}
       </text> */}
      </g>
    );
  });

  const allLinks =  data.links.map((link,i)=>{
    

  })

  
  /*const allLinks = data.links.map((link, i) => {
    const sourceNode = data.nodes.find((node) => node.id === link.source);
    if (!sourceNode) return null;

    const yStart = yScale(link.source);
    const yEnd = yScale(link.target);

    if (typeof yStart === "undefined" || typeof yEnd === "undefined") {
      return null;
    }

    const cornerOffset = 5 - i *10 ; // Increase offset for each link to avoid overlap
    const color = colorScale(sourceNode.group); // Use the color of the start node's group

    const pathData = `
    M 0 ${yStart}
    L ${cornerOffset } ${value[i]}
    L ${cornerOffset } 0
    L 0 ${yEnd }   
    `;

    return (
      <path key={i} d={pathData} stroke={color} strokeWidth={2} fill="none" />
    );
  }); */

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allNodes}
          {allLinks}
        </g>
      </svg>
    </div>
  );
};

export default ArcDiagram;
