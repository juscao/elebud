import { prisma } from "../index.js";

const getSankey = async (req, res) => {
  const { projectId } = req.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });
  const chart = await prisma.chart.findFirst({
    where: {
      projectId: project.id,
    },
  });
  if (chart) {
    const nodes = await prisma.sankeyNode.findMany({
      where: { chartId: chart.id },
      orderBy: {
        amount: "desc",
      },
    });

    res.send({ chart, nodes });
  } else if (project.type === "SANKEY" && !chart) {
    const chart = await prisma.chart.create({
      data: {
        projectId: project.id,
      },
    });
    const createNodes = await prisma.sankeyNode.createMany({
      data: [
        {
          chartId: chart.id,
          originColor: "#1E88E5",
          destinationColor: "#8E24AA",
          origin: "JOB 1",
          destination: "WAGES",
          amount: 30000,
        },
        {
          chartId: chart.id,
          originColor: "#43A047",
          destinationColor: "#1E88E5",
          origin: "OVERTIME",
          destination: "JOB 1",
          amount: 6000,
        },
        {
          chartId: chart.id,
          originColor: "#FDD835",
          destinationColor: "#1E88E5",
          origin: "FULL-TIME",
          destination: "JOB 1",
          amount: 24000,
        },
        {
          chartId: chart.id,
          originColor: "#E53935",
          destinationColor: "#8E24AA",
          origin: "JOB 2",
          destination: "WAGES",
          amount: 24000,
        },
        {
          chartId: chart.id,
          originColor: "#8E24AA",
          destinationColor: "#D3D3D3",
          origin: "WAGES",
          destination: "TOTAL INCOME",
          amount: 54000,
        },
        {
          chartId: chart.id,
          originColor: "#6D4C41",
          destinationColor: "#D3D3D3",
          origin: "INTEREST",
          destination: "TOTAL INCOME",
          amount: 600,
        },
        {
          chartId: chart.id,
          originColor: "#F4511E",
          destinationColor: "#D3D3D3",
          origin: "DIVIDENDS",
          destination: "TOTAL INCOME",
          amount: 1200,
        },
        {
          chartId: chart.id,
          originColor: "#D3D3D3",
          destinationColor: "#00ACC1",
          origin: "TOTAL INCOME",
          destination: "RENT",
          amount: 24000,
        },
        {
          chartId: chart.id,
          originColor: "#D3D3D3",
          destinationColor: "#3949AB",
          origin: "TOTAL INCOME",
          destination: "FOOD",
          amount: 6000,
        },
        {
          chartId: chart.id,
          originColor: "#D3D3D3",
          destinationColor: "#C0CA33",
          origin: "TOTAL INCOME",
          destination: "BILLS",
          amount: 4500,
        },
        {
          chartId: chart.id,
          originColor: "#D3D3D3",
          destinationColor: "#FBC02D",
          origin: "TOTAL INCOME",
          destination: "SAVINGS",
          amount: 21300,
        },
        {
          chartId: chart.id,
          originColor: "#FBC02D",
          destinationColor: "#4CAF50",
          origin: "SAVINGS",
          destination: "INVESTMENTS",
          amount: 12300,
        },
        {
          chartId: chart.id,
          originColor: "#FBC02D",
          destinationColor: "#009688",
          origin: "SAVINGS",
          destination: "CASH",
          amount: 9000,
        },
      ],
    });

    const nodes = await prisma.sankeyNode.findMany({
      where: {
        chartId: chart.id,
      },
      orderBy: {
        amount: "desc",
      },
    });

    return res.send({ chart, nodes });
  }
};

const updateSankey = async (req, res) => {
  const { backgroundColor, linksColor, fontColor, fontSize, displayMode } =
    req.body;
  const { projectId } = req.params;

  const chart = await prisma.chart.findFirst({
    where: {
      projectId,
    },
  });
  if (chart) {
    const updateChart = await prisma.chart.update({
      where: {
        id: chart.id,
      },
      data: {
        backgroundColor,
        sankeyLinkColor: linksColor,
        fontColor,
        fontSize,
        displayMode,
      },
    });
    const updateProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    return res.send(updateChart);
  } else {
    res.status(400).json({ message: "Chart could not be found." });
  }
};

const addSankeyNode = async (req, res) => {
  const {
    chartId,
    originColor,
    destinationColor,
    origin,
    destination,
    amount,
    type,
  } = req.body;
  const chart = await prisma.chart.findUnique({
    where: {
      id: chartId,
    },
  });
  const add = await prisma.sankeyNode.create({
    data: {
      chartId,
      originColor,
      destinationColor,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      amount,
    },
  });
  const nodes = await prisma.sankeyNode.findMany({
    where: {
      chartId,
    },
    orderBy: {
      amount: "desc",
    },
  });
  const updateProject = await prisma.project.update({
    where: {
      id: chart.projectId,
    },
    data: {
      updatedAt: new Date(),
    },
  });
  return res.send({ add, nodes });
};

const updateSankeyNode = async (req, res) => {
  const { nodeId } = req.params;
  const { originColor, destinationColor, origin, destination, amount } =
    req.body;
  const node = await prisma.sankeyNode.update({
    where: {
      id: nodeId,
    },
    data: {
      origin,
      originColor,
      destination,
      destinationColor,
      amount,
    },
  });
  const chart = await prisma.chart.findUnique({
    where: {
      id: node.chartId,
    },
  });
  const updateOrigins =
    (await prisma.sankeyNode.updateMany({
      where: {
        chartId: node.chartId,
        origin: node.origin,
      },
      data: {
        originColor,
      },
    })) &&
    (await prisma.sankeyNode.updateMany({
      where: {
        chartId: node.chartId,
        origin: node.destination,
      },
      data: {
        originColor: destinationColor,
      },
    }));
  const updateDestinations =
    (await prisma.sankeyNode.updateMany({
      where: {
        chartId: node.chartId,
        destination: node.origin,
      },
      data: {
        destinationColor: originColor,
      },
    })) &&
    (await prisma.sankeyNode.updateMany({
      where: {
        chartId: node.chartId,
        destination: node.destination,
      },
      data: {
        destinationColor,
      },
    }));
  const allNodes = await prisma.sankeyNode.findMany({
    where: {
      chartId: node.chartId,
    },
    orderBy: {
      amount: "desc",
    },
  });
  const updateProject = await prisma.project.update({
    where: {
      id: chart.projectId,
    },
    data: {
      updatedAt: new Date(),
    },
  });
  return res.send({ allNodes });
};

const deleteSankeyNode = async (req, res) => {
  const { nodeId } = req.params;
  const node = await prisma.sankeyNode.findFirst({
    where: {
      id: nodeId,
    },
  });
  const chart = await prisma.chart.findUnique({
    where: {
      id: node.chartId,
    },
  });
  const remove = await prisma.sankeyNode.delete({
    where: {
      id: nodeId,
    },
  });
  const allNodes = await prisma.sankeyNode.findMany({
    where: {
      chartId: node.chartId,
    },
    orderBy: {
      amount: "desc",
    },
  });
  const updateProject = await prisma.project.update({
    where: {
      id: chart.projectId,
    },
    data: {
      updatedAt: new Date(),
    },
  });
  return res.send({ allNodes });
};

export default {
  getSankey,
  updateSankey,
  addSankeyNode,
  updateSankeyNode,
  deleteSankeyNode,
};
