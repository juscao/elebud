import { prisma } from "../index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createUser = async (req, res) => {
  const { username, password } = req.body;
  const exists = await prisma.user.findFirst({
    where: { username },
  });
  if (!exists) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
      },
    });
    const accessToken = jwt.sign(
      { id: username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    return res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .send({ user });
  } else {
    return res.sendStatus(409);
  }
};

const getUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.user,
    },
  });
  return res.send({ user });
};

const verifyUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (user) {
    const compare = await bcrypt.compare(password, user.password);
    if (compare) {
      const accessToken = jwt.sign(
        { id: username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );
      return res
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .send({ user });
    } else {
      return res.status(401).json({ message: "Invalid credentials." });
    }
  } else {
    return res.status(401).json({ message: "Invalid credentials." });
  }
};

const logoutUser = async (req, res) => {
  if (req.cookies.accessToken || req.cookies.refreshToken) {
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({ message: "Successfully logged out." });
  }
};

const updateUser = async (req, res) => {
  const { currentUsername, newUsername } = req.body;
  const user = await prisma.user.findFirst({
    where: { username: currentUsername },
  });
  if (user) {
    const update = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: newUsername,
      },
    });
    return res.send({ msg: "username updated" });
  }
  return res.send({ msg: "unable to find user" });
};

const deleteUsers = async (req, res) => {
  const users = await prisma.user.deleteMany();
  return res.send({ msg: "done" });
};

export default {
  createUser,
  getUser,
  verifyUser,
  logoutUser,
  updateUser,
  deleteUsers,
};
