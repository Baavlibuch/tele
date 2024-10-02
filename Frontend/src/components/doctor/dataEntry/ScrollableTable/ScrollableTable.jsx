import React, { useState } from "react";
import "./scr.css";

const ScrollableTable = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollTop);
  };

  return (
    <div className="scrollable-table" onScroll={handleScroll}>
      <div className="table-wrapper">
        <div className="table-header">{/* Table header content */}</div>
        <div className="table-body" style={{ top: -scrollPosition }}>
          {/* Table body content */}
        </div>
      </div>
    </div>
  );
};

export default ScrollableTable;
