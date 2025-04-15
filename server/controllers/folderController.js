import { prisma } from "../index.js";

const createFolder = async (req, res) => {
  const { name } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username: req.user,
    },
  });
  const exists = await prisma.folder.findFirst({
    where: {
      userId: user.id,
      name,
    },
  });
  if (exists) {
    return res.send({ msg: "A folder with that name already exists!" });
  } else {
    const folder = await prisma.folder.create({
      data: {
        userId: user.id,
        name,
      },
    });
    return res.send({ folder });
  }
};

const getFolders = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      username: req.user,
    },
  });
  const folders = await prisma.folder.findMany({
    where: {
      userId: user.id,
    },
  });
  return res.send({ folders });
};

const updateFolder = async (req, res) => {
  const { type, name } = req.body;
  const { folderId } = req.params;
  const user = await prisma.user.findFirst({
    where: { username: req.user },
  });
  const exists = await prisma.folder.findFirst({
    where: { name },
  });
  if (user && type === "rename" && !exists) {
    const update = await prisma.folder.update({
      where: { userId: user.id, id: folderId },
      data: {
        name,
        updatedAt: new Date(),
      },
    });
    return res.send({ update });
  } else if (exists) {
    return res.status(409).json({ message: "Folder name already exists." });
  }
  return res.send({ msg: "Unable to update folder." });
};

const deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  if (folder) {
    const deleteProjects = await prisma.project.deleteMany({
      where: { folderId: folder.id },
    });
    const deleteFolder = await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });
    return res.send({ msg: "Folder deleted." });
  }
  return res.send({
    msg: "There was a problem trying to delete this folder. Please try again.",
  });
};

export default {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
};
