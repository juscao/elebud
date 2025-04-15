import { prisma } from "../index.js";

const createProject = async (req, res) => {
  const { folderId, title, description, type } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username: req.user,
    },
  });
  if (user) {
    const exists = await prisma.project.findFirst({
      where: {
        userId: user.id,
        folderId,
        title,
        type,
      },
    });
    if (!exists) {
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          folderId,
          title,
          description,
          type,
        },
      });
      const updateFolder = await prisma.folder.update({
        where: { id: folderId },
        data: { updatedAt: new Date() },
      });
      return res.send({ project });
    } else {
      return res.send({
        msg: "A project with that name and type already exists in this folder.",
      });
    }
  }
};

const getProject = async (req, res) => {
  const { projectId } = req.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });
  if (project) {
    return res.send({ project });
  } else {
    return res.status(404).json({ message: "Project not found." });
  }
};

const getProjects = async (req, res) => {
  const { folderId } = req.params;
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  if (folder) {
    const projects = await prisma.project.findMany({
      where: { folderId },
    });
    return res.send({ folder, projects });
  } else {
    res.status(404).json({ message: "Folder not found." });
  }
};

const updateProject = async (req, res) => {
  const { type, title, newFolder, description } = req.body;
  const { projectId } = req.params;
  const user = await prisma.user.findUnique({
    where: { username: req.user },
  });
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });
  if (user && type === "rename") {
    const update = await prisma.project.update({
      where: { userId: user.id, id: projectId },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
    });
    const updateFolder = await prisma.folder.update({
      where: { id: update.folderId },
      data: { updatedAt: new Date() },
    });
    return res.send({ update });
  } else if (user && type === "move") {
    const folder = await prisma.folder.findUnique({
      where: { id: newFolder.id },
    });
    const oldFolder = await prisma.folder.findUnique({
      where: {
        id: project.folderId,
      },
    });
    const exists = await prisma.project.findFirst({
      where: {
        folderId: folder.id,
        title: project.title,
      },
    });
    if (folder && !exists) {
      const move = await prisma.project.update({
        where: { userId: user.id, id: projectId },
        data: {
          folderId: folder.id,
          updatedAt: project.updatedAt,
        },
      });
      const updateFolder = await prisma.folder.update({
        where: { id: newFolder.id },
        data: { updatedAt: new Date() },
      });
      const updateOldFolder = await prisma.folder.update({
        where: { id: oldFolder.id },
        data: { updatedAt: new Date() },
      });
      return res.send({ move });
    } else if (exists) {
      return res.status(409).json({
        message: "A project with the same name already exists in that folder.",
      });
    }
  }
  return res.send({ msg: "Unable to update project." });
};

const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const chart = await prisma.chart.findFirst({
    where: {
      projectId,
    },
  });
  const deleteNodes = await prisma.sankeyNode.deleteMany({
    where: {
      chartId: chart.id,
    },
  });
  const deleteChart = await prisma.chart.delete({
    where: {
      id: chart.id,
      projectId,
    },
  });
  const remove = await prisma.project.delete({ where: { id: projectId } });
  if (remove) {
    const folder = await prisma.folder.findFirst({
      where: { id: remove.folderId },
    });
    const updateFolder = await prisma.folder.update({
      where: { id: folder.id },
      data: { updatedAt: new Date() },
    });
    return res.send({ msg: "Project deleted." });
  } else {
    return res.status(409).json({ message: "Project could not be deleted." });
  }
};

export default {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
};
