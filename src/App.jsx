import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import "./index.css";

const TreemapChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const width = 1154;
    const height = 654;

    const color = d3.scaleOrdinal(
      data.children.map((d) => d.name),
      d3.schemeTableau10
    );

    // Create the root hierarchy and compute the treemap layout
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(1).round(true)(root);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Add a cell for each leaf
    const leaf = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Tooltip
    const format = d3.format(",.2f");
    leaf.append("title").text(
      (d) =>
        `${d
          .ancestors()
          .reverse()
          .map((d) => d.data.name)
          .join(" → ")}\n${format(d.value)}M Sales`
    );

    // Rectangle
    leaf
      .append("rect")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", 0.6)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    // ClipPath for Text
    leaf
      .append("clipPath")
      .attr("id", (d, i) => `clip-${i}`)
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    // Text Labels
    leaf
      .append("text")
      .attr("clip-path", (d, i) => `url(#clip-${i})`)
      .selectAll("tspan")
      .data(
        (d) => d.data.name.split(/\s+/) // Memisahkan berdasarkan spasi untuk semua kata
      )
      .join("tspan")
      .attr("x", 3)
      .attr(
        "y",
        (d, i, nodes) => `${1.2 + i * 1.1}em` // Menurunkan posisi untuk setiap kata
      )
      .attr("fill-opacity", (d, i, nodes) =>
        i === nodes.length - 1 ? 0.7 : null
      )
      .text((d) => d)
      .style("text-anchor", "start") // Mengatur posisi teks sesuai arah yang diinginkan
      .attr("transform", "rotate(0)"); // Tidak ada rotasi
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
      );
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl">Video Game Sales</h1>
      <h2 className="mb-5">
        Top 100 Most Sold Video Games Grouped by Platform
      </h2>
      {data ? <TreemapChart data={data} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
