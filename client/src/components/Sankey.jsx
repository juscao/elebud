import { useState, useEffect, useRef, useCallback } from "react";
import { Chart } from "react-google-charts";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useClickAway } from "@uidotdev/usehooks";
import { toPng } from "html-to-image";
import edit from "../imgs/edit.svg";
import remove from "../imgs/remove.svg";
import download from "../imgs/download.svg";
import confirm from "../imgs/confirm.svg";
import cancel from "../imgs/cancel.svg";

function Sankey(props) {
  const [updating, setUpdating] = useState(true);
  const [chart, setChart] = useState({});
  const [data, setData] = useState([]);
  const [dataWithDollarLabels, setDataWithDollarLabels] = useState([]);
  const [dataWithPercentageLabels, setDataWithPercentageLabels] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [nodes, setNodes] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorPicker, setColorPicker] = useState({
    origin: false,
    destination: false,
    background: false,
    links: false,
    font: false,
  });
  const [editNodeColor, setEditNodeColor] = useState({});
  const [newColors, setNewColors] = useState({
    origin: "",
    destination: "",
    background: "",
    links: "",
    font: "",
  });
  const [oldColors, setOldColors] = useState({
    origin: "",
    destination: "",
    background: "",
    links: "",
    font: "",
  });
  const [displayMode, setDisplayMode] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [searching, setSearching] = useState({
    origin: false,
    destination: false,
  });
  const [addNode, setAddNode] = useState({
    origin: "",
    destination: "",
    amount: "",
  });
  const [editingNode, setEditingNode] = useState("");
  const [editedNode, setEditedNode] = useState([]);
  const [originalNode, setOriginalNode] = useState([]);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [levels, setLevels] = useState(0);
  const [deletingNode, setDeletingNode] = useState(false);

  const ref = useRef(null);
  const clickAwayRef = useClickAway(() => {
    setSearching({ origin: false, destination: false });
  });
  useEffect(() => {
    if (!ref.current) return;

    setChartWidth(ref.current.getBoundingClientRect().width);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref.current]);

  useEffect(() => {
    document.title = `${props.project.title} | Elebud`;
    getChart();
  }, [props.project]);

  useEffect(() => {
    const origin = nodes.filter(
      (node) =>
        node.origin.localeCompare(addNode.origin.trim(), undefined, {
          sensitivity: "base",
        }) === 0
    )[0];
    const destination = nodes.filter(
      (node) =>
        node.destination.localeCompare(addNode.origin.trim(), undefined, {
          senstivity: "base",
        }) === 0
    )[0];
    if (origin) {
      setOldColors((prev) => ({ ...prev, origin: origin.originColor }));
    } else if (destination) {
      setOldColors((prev) => ({
        ...prev,
        origin: destination.destinationColor,
      }));
    } else {
      setOldColors((prev) => ({ ...prev, origin: "" }));
    }
  }, [addNode.origin]);

  useEffect(() => {
    const origin = nodes.filter(
      (node) =>
        node.origin.localeCompare(addNode.destination.trim(), undefined, {
          sensitivity: "base",
        }) === 0
    )[0];
    const destination = nodes.filter(
      (node) =>
        node.destination.localeCompare(addNode.destination.trim(), undefined, {
          senstivity: "base",
        }) === 0
    )[0];
    if (origin) {
      setOldColors((prev) => ({ ...prev, destination: origin.originColor }));
    } else if (destination) {
      setOldColors((prev) => ({
        ...prev,
        destination: destination.destinationColor,
      }));
    } else {
      setOldColors((prev) => ({ ...prev, destination: "" }));
    }
  }, [addNode.destination]);

  const downloadChart = useCallback(() => {
    if (!ref.current) return;

    const scrollWidth = ref.current.scrollWidth;
    const scrollHeight = ref.current.scrollHeight;

    toPng(ref.current, {
      canvasWidth: width,
      canvasHeight: height,
      width: scrollWidth,
      height: scrollHeight,
      style: {
        overflow: "visible",
      },
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${props.project.title.replace(/\s+/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.log(err));
  }, [ref, width, height, props.project.title]);

  async function getChart() {
    setUpdating(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${props.project.id}/chart/sankey`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data) {
        setChart(data.chart);
        setDisplayMode(data.chart.displayMode);
        setFontSize(data.chart.fontSize);
        setOldColors((prev) => ({
          ...prev,
          background: data.chart.backgroundColor,
          font: data.chart.fontColor,
          links: data.chart.sankeyLinkColor,
        }));
        setNewColors((prev) => ({
          ...prev,
          background: data.chart.backgroundColor,
          font: data.chart.fontColor,
          links: data.chart.sankeyLinkColor,
        }));
        setNodes(data.nodes);
        updateData(data.nodes);
        if (data.nodes.length > 0) {
          updateDataWithDollarLabels(data.nodes);
          updateDataWithPercentageLabels(data.nodes);
          updateEditVariables(data.nodes);
        }
      }
      setUpdating(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateChart() {
    try {
      const response = await fetch(
        `/api/v1/projects/${props.project.id}/chart/sankey`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            backgroundColor: newColors.background,
            linksColor: newColors.links,
            fontColor: newColors.font,
            fontSize: Number(fontSize),
            displayMode,
          }),
        }
      );
      const data = await response.json();
      if (data) {
        setChart(data);
        alert("Chart was successfully updated.");
      } else {
        alert("Unable to update chart. Please try again.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addSankeyNode() {
    const exists = nodes.filter(
      (node) =>
        node.origin === addNode.origin &&
        node.destination === addNode.destination
    )[0];
    if (exists) {
      alert("A node with this origin and destination already exists.");
    } else if (
      addNode.origin.trim().toLowerCase() ===
      addNode.destination.trim().toLowerCase()
    ) {
      alert("The origin and destination cannot be the same.");
    } else {
      try {
        const response = await fetch(
          `/api/v1/projects/${props.project.id}/chart/sankey/nodes`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chartId: chart.id,
              originColor: oldColors.origin
                ? oldColors.origin
                : generateRandomHexColor(),
              destinationColor: oldColors.destination
                ? oldColors.destination
                : generateRandomHexColor(),
              origin: addNode.origin.trim(),
              destination: addNode.destination.trim(),
              amount: Number(addNode.amount),
            }),
          }
        );
        const data = await response.json();
        const arr = [...nodes, data.add];
        arr.sort((a, b) => b.amount - a.amount);
        setNodes(arr);
        updateData(arr);
        updateDataWithDollarLabels(arr);
        updateDataWithPercentageLabels(arr);
        updateEditVariables(data.nodes);
        setAddNode({ origin: "", destination: "", amount: "" });
        setNewColors((prev) => ({
          ...prev,
          origin: "",
          destination: "",
        }));
        setOldColors((prev) => ({
          ...prev,
          origin: "",
          destination: "",
        }));
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function updateSankeyNode(id) {
    const node = editedNode.filter((node) => node.id === id)[0];
    if (node) {
      try {
        const response = await fetch(
          `/api/v1/projects/${props.project.id}/chart/sankey/nodes/${id}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              origin: node.origin.trim().toUpperCase(),
              originColor: node.originColor,
              destination: node.destination.trim().toUpperCase(),
              destinationColor: node.destinationColor,
              amount: node.amount,
            }),
          }
        );
        const data = await response.json();
        setNodes(data.allNodes);
        updateData(data.allNodes);
        updateDataWithDollarLabels(data.allNodes);
        updateDataWithPercentageLabels(data.allNodes);
        updateEditVariables(data.allNodes);
        setEditingNode("");
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function deleteSankeyNode(id) {
    setDeletingNode(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${props.project.id}/chart/sankey/nodes/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data) {
        setNodes(data.allNodes);
        updateData(data.allNodes);
        updateDataWithDollarLabels(data.allNodes);
        updateDataWithPercentageLabels(data.allNodes);
        updateEditVariables(data.allNodes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingNode(false);
    }
  }

  function getSankeyLevels(nodes, main) {
    const graph = new Map();
    const reverseGraph = new Map();

    nodes.forEach(({ origin, destination }) => {
      if (!graph.has(origin)) graph.set(origin, []);
      if (!reverseGraph.has(destination)) reverseGraph.set(destination, []);

      graph.get(origin).push(destination);
      reverseGraph.get(destination).push(origin);
    });

    function findDepth(node, graphMap, visited) {
      if (!graphMap.has(node)) return 0;

      let maxDepth = 0;
      for (const neighbor of graphMap.get(node)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          maxDepth = Math.max(
            maxDepth,
            1 + findDepth(neighbor, graphMap, visited)
          );
          visited.delete(neighbor);
        }
      }
      return maxDepth;
    }

    const leftDepth = findDepth(main, reverseGraph, new Set([main]));

    const rightDepth = findDepth(main, graph, new Set([main]));

    setLevels(leftDepth + rightDepth);
    return leftDepth + rightDepth;
  }

  function updateData(nodes) {
    const uniqueOrigins = [...new Set(nodes.map((node) => node.origin))];
    const uniqueDestinations = [
      ...new Set(nodes.map((node) => node.destination)),
    ];
    const arr = [
      [
        { type: "string", label: "Origin" },
        { type: "string", label: "Destination" },
        { type: "number", label: "Amount" },
        { type: "string", role: "tooltip", p: { html: true } },
        { type: "string", label: "originColor" },
        { type: "string", label: "destinationColro" },
      ],
    ];

    const nodesArr = [];
    const colorsArr = [];
    for (let i = 0; i < nodes.length; i++) {
      if (
        !uniqueDestinations.includes(nodes[i].origin) &&
        uniqueOrigins.includes(nodes[i].destination)
      ) {
        const destinationOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        arr.push([
          nodes[i].origin,
          nodes[i].destination,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />$${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      destinationOriginTotal >= destinationDestinationTotal
                        ? destinationOriginTotal
                        : destinationDestinationTotal
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
        if (!nodesArr.includes(nodes[i].origin)) {
          nodesArr.push(nodes[i].origin);
          colorsArr.push(nodes[i].originColor);
        }
        if (!nodesArr.includes(nodes[i].destination)) {
          nodesArr.push(nodes[i].destination);
          colorsArr.push(nodes[i].destinationColor);
        }
        if (i === nodes.length - 1) {
          setUpdating(false);
        }
      } else if (
        !uniqueOrigins.includes(nodes[i].destination) &&
        uniqueDestinations.includes(nodes[i].origin)
      ) {
        const originOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const originDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        arr.push([
          nodes[i].origin,
          nodes[i].destination,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      originOriginTotal >= originDestinationTotal
                        ? originOriginTotal
                        : originDestinationTotal
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
        if (!nodesArr.includes(nodes[i].origin)) {
          nodesArr.push(nodes[i].origin);
          colorsArr.push(nodes[i].originColor);
        }
        if (!nodesArr.includes(nodes[i].destination)) {
          nodesArr.push(nodes[i].destination);
          colorsArr.push(nodes[i].destinationColor);
        }
        if (i === nodes.length - 1) {
          setUpdating(false);
        }
      } else {
        const order = [];
        const originOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const originDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        if (originOriginTotal >= originDestinationTotal) {
          order.push({ name: "origin", total: originOriginTotal });
        } else {
          order.push({ name: "origin", total: originDestinationTotal });
        }
        if (destinationOriginTotal >= destinationDestinationTotal) {
          order.push({ name: "destination", total: destinationOriginTotal });
        } else {
          order.push({
            name: "destination",
            total: destinationDestinationTotal,
          });
        }
        arr.push([
          nodes[i].origin,
          nodes[i].destination,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      order[0].total >= order[1].total
                        ? order[0].total
                        : order[1].total
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
        if (!nodesArr.includes(nodes[i].origin)) {
          nodesArr.push(nodes[i].origin);
          colorsArr.push(nodes[i].originColor);
        }
        if (!nodesArr.includes(nodes[i].destination)) {
          nodesArr.push(nodes[i].destination);
          colorsArr.push(nodes[i].destinationColor);
        }
        if (i === nodes.length - 1) {
          setUpdating(false);
        }
      }
    }
    setData(arr);
    setColors(colorsArr);
  }

  function updateDataWithDollarLabels(nodes) {
    const uniqueOrigins = [...new Set(nodes.map((node) => node.origin))];
    const uniqueDestinations = [
      ...new Set(nodes.map((node) => node.destination)),
    ];
    const arr = [
      [
        { type: "string", label: "Origin" },
        { type: "string", label: "Destination" },
        { type: "number", label: "Amount" },
        { type: "string", role: "tooltip", p: { html: true } },
        { type: "string", label: "originColor" },
        { type: "string", label: "destinationColor" },
      ],
    ];
    for (let i = 0; i < nodes.length; i++) {
      if (
        !uniqueDestinations.includes(nodes[i].origin) &&
        uniqueOrigins.includes(nodes[i].destination)
      ) {
        const total = nodes
          .filter((node) => node.origin === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        arr.push([
          nodes[i].origin + ` ($${total})`,
          nodes[i].destination +
            ` ($${
              destinationOriginTotal >= destinationDestinationTotal
                ? destinationOriginTotal
                : destinationDestinationTotal
            })`,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      destinationOriginTotal >= destinationDestinationTotal
                        ? destinationOriginTotal
                        : destinationDestinationTotal
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
      } else if (
        !uniqueOrigins.includes(nodes[i].destination) &&
        uniqueDestinations.includes(nodes[i].origin)
      ) {
        const total = nodes
          .filter((node) => node.destination === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const originOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const originDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        arr.push([
          nodes[i].origin +
            ` ($${
              originOriginTotal >= originDestinationTotal
                ? originOriginTotal
                : originDestinationTotal
            })`,
          nodes[i].destination + ` ($${total})`,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      originOriginTotal >= originDestinationTotal
                        ? originOriginTotal
                        : originDestinationTotal
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
      } else {
        const order = [];
        const originOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const originDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].origin)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationOriginTotal = nodes
          .filter((node) => node.origin === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        const destinationDestinationTotal = nodes
          .filter((node) => node.destination === nodes[i].destination)
          .reduce((sum, current) => {
            return sum + current.amount;
          }, 0);
        if (originOriginTotal >= originDestinationTotal) {
          order.push({ name: "origin", total: originOriginTotal });
        } else {
          order.push({ name: "origin", total: originDestinationTotal });
        }
        if (destinationOriginTotal >= destinationDestinationTotal) {
          order.push({ name: "destination", total: destinationOriginTotal });
        } else {
          order.push({
            name: "destination",
            total: destinationDestinationTotal,
          });
        }
        arr.push([
          nodes[i].origin +
            ` ($${
              originOriginTotal >= originDestinationTotal
                ? originOriginTotal
                : originDestinationTotal
            })`,
          nodes[i].destination +
            ` ($${
              destinationOriginTotal >= destinationDestinationTotal
                ? destinationOriginTotal
                : destinationDestinationTotal
            })`,
          nodes[i].amount,
          `<div style="padding: 8px; white-space: nowrap;"><strong>${
            nodes[i].origin
          } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
            Math.round(
              100 *
                (100 *
                  (nodes[i].amount /
                    `${
                      order[0].total >= order[1].total
                        ? order[0].total
                        : order[1].total
                    }`))
            ) / 100
          }%</div>`,
          nodes[i].originColor,
          nodes[i].destinationColor,
        ]);
      }
    }
    setDataWithDollarLabels(arr);
  }

  function updateDataWithPercentageLabels(nodes) {
    const uniqueOrigins = [...new Set(nodes.map((node) => node.origin))];
    const uniqueDestinations = [
      ...new Set(nodes.map((node) => node.destination)),
    ];
    const both = uniqueOrigins.filter((node) =>
      uniqueDestinations.includes(node)
    );
    const originsOnly = uniqueOrigins.filter((node) => !both.includes(node));
    const destinationsOnly = uniqueDestinations.filter(
      (node) => !both.includes(node)
    );

    const arr = [
      [
        { type: "string", label: "Origin" },
        { type: "string", label: "Destination" },
        { type: "number", label: "Amount" },
        { type: "string", role: "tooltip", p: { html: true } },
        { type: "string", label: "originColor" },
        { type: "string", label: "destinationColor" },
      ],
    ];
    const totals = [];
    for (let i = 0; i < both.length; i++) {
      const originSums = nodes
        .filter((node) => node.origin === both[i])
        .reduce((sum, current) => sum + current.amount, 0);
      const destinationSums = nodes
        .filter((node) => node.destination === both[i])
        .reduce((sum, current) => sum + current.amount, 0);
      originSums >= destinationSums
        ? totals.push({ name: both[i], total: originSums })
        : totals.push({ name: both[i], total: destinationSums });
    }
    for (let i = 0; i < originsOnly.length; i++) {
      const sum = nodes
        .filter((node) => node.origin === originsOnly[i])
        .reduce((sum, current) => sum + current.amount, 0);
      totals.push({ name: originsOnly[i], total: sum });
    }
    for (let i = 0; i < destinationsOnly.length; i++) {
      const sum = nodes
        .filter((node) => node.destination === destinationsOnly[i])
        .reduce((sum, current) => sum + current.amount, 0);
      totals.push({ name: destinationsOnly[i], total: sum });
    }

    const percentages = [];
    for (let i = 0; i < nodes.length; i++) {
      const origin = totals.filter((total) => total.name === nodes[i].origin)[0]
        .total;
      const destination = totals.filter(
        (total) => total.name === nodes[i].destination
      )[0].total;
      origin === destination
        ? percentages.push(
            {
              name: nodes[i].origin,
              percentage: "100",
            },
            { name: nodes[i].destination, percentage: "100" }
          )
        : origin > destination
        ? percentages.push({
            name: nodes[i].destination,
            percentage: `${
              Math.round(100 * (100 * (destination / origin))) / 100
            }`,
          })
        : percentages.push({
            name: nodes[i].origin,
            percentage: `${
              Math.round(100 * (100 * (origin / destination))) / 100
            }`,
          });
    }
    const highest = totals.reduce((max, current) =>
      current.total > max.total ? current : max
    );
    getSankeyLevels(nodes, highest.name);
    if (!percentages.filter((node) => node.name === highest.name)[0]) {
      percentages.push({ name: highest.name, percentage: "100" });
    }
    for (let i = 0; i < nodes.length; i++) {
      const origin = percentages.filter(
        (node) => node.name === nodes[i].origin
      )[0] || { name: nodes[i].origin, percentage: "0" };
      const destination = percentages.filter(
        (node) => node.name === nodes[i].destination
      )[0] || { name: nodes[i].destination, percentage: "0" };
      const originTotal = totals.filter(
        (node) => node.name === nodes[i].origin
      )[0].total;
      const destinationTotal = totals.filter(
        (node) => node.name === nodes[i].destination
      )[0].total;
      arr.push([
        nodes[i].origin + ` (${origin.percentage}%)`,
        nodes[i].destination + ` (${destination.percentage}%)`,
        nodes[i].amount,
        `<div style="padding: 8px; white-space: nowrap;"><strong>${
          nodes[i].origin
        } ➜ ${nodes[i].destination}</strong><br />$${nodes[i].amount}<br />${
          originTotal === destinationTotal
            ? "100%"
            : originTotal > destinationTotal
            ? `${destination.percentage}%`
            : `${origin.percentage}%`
        }</div>`,
        nodes[i].originColor,
        nodes[i].destinationColor,
      ]);
      setDataWithPercentageLabels(arr);
    }
  }

  function updateEditVariables(nodes) {
    const arr = [];
    for (let i = 0; i < nodes.length; i++) {
      arr.push({
        id: nodes[i].id,
        origin: nodes[i].origin,
        originColor: nodes[i].originColor,
        destination: nodes[i].destination,
        destinationColor: nodes[i].destinationColor,
        amount: nodes[i].amount,
      });
    }
    setEditedNode(arr);
    setOriginalNode(arr);
  }

  const options = {
    tooltip: { isHtml: true },
    height: 50 * data.length,
    width: chartWidth < 400 * levels ? 400 * levels : "auto",
    sankey: {
      node: {
        colors,
        label: {
          fontName: "Inter",
          fontSize,
          color: newColors.font ? newColors.font : "#000000",
          bold: true,
        },
        interactivity: true,
        labelPadding: 16,
        nodePadding: 32,
        width: 8,
      },
      link: {
        color: {
          fill: newColors.links ? newColors.links : "#FFDDE1",
        },
      },
    },
  };

  function generateRandomHexColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  return (
    <>
      {!updating && (
        <div id="sankey-container">
          <div className="top">
            {!editing && (
              <div className="details">
                <div className="left">
                  <h1 className="title">{props.project.title}</h1>
                  {props.project.description ? (
                    <span className="description">
                      {props.project.description.slice(0, 500)}
                    </span>
                  ) : (
                    <span className="no-description">
                      No description added.
                    </span>
                  )}
                </div>
                <button
                  className="right"
                  onClick={() => {
                    setNewTitle(props.project.title);
                    setNewDescription(props.project.description);
                    setEditing(true);
                  }}
                  type="button"
                >
                  <img src={edit} alt="edit project details" />
                </button>
              </div>
            )}
            {editing && (
              <form
                className="editing-details"
                aria-label="edit project details form"
                onSubmit={(e) => {
                  e.preventDefault();
                  props.updateProject("rename", newTitle, newDescription);
                  setEditing(false);
                }}
              >
                <div className="left">
                  <label id="project-title-label">Project Title:</label>
                  <input
                    placeholder="Enter a title"
                    value={newTitle}
                    aria-labelledby="project-title-label"
                    maxLength="50"
                    onChange={(e) => {
                      setNewTitle(() => e.target.value);
                    }}
                  />
                  <label id="project-description-label">
                    Project Description:
                  </label>
                  <textarea
                    placeholder="Enter a description (optional)"
                    value={newDescription}
                    aria-labelledby="project-description-label"
                    onChange={(e) => {
                      setNewDescription(() => e.target.value);
                    }}
                    maxLength="500"
                  />
                  <div className="buttons" role="group">
                    <button type="button" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit">Update</button>
                  </div>
                </div>
              </form>
            )}
          </div>
          <div id="control-panel">
            <div className="left">
              <h2>Edit nodes:</h2>
              {nodes.length > 0 && (
                <div className="existing">
                  <table>
                    <tbody>
                      <tr>
                        <th></th>
                        <th className="origin">ORIGIN</th>
                        <th></th>
                        <th className="destination">DESTINATION</th>
                        <th className="amount">AMOUNT ($)</th>
                        <th></th>
                      </tr>
                      {nodes.length > 0 &&
                        nodes.map((node, i) => (
                          <tr key={i}>
                            <td>
                              <div
                                className="color-dot edit"
                                style={
                                  editingNode === node.id
                                    ? editNodeColor.num === i &&
                                      editNodeColor.newOriginColor
                                      ? {
                                          backgroundColor: `${editNodeColor.newOriginColor}`,
                                          cursor: "pointer",
                                        }
                                      : {
                                          backgroundColor: `${node.originColor}`,
                                          cursor: "pointer",
                                        }
                                    : { backgroundColor: `${node.originColor}` }
                                }
                                onClick={() => {
                                  if (
                                    editingNode === node.id &&
                                    editNodeColor.editing !== "origin"
                                  ) {
                                    setEditNodeColor((prev) => ({
                                      ...prev,
                                      editing: "origin",
                                    }));
                                  } else if (
                                    editingNode === node.id &&
                                    editNodeColor.editing === "origin"
                                  ) {
                                    setEditNodeColor((prev) => ({
                                      ...prev,
                                      editing: false,
                                    }));
                                  }
                                }}
                              ></div>
                              {editNodeColor.num === i &&
                                editNodeColor.editing === "origin" && (
                                  <div
                                    className="node-color-picker"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <HexColorPicker
                                      color={editNodeColor.newOriginColor}
                                      onChange={(color) =>
                                        setEditNodeColor((prev) => ({
                                          ...prev,
                                          newOriginColor: color,
                                        }))
                                      }
                                    />
                                    <HexColorInput
                                      color={editNodeColor.newOriginColor}
                                      onChange={(color) =>
                                        setEditNodeColor((prev) => ({
                                          ...prev,
                                          newOriginColor: color,
                                        }))
                                      }
                                    />
                                    <div className="buttons">
                                      <button
                                        onClick={() => {
                                          const oldColor =
                                            editNodeColor.oldOriginColor;
                                          setEditNodeColor((prev) => ({
                                            ...prev,
                                            newOriginColor: oldColor,
                                            editing: false,
                                          }));
                                          setEditedNode((prev) =>
                                            prev.map((edit) =>
                                              edit.id === node.id
                                                ? {
                                                    ...edit,
                                                    originColor:
                                                      node.originColor,
                                                  }
                                                : edit
                                            )
                                          );
                                        }}
                                        className="cancel"
                                        type="button"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          const newColor =
                                            editNodeColor.newOriginColor;
                                          setEditNodeColor((prev) => ({
                                            ...prev,
                                            oldOriginColor: newColor,
                                            editing: false,
                                          }));
                                          setEditedNode((prev) =>
                                            prev.map((edit) =>
                                              edit.id === node.id
                                                ? {
                                                    ...edit,
                                                    originColor: newColor,
                                                  }
                                                : edit
                                            )
                                          );
                                        }}
                                        className="ok"
                                        type="button"
                                      >
                                        OK
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </td>
                            {editingNode !== node.id && (
                              <td className="origin">{node.origin}</td>
                            )}
                            {editingNode === node.id && (
                              <td className="origin">
                                <input
                                  maxLength="20"
                                  aria-label="new origin name"
                                  value={editedNode
                                    .filter((edit) => edit.id === node.id)[0]
                                    .origin.toUpperCase()}
                                  onChange={(e) => {
                                    setEditedNode((prev) =>
                                      prev.map((edit) =>
                                        edit.id === node.id
                                          ? {
                                              ...edit,
                                              origin:
                                                e.target.value.toUpperCase(),
                                            }
                                          : edit
                                      )
                                    );
                                  }}
                                />
                              </td>
                            )}
                            <td>
                              <div
                                className="color-dot edit"
                                style={
                                  editingNode === node.id
                                    ? editNodeColor.num === i &&
                                      editNodeColor.newDestinationColor
                                      ? {
                                          backgroundColor: `${editNodeColor.newDestinationColor}`,
                                          cursor: "pointer",
                                        }
                                      : {
                                          backgroundColor: `${node.destinationColor}`,
                                          cursor: "pointer",
                                        }
                                    : {
                                        backgroundColor: `${node.destinationColor}`,
                                      }
                                }
                                onClick={() => {
                                  if (
                                    editingNode === node.id &&
                                    editNodeColor.editing !== "destination"
                                  ) {
                                    setEditNodeColor((prev) => ({
                                      ...prev,
                                      editing: "destination",
                                    }));
                                  } else if (
                                    editingNode === node.id &&
                                    editNodeColor.editing === "destination"
                                  ) {
                                    setEditNodeColor((prev) => ({
                                      ...prev,
                                      editing: false,
                                    }));
                                  }
                                }}
                              ></div>
                              {editNodeColor.num === i &&
                                editNodeColor.editing === "destination" && (
                                  <div
                                    className="node-color-picker"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <HexColorPicker
                                      color={editNodeColor.newDestinationColor}
                                      onChange={(color) =>
                                        setEditNodeColor((prev) => ({
                                          ...prev,
                                          newDestinationColor: color,
                                        }))
                                      }
                                    />
                                    <HexColorInput
                                      color={editNodeColor.newDestinationColor}
                                      onChange={(color) =>
                                        setEditNodeColor((prev) => ({
                                          ...prev,
                                          newDestinationColor: color,
                                        }))
                                      }
                                    />
                                    <div className="buttons">
                                      <button
                                        onClick={() => {
                                          const oldColor =
                                            editNodeColor.oldDestinationColor;
                                          setEditNodeColor((prev) => ({
                                            ...prev,
                                            newDestinationColor: oldColor,
                                            editing: false,
                                          }));
                                          setEditedNode((prev) =>
                                            prev.map((edit) =>
                                              edit.id === node.id
                                                ? {
                                                    ...edit,
                                                    destinationColor:
                                                      node.destinationColor,
                                                  }
                                                : edit
                                            )
                                          );
                                        }}
                                        className="cancel"
                                        type="button"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          const newColor =
                                            editNodeColor.newDestinationColor;
                                          setEditNodeColor((prev) => ({
                                            ...prev,
                                            oldDestinationColor: newColor,
                                            editing: false,
                                          }));
                                          setEditedNode((prev) =>
                                            prev.map((edit) =>
                                              edit.id === node.id
                                                ? {
                                                    ...edit,
                                                    destinationColor: newColor,
                                                  }
                                                : edit
                                            )
                                          );
                                        }}
                                        className="ok"
                                        type="button"
                                      >
                                        OK
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </td>
                            {editingNode !== node.id && (
                              <td className="destination">
                                {node.destination}
                              </td>
                            )}
                            {editingNode === node.id && (
                              <td className="destination">
                                <input
                                  maxLength="20"
                                  aria-label="new destination name"
                                  value={editedNode
                                    .filter((edit) => edit.id === node.id)[0]
                                    .destination.toUpperCase()}
                                  onChange={(e) => {
                                    setEditedNode((prev) =>
                                      prev.map((edit) =>
                                        edit.id === node.id
                                          ? {
                                              ...edit,
                                              destination:
                                                e.target.value.toUpperCase(),
                                            }
                                          : edit
                                      )
                                    );
                                  }}
                                />
                              </td>
                            )}
                            {editingNode !== node.id && (
                              <td className="amount">{node.amount}</td>
                            )}
                            {editingNode === node.id && (
                              <td className="amount">
                                <input
                                  aria-label="new amount"
                                  min="0.00"
                                  max="999999999"
                                  type="number"
                                  value={
                                    editedNode.filter(
                                      (edit) => edit.id === node.id
                                    )[0].amount
                                  }
                                  onChange={(e) => {
                                    if (e.target.value.length <= 9) {
                                      setEditedNode((prev) =>
                                        prev.map((edit) =>
                                          edit.id === node.id
                                            ? {
                                                ...edit,
                                                amount: Number(e.target.value),
                                              }
                                            : edit
                                        )
                                      );
                                    }
                                  }}
                                />
                              </td>
                            )}
                            <td>
                              {editingNode !== node.id && (
                                <button
                                  onClick={() => {
                                    setEditingNode(node.id);
                                    setEditNodeColor({
                                      num: i,
                                      oldOriginColor: node.originColor,
                                      newOriginColor: node.originColor,
                                      oldDestinationColor:
                                        node.destinationColor,
                                      newDestinationColor:
                                        node.destinationColor,
                                      editing: false,
                                    });
                                  }}
                                  type="button"
                                >
                                  <img src={edit} alt="edit node" />
                                </button>
                              )}
                              {editingNode === node.id && (
                                <div className="editing">
                                  <button
                                    onClick={() => {
                                      setEditingNode("");
                                      setEditedNode((prev) =>
                                        prev.map((edit) =>
                                          edit.id === node.id
                                            ? originalNode.filter(
                                                (original) =>
                                                  original.id === node.id
                                              )[0]
                                            : edit
                                        )
                                      );
                                      setEditNodeColor({});
                                    }}
                                    type="button"
                                  >
                                    <img src={cancel} alt="quit editing" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        editedNode
                                          .filter(
                                            (edit) => edit.id === node.id
                                          )[0]
                                          .origin.trim() !==
                                        editedNode
                                          .filter(
                                            (edit) => edit.id === node.id
                                          )[0]
                                          .destination.trim()
                                      ) {
                                        updateSankeyNode(node.id);
                                      } else {
                                        alert(
                                          "The origin and destination cannot be the same."
                                        );
                                      }
                                    }}
                                    type="button"
                                  >
                                    <img src={confirm} alt="update node" />
                                  </button>
                                </div>
                              )}
                              {editingNode !== node.id && (
                                <button
                                  onClick={() => {
                                    if (!deletingNode)
                                      deleteSankeyNode(node.id);
                                  }}
                                  type="button"
                                >
                                  <img src={remove} alt="delete node" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!nodes.length && <span className="no-nodes">No nodes.</span>}
              <h2>Add a node:</h2>
              <div className="add">
                <div className="left">
                  <div className="origin">
                    <div
                      className="color-dot"
                      style={
                        [
                          ...new Set(
                            nodes.flatMap(({ origin, destination }) => [
                              origin,
                              destination,
                            ])
                          ),
                        ]
                          .sort()
                          .filter(
                            (node) =>
                              node.localeCompare(
                                addNode.origin.trim(),
                                undefined,
                                {
                                  sensitivity: "base",
                                }
                              ) === 0
                          )[0]
                          ? nodes.filter(
                              (node) =>
                                node.origin.localeCompare(
                                  addNode.origin.trim(),
                                  undefined,
                                  { sensitivity: "base" }
                                ) === 0
                            )[0]
                            ? {
                                backgroundColor: nodes.filter(
                                  (node) =>
                                    node.origin.localeCompare(
                                      addNode.origin.trim(),
                                      undefined,
                                      { sensitivity: "base" }
                                    ) === 0
                                )[0].originColor,
                                cursor: "not-allowed",
                              }
                            : {
                                backgroundColor: nodes.filter(
                                  (node) =>
                                    node.destination.localeCompare(
                                      addNode.origin.trim(),
                                      undefined,
                                      { sensitivity: "base" }
                                    ) === 0
                                )[0].destinationColor,
                                cursor: "not-allowed",
                              }
                          : newColors.origin
                          ? {
                              backgroundColor: `${newColors.origin}`,
                              cursor: "pointer",
                            }
                          : {
                              background:
                                "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                              cursor: "pointer",
                            }
                      }
                      onClick={() => {
                        const existing =
                          nodes.filter(
                            (node) =>
                              node.origin.localeCompare(
                                addNode.origin.trim(),
                                undefined,
                                { sensitivity: "base" }
                              ) === 0
                          )[0] ||
                          nodes.filter(
                            (node) =>
                              node.destination.localeCompare(
                                addNode.origin.trim(),
                                undefined,
                                { sensitivity: "base" }
                              ) === 0
                          )[0];
                        if (!colorPicker.origin && !existing) {
                          setColorPicker((prev) => ({
                            ...prev,
                            origin: true,
                            destination: false,
                          }));
                        } else if (colorPicker.origin) {
                          setColorPicker((prev) => ({
                            ...prev,
                            origin: false,
                          }));
                        }
                      }}
                    >
                      {colorPicker.origin && (
                        <div
                          className="color-picker"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <HexColorPicker
                            color={oldColors.origin}
                            onChange={(color) =>
                              setNewColors((prev) => ({
                                ...prev,
                                origin: color,
                              }))
                            }
                          />
                          <HexColorInput
                            color={newColors.origin}
                            onChange={(color) =>
                              setNewColors((prev) => ({
                                ...prev,
                                origin: color,
                              }))
                            }
                          />
                          <div className="buttons">
                            <button
                              onClick={() => {
                                setColorPicker((prev) => ({
                                  ...prev,
                                  origin: false,
                                }));
                                setNewColors((prev) => ({
                                  ...prev,
                                  origin: oldColors.origin,
                                }));
                              }}
                              className="cancel"
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setColorPicker((prev) => ({
                                  ...prev,
                                  origin: false,
                                }));
                                setOldColors((prev) => ({
                                  ...prev,
                                  origin: newColors.origin,
                                }));
                              }}
                              className="ok"
                              type="button"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="input">
                      <input
                        placeholder="Origin (e.g., Wages)"
                        type="text"
                        value={addNode.origin.toUpperCase()}
                        maxLength="20"
                        aria-label="origin name"
                        ref={clickAwayRef}
                        onChange={(e) => {
                          setColorPicker((prev) => ({
                            ...prev,
                            origin: false,
                          }));
                          setSearching((prev) => ({
                            ...prev,
                            origin: true,
                          }));
                          setAddNode((prev) => ({
                            ...prev,
                            origin: e.target.value,
                          }));
                        }}
                      />
                      {searching.origin &&
                        addNode.origin.trim().length > 0 &&
                        nodes.length > 0 && (
                          <ul ref={clickAwayRef}>
                            {[
                              ...new Set(
                                nodes.flatMap(({ origin, destination }) => [
                                  origin,
                                  destination,
                                ])
                              ),
                            ]
                              .sort()
                              .filter(
                                (node) =>
                                  node
                                    .toLowerCase()
                                    .includes(addNode.origin.toLowerCase()) &&
                                  node.toLowerCase() !==
                                    addNode.origin.toLowerCase()
                              )
                              .map((node, index) => (
                                <li
                                  key={index}
                                  onClick={() => {
                                    setSearching((prev) => ({
                                      ...prev,
                                      origin: false,
                                    }));
                                    setAddNode((prev) => ({
                                      ...prev,
                                      origin: node,
                                    }));
                                    setOldColors((prev) => ({ ...prev }));
                                  }}
                                >
                                  {node}
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  </div>

                  <div className="destination">
                    <div
                      className="color-dot"
                      style={
                        [
                          ...new Set(
                            nodes.flatMap(({ origin, destination }) => [
                              origin,
                              destination,
                            ])
                          ),
                        ]
                          .sort()
                          .filter(
                            (node) =>
                              node.localeCompare(
                                addNode.destination.trim(),
                                undefined,
                                { sensitivity: "base" }
                              ) === 0
                          )[0]
                          ? nodes.filter(
                              (node) =>
                                node.origin.localeCompare(
                                  addNode.destination.trim(),
                                  undefined,
                                  { sensitivity: "base" }
                                ) === 0
                            )[0]
                            ? {
                                backgroundColor: nodes.filter(
                                  (node) =>
                                    node.origin.localeCompare(
                                      addNode.destination.trim(),
                                      undefined,
                                      { sensitivity: "base" }
                                    ) === 0
                                )[0].originColor,
                                cursor: "not-allowed",
                              }
                            : {
                                backgroundColor: nodes.filter(
                                  (node) =>
                                    node.destination.localeCompare(
                                      addNode.destination.trim(),
                                      undefined,
                                      { sensitivity: "base" }
                                    ) === 0
                                )[0].destinationColor,
                                cursor: "not-allowed",
                              }
                          : newColors.destination
                          ? {
                              backgroundColor: `${newColors.destination}`,
                              cursor: "pointer",
                            }
                          : {
                              background:
                                "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                              cursor: "pointer",
                            }
                      }
                      onClick={() => {
                        const existing =
                          nodes.filter(
                            (node) =>
                              node.origin.localeCompare(
                                addNode.destination.trim(),
                                undefined,
                                { sensitivity: "base" }
                              ) === 0
                          )[0] ||
                          nodes.filter(
                            (node) =>
                              node.destination.localeCompare(
                                addNode.destination.trim(),
                                undefined,
                                { sensitivity: "base" }
                              ) === 0
                          )[0];
                        if (!colorPicker.destination && !existing) {
                          setColorPicker((prev) => ({
                            ...prev,
                            destination: true,
                            origin: false,
                          }));
                        } else if (colorPicker.destination) {
                          setColorPicker((prev) => ({
                            ...prev,
                            destination: false,
                          }));
                        }
                      }}
                    >
                      {colorPicker.destination && (
                        <div
                          className="color-picker"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <HexColorPicker
                            color={oldColors.destination}
                            onChange={(color) =>
                              setNewColors((prev) => ({
                                ...prev,
                                destination: color,
                              }))
                            }
                          />
                          <HexColorInput
                            color={newColors.destination}
                            onChange={(color) =>
                              setNewColors((prev) => ({
                                ...prev,
                                destination: color,
                              }))
                            }
                          />
                          <div className="buttons">
                            <button
                              onClick={() => {
                                setColorPicker((prev) => ({
                                  ...prev,
                                  destination: false,
                                }));
                                setNewColors((prev) => ({
                                  ...prev,
                                  destination: oldColors.destination,
                                }));
                              }}
                              className="cancel"
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setColorPicker((prev) => ({
                                  ...prev,
                                  destination: false,
                                }));
                                setOldColors((prev) => ({
                                  ...prev,
                                  destination: newColors.destination,
                                }));
                              }}
                              className="ok"
                              type="button"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="input">
                      <input
                        type="text"
                        placeholder="Destination (e.g., Total income)"
                        value={addNode.destination.toUpperCase()}
                        maxLength="20"
                        aria-label="destination name"
                        ref={clickAwayRef}
                        onChange={(e) => {
                          setColorPicker((prev) => ({
                            ...prev,
                            destination: false,
                          }));
                          setSearching((prev) => ({
                            ...prev,
                            destination: true,
                          }));
                          setAddNode((prev) => ({
                            ...prev,
                            destination: e.target.value,
                          }));
                          if (
                            [
                              ...new Set(
                                nodes.flatMap(({ origin, destination }) => [
                                  origin,
                                  destination,
                                ])
                              ),
                            ]
                              .sort()
                              .filter(
                                (node) =>
                                  node.localeCompare(
                                    e.target.value.trim(),
                                    undefined,
                                    { sensitivity: "base" }
                                  ) === 0
                              )[0]
                          ) {
                            const origin = nodes.filter(
                              (node) =>
                                node.origin.localeCompare(
                                  e.target.value.trim(),
                                  undefined,
                                  { sensitivity: "base" }
                                ) === 0
                            )[0];
                            const destination = nodes.filter(
                              (node) =>
                                node.destination.localeCompare(
                                  e.target.value.trim(),
                                  undefined,
                                  { sensitivity: "base" }
                                ) === 0
                            )[0];
                            if (origin) {
                              setOldColors((prev) => ({
                                ...prev,
                                destination: origin.originColor,
                              }));
                            } else if (destination) {
                              setOldColors((prev) => ({
                                ...prev,
                                destination: destination.destinationColor,
                              }));
                            }
                          } else {
                            setOldColors((prev) => ({
                              ...prev,
                              destination: "",
                            }));
                          }
                        }}
                      />
                      {searching.destination &&
                        addNode.destination.trim().length > 0 &&
                        nodes.length > 0 && (
                          <ul ref={clickAwayRef}>
                            {[
                              ...new Set(
                                nodes.flatMap(({ origin, destination }) => [
                                  origin,
                                  destination,
                                ])
                              ),
                            ]
                              .sort()
                              .filter(
                                (node) =>
                                  node
                                    .toLowerCase()
                                    .includes(
                                      addNode.destination.toLowerCase()
                                    ) &&
                                  node.toLowerCase() !==
                                    addNode.destination.toLowerCase()
                              )
                              .map((node, index) => (
                                <li
                                  key={index}
                                  onClick={() => {
                                    setSearching((prev) => ({
                                      ...prev,
                                      destination: false,
                                    }));
                                    setAddNode((prev) => ({
                                      ...prev,
                                      destination: node,
                                    }));
                                  }}
                                >
                                  {node}
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  </div>
                </div>
                <div className="amount">
                  <input
                    placeholder="Amount (e.g., 50000)"
                    type="number"
                    value={addNode.amount}
                    min="0.00"
                    max="999999999"
                    aria-label="amount"
                    onChange={(e) => {
                      if (e.target.value.length <= 9) {
                        setAddNode((prev) => ({
                          ...prev,
                          amount: Number(e.target.value),
                        }));
                      }
                    }}
                  />
                </div>
                <div
                  className={
                    addNode.origin && addNode.destination && addNode.amount > 0
                      ? "button valid"
                      : "button invalid"
                  }
                >
                  <button
                    onClick={
                      addNode.origin &&
                      addNode.destination &&
                      addNode.amount > 0
                        ? () => addSankeyNode()
                        : null
                    }
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          {!updating && (
            <div id="chart-buttons">
              <div className="left">
                <div>
                  <span>Background:</span>
                  <div
                    className="color-dot"
                    style={{ backgroundColor: `${newColors.background}` }}
                    onClick={() => {
                      if (!colorPicker.background) {
                        setColorPicker((prev) => ({
                          ...prev,
                          background: true,
                          links: false,
                          font: false,
                        }));
                      } else {
                        setColorPicker((prev) => ({
                          ...prev,
                          background: false,
                        }));
                      }
                    }}
                  >
                    {colorPicker.background && (
                      <div
                        className="color-picker"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <HexColorPicker
                          color={oldColors.background}
                          onChange={(color) =>
                            setNewColors((prev) => ({
                              ...prev,
                              background: color,
                            }))
                          }
                        />
                        <HexColorInput
                          color={newColors.background}
                          onChange={(color) =>
                            setNewColors((prev) => ({
                              ...prev,
                              background: color,
                            }))
                          }
                        />
                        <div className="buttons">
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                background: false,
                              }));
                              setNewColors((prev) => ({
                                ...prev,
                                background: oldColors.background,
                              }));
                            }}
                            className="cancel"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                background: false,
                              }));
                              setOldColors((prev) => ({
                                ...prev,
                                background: newColors.background,
                              }));
                            }}
                            className="ok"
                            type="button"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span>Links:</span>
                  <div
                    className="color-dot"
                    style={{ backgroundColor: `${newColors.links}` }}
                    onClick={() => {
                      if (!colorPicker.links) {
                        setColorPicker((prev) => ({
                          ...prev,
                          links: true,
                          background: false,
                          font: false,
                        }));
                      } else {
                        setColorPicker((prev) => ({
                          ...prev,
                          links: false,
                        }));
                      }
                    }}
                  >
                    {colorPicker.links && (
                      <div
                        className="color-picker"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <HexColorPicker
                          color={oldColors.links}
                          onChange={(color) =>
                            setNewColors((prev) => ({ ...prev, links: color }))
                          }
                        />
                        <HexColorInput
                          color={newColors.links}
                          onChange={(color) =>
                            setNewColors((prev) => ({ ...prev, links: color }))
                          }
                        />
                        <div className="buttons">
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                links: false,
                              }));
                              setNewColors((prev) => ({
                                ...prev,
                                links: oldColors.links,
                              }));
                            }}
                            className="cancel"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                links: false,
                              }));
                              setOldColors((prev) => ({
                                ...prev,
                                links: newColors.links,
                              }));
                            }}
                            className="ok"
                            type="button"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span>Font:</span>
                  <div
                    className="color-dot"
                    style={{ backgroundColor: `${newColors.font}` }}
                    onClick={() => {
                      if (!colorPicker.font) {
                        setColorPicker((prev) => ({
                          ...prev,
                          font: true,
                          background: false,
                          links: false,
                        }));
                      } else {
                        setColorPicker((prev) => ({
                          ...prev,
                          font: false,
                        }));
                      }
                    }}
                  >
                    {colorPicker.font && (
                      <div
                        className="color-picker"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <HexColorPicker
                          color={oldColors.font}
                          onChange={(color) =>
                            setNewColors((prev) => ({ ...prev, font: color }))
                          }
                        />
                        <HexColorInput
                          color={newColors.font}
                          onChange={(color) =>
                            setNewColors((prev) => ({ ...prev, font: color }))
                          }
                        />
                        <div className="buttons">
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                font: false,
                              }));
                              setNewColors((prev) => ({
                                ...prev,
                                font: oldColors.font,
                              }));
                            }}
                            className="cancel"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setColorPicker((prev) => ({
                                ...prev,
                                font: false,
                              }));
                              setOldColors((prev) => ({
                                ...prev,
                                font: newColors.font,
                              }));
                            }}
                            className="ok"
                            type="button"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="middle">
                <label>
                  Font size: {fontSize}px
                  <input
                    type="range"
                    min="8"
                    max="96"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                    }}
                  />
                </label>
              </div>
              <div className="right">
                <div className="display">
                  <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value)}
                  >
                    <option value="No labels">Names only</option>
                    <option value="Dollars">Names + dollars</option>
                    <option value="Percentages">Names + percentages</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {(oldColors.background !== chart.backgroundColor ||
            oldColors.links !== chart.sankeyLinkColor ||
            oldColors.font !== chart.fontColor ||
            Number(fontSize) !== chart.fontSize ||
            displayMode !== chart.displayMode) && (
            <div id="update-chart">
              <button onClick={updateChart} type="button">
                Update
              </button>
            </div>
          )}
          {!updating && (
            <div
              id="chart"
              style={{ backgroundColor: newColors.background }}
              ref={ref}
            >
              <div className="title" style={{ color: newColors.font }}>
                {props.project.title}
              </div>
              {nodes.length ? (
                <Chart
                  chartType="Sankey"
                  data={
                    displayMode === "No labels"
                      ? data
                      : displayMode === "Dollars"
                      ? dataWithDollarLabels
                      : dataWithPercentageLabels
                  }
                  options={options}
                />
              ) : (
                <span className="no-data">
                  There is currently no data to display.
                </span>
              )}
            </div>
          )}
          <div id="download">
            <form
              aria-label="download chart form"
              onSubmit={(e) => {
                e.preventDefault();
                if (nodes.length) {
                  downloadChart();
                } else {
                  alert("There is nothing to download!");
                }
              }}
            >
              <div className="inputs">
                <label htmlFor="width">Width (px):</label>
                <input
                  id="width"
                  placeholder="Optional"
                  type="number"
                  name="width"
                  min="0"
                  max="7680"
                  step="1"
                  value={width ? width : ""}
                  aria-label="width in pixels"
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
                <label htmlFor="height">Height (px):</label>
                <input
                  id="height"
                  placeholder="Optional"
                  type="number"
                  name="height"
                  min="0"
                  max="4320"
                  step="1"
                  value={height ? height : ""}
                  aria-label="height in pixels"
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
              <button type="submit">
                <img src={download} alt="" />
                Download as PNG
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sankey;
