import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClickAway } from "@uidotdev/usehooks";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Unauthorized from "./Unauthorized";
import sort from "../imgs/sort.svg";
import folderImg from "../imgs/folder.svg";
import sankeyChart from "../imgs/sankey-chart.svg";
import pieChart from "../imgs/pie-chart.svg";
import options from "../imgs/options.svg";
import rename from "../imgs/rename.svg";
import move from "../imgs/move.svg";
import remove from "../imgs/remove.svg";
import add from "../imgs/add.svg";
import close from "../imgs/close.svg";
import confirm from "../imgs/confirm.svg";
import cancel from "../imgs/cancel.svg";
import notFound from "../imgs/not-found.svg";

function Directory(props) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  const [folders, setFolders] = useState([]);
  const [foldersCopy, setFoldersCopy] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsCopy, setProjectsCopy] = useState([]);
  const [folderSortMethod, setFolderSortMethod] = useState("lastModifiedDesc");
  const [projectSortMethod, setProjectSortMethod] =
    useState("lastModifiedDesc");
  const [hovered, setHovered] = useState({});
  const [optionsModal, setOptionsModal] = useState({});
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [chartType, setChartType] = useState("");
  const [renameFolder, setRenameFolder] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [renameProject, setRenameProject] = useState({});
  const [newProjectName, setNewProjectName] = useState("");
  const [moveModal, setMoveModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [moveToFolder, setMoveToFolder] = useState("");
  const [deleteFolderModal, setDeleteFolderModal] = useState(false);
  const [deleteProjectModal, setDeleteProjectModal] = useState(false);
  const [numProjects, setNumProjects] = useState(0);
  const [folderPage, setFolderPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  const navigate = useNavigate();
  const params = useParams();

  const inputRef = useRef(null);
  const clickAwayRef = useClickAway(() => {
    setTimeout(() => setOptionsModal({}), 100);
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  useEffect(() => {
    if (props.view === "folder") {
      document.title = "Folders | Elebud";
      getFolders();
    } else if (props.view === "project") {
      document.title = "Projects | Elebud";
      getFolders();
      getProjects(params.folderId);
    }
  }, [props.view]);

  useEffect(() => {
    function updatePosition() {
      setScrollPosition(window.scrollY);
    }
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, [scrollPosition]);

  useEffect(() => {
    if (newFolderModal || newProjectModal || moveModal) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      setSavedScrollPosition(scrollPosition);
    } else {
      document.body.style.position = "static";
      if (savedScrollPosition !== 0) {
        window.scrollTo(0, savedScrollPosition);
      }
    }
  }, [newFolderModal, newProjectModal, moveModal]);

  async function getFolders() {
    try {
      const response = await fetch("/api/v1/folders", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      let arr = data.folders.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setFolders(arr);
      setFoldersCopy(arr);
    } catch (error) {
      console.log(error);
    }
  }

  async function createFolder() {
    try {
      const response = await fetch("api/v1/folders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
        }),
      });
      const data = await response.json();
      if (data.folder) {
        setFolders(() => [data.folder, ...folders]);
        setFoldersCopy(() => [data.folder, ...folders]);
        setNewFolderModal(false);
        setCurrentFolder(data.folder);
        setFolderName("");
        setProjects([]);
        setProjectsCopy([]);
        navigate(`/folders/${data.folder.id}`);
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function updateFolder(type, folderId) {
    try {
      const response = await fetch(`api/v1/folders/${folderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          name: newFolderName,
        }),
      });
      if (response.status === 409) {
        alert("Folder name already exists!");
        return;
      }
      const data = await response.json();
      if (data.update) {
        const index = folders.indexOf(
          folders.filter((folder) => folder.id === folderId)[0]
        );
        const update = folders;
        update.splice(index, 1, data.update);
        setFolders(update);
        setFoldersCopy(update);
        setNewFolderName("");
      }
      setRenameFolder({});
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteFolder(folderId) {
    try {
      const response = await fetch(`api/v1/folders/${folderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.msg === "Folder deleted.") {
        const arr = folders.filter((folder) => folder.id !== folderId);
        setFolders(arr);
        setFoldersCopy(arr);
      } else {
        alert(data.msg);
      }
      setDeleteFolderModal(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function getProjects(folderId) {
    try {
      const response = await fetch(`/api/v1/folders/${folderId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 404) {
        setProjects(false);
        return;
      }
      const data = await response.json();
      let arr = data.projects.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setProjects(arr);
      setProjectsCopy(arr);
      setCurrentFolder(data.folder);
    } catch (error) {
      console.log(error);
    }
  }

  async function getNumProjects(folderId) {
    try {
      const response = await fetch(`/api/v1/folders/${folderId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setNumProjects(data.projects.length);
      setDeleteFolderModal(true);
    } catch (error) {
      console.log(error);
    }
  }

  async function createProject() {
    try {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: currentFolder.id,
          title: projectName,
          description,
          type: chartType,
        }),
      });
      const data = await response.json();
      if (data.project) {
        setProjects(() => [...projects, data.project]);
        setProjectsCopy(() => [...projects, data.project]);
        setNewProjectModal(false);
        setProjectName("");
        setDescription("");
        setChartType("");
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function updateProject(type, projectId) {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title: newProjectName,
          newFolder: moveToFolder,
        }),
      });

      if (response.status === 409) {
        alert("A project with the same name already exists in that folder.");
        return;
      }
      const data = await response.json();
      if (data.update) {
        const index = projects.indexOf(
          projects.filter((project) => project.id === projectId)[0]
        );
        const update = projects;
        update.splice(index, 1, data.update);
        setProjects(update);
        setProjectsCopy(update);
        setNewProjectName("");
      } else if (data.move) {
        const remove = projects.filter((project) => project.id !== projectId);
        setProjects(remove);
        setProjectsCopy(remove);
        alert("Project moved.");
        setMoveToFolder("");
        setMoveModal(false);
      }
      setRenameProject({});
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteProject(projectId) {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.msg) {
        const filtered = projects.filter((project) => project.id !== projectId);
        setProjects(filtered);
        setProjectsCopy(filtered);
      }
      setDeleteProjectModal(false);
    } catch (error) {
      console.log(error);
    }
  }

  function sortArray(method) {
    if (props.view === "folder") setFolderSortMethod(method);
    if (props.view === "project") setProjectSortMethod(method);
    if (props.view === "folder" && method === "nameAsc") {
      let arr = folders.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setFolders(arr);
    } else if (props.view === "folder" && method === "nameDesc") {
      let arr = folders.sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      );
      setFolders(arr);
    } else if (props.view === "folder" && method === "lastModifiedAsc") {
      let arr = folders.sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
      );
      setFolders(arr);
    } else if (props.view === "folder" && method === "lastModifiedDesc") {
      let arr = folders.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setFolders(arr);
    } else if (props.view === "project" && method === "nameAsc") {
      let arr = projects.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
      setProjects(arr);
    } else if (props.view === "project" && method === "nameDesc") {
      let arr = projects.sort((a, b) =>
        b.title.toLowerCase().localeCompare(a.title.toLowerCase())
      );
      setProjects(arr);
    } else if (props.view === "project" && method === "lastModifiedAsc") {
      let arr = projects.sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
      );
      setProjects(arr);
    } else if (props.view === "project" && method === "lastModifiedDesc") {
      let arr = projects.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setProjects(arr);
    } else if (props.view === "project" && method === "typeAsc") {
      let arr = projects.sort((a, b) => {
        if (a.type === b.type) {
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        } else {
          return a.type.localeCompare(b.type);
        }
      });
      setProjects(arr);
    } else if (props.view === "project" && method === "typeDesc") {
      let arr = projects.sort((a, b) => {
        if (a.type === b.type) {
          return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
        } else {
          return b.type.localeCompare(a.type);
        }
      });
      setProjects(arr);
    }
  }

  function formatDate(utcDate) {
    const date = new Date(utcDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }

  if (props.user)
    return (
      <div className="wrapper">
        {newFolderModal && (
          <div className="fullscreen-modal">
            <div className="new-folder-modal">
              <div className="title">
                <span>New folder</span>
                <button type="button" onClick={() => setNewFolderModal(false)}>
                  <img src={close} alt="close modal" />
                </button>
              </div>
              <form
                aria-label="new folder form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (folderName.trim().length > 0) {
                    createFolder();
                  } else {
                    alert("You must enter a name!");
                  }
                }}
              >
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(() => e.target.value)}
                  name="name"
                  id="name"
                  minLength="1"
                  maxLength="50"
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
        {newProjectModal && (
          <div className="fullscreen-modal">
            <div className="new-project-modal">
              <div className="title">
                <span>New project</span>
                <button type="button" onClick={() => setNewProjectModal(false)}>
                  <img src={close} alt="close modal" />
                </button>
              </div>
              <form
                aria-label="new project form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (projectName.trim().length > 0 && chartType) {
                    createProject();
                  } else if (projectName.trim().length === 0 && !chartType) {
                    alert("You must enter a name and pick a project type!");
                  } else if (projectName.trim().length === 0) {
                    alert("You must enter a name!");
                  } else if (!chartType) {
                    alert("You must pick a project type!");
                  }
                }}
              >
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(() => e.target.value)}
                  name="name"
                  id="name"
                  minLength="1"
                  maxLength="50"
                />
                <label htmlFor="description">Description (opt):</label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(() => e.target.value)}
                />
                <div className="type">
                  <span>Project type:</span>
                  <div className="charts">
                    <div
                      onClick={() => setChartType("SANKEY")}
                      className={chartType === "SANKEY" ? "selected" : null}
                    >
                      <button type="button">
                        <img src={sankeyChart} alt="sankey chart" />
                      </button>
                      <span>Sankey</span>
                    </div>
                    <div
                      onClick={() => setChartType("PIE")}
                      className={chartType === "PIE" ? "selected" : null}
                    >
                      <button type="button">
                        <img src={pieChart} alt="pie chart" />
                      </button>
                      <span>Pie</span>
                    </div>
                  </div>
                </div>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
        {moveModal && (
          <div className="fullscreen-modal">
            <div className="move-modal">
              <div className="title">
                <span>Move project</span>
                <button
                  type="button"
                  onClick={() => {
                    setMoveModal(false);
                  }}
                >
                  <img src={close} alt="close modal" />
                </button>
              </div>
              <form
                aria-label="move project form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (moveToFolder) {
                    updateProject("move", selectedProject.id);
                  } else {
                    alert("You must select a folder!");
                  }
                }}
              >
                <label htmlFor="folder-select">Choose a folder:</label>
                <select
                  name="folders"
                  id="folder-select"
                  defaultValue=""
                  onChange={(e) =>
                    setMoveToFolder(
                      () =>
                        folders.filter(
                          (folder) => folder.name === e.target.value
                        )[0]
                    )
                  }
                >
                  <option value="" disabled></option>
                  {folders
                    .filter((folder) => folder.id !== currentFolder.id)
                    .map((folder, i) => (
                      <option value={folder.name} key={i}>
                        {folder.name}
                      </option>
                    ))}
                </select>
                <button type="submit">
                  Move '
                  {selectedProject.title.length > 20
                    ? selectedProject.title.slice(0, 20) + "..."
                    : selectedProject.title}
                  '
                </button>
              </form>
            </div>
          </div>
        )}
        {deleteFolderModal && (
          <div className="fullscreen-modal">
            <div className="delete-folder-modal">
              <div className="title">
                <span>Delete folder</span>
                <button
                  type="button"
                  onClick={() => setDeleteFolderModal(false)}
                >
                  <img src={close} alt="close modal" />
                </button>
              </div>
              <form
                aria-label="delete folder form"
                onSubmit={(e) => {
                  e.preventDefault();
                  deleteFolder(selectedFolder.id);
                }}
              >
                {numProjects > 0 && (
                  <span>
                    Are you sure you want to delete this folder? {numProjects}{" "}
                    {numProjects < 2 ? "project" : "projects"} will also be
                    deleted. This action cannot be undone.
                  </span>
                )}
                {numProjects < 1 && (
                  <span>
                    Are you sure you want to delete this folder? This action
                    cannot be undone.
                  </span>
                )}
                <button
                  className="cancel"
                  type="button"
                  onClick={() => setDeleteFolderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="delete">
                  Delete '
                  {selectedFolder.name.length > 20
                    ? selectedFolder.name.slice(0, 20) + "..."
                    : selectedFolder.name}
                  '
                </button>
              </form>
            </div>
          </div>
        )}
        {deleteProjectModal && (
          <div className="fullscreen-modal">
            <div className="delete-project-modal">
              <div className="title">
                <span>Delete project</span>
                <button
                  type="button"
                  onClick={() => setDeleteProjectModal(false)}
                >
                  <img src={close} alt="close modal" />
                </button>
              </div>
              <form
                aria-label="delete project form"
                onSubmit={(e) => {
                  e.preventDefault();
                  deleteProject(selectedProject.id);
                }}
              >
                <span>
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </span>

                <button
                  className="cancel"
                  type="button"
                  onClick={() => setDeleteProjectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="delete">
                  Delete '
                  {selectedProject.title.length > 20
                    ? selectedProject.title.slice(0, 20) + "..."
                    : selectedProject.title}
                  '
                </button>
              </form>
            </div>
          </div>
        )}
        <Navbar user={props.user} logoutUser={props.logoutUser} />
        {(!params.folderId || (params.folderId && currentFolder)) && (
          <div id="projects-container">
            {props.view === "folder" && <h1 className="title">Folders</h1>}
            {props.view === "project" && (
              <h1 className="title">
                <span
                  onClick={() => {
                    setProjectName("");
                    setDescription("");
                    setChartType("");
                    setProjects([]);
                    setProjectsCopy([]);
                    setOptionsModal({});
                    setProjectPage(1);
                    navigate("/folders");
                  }}
                >
                  Folders
                </span>{" "}
                /{" "}
                {currentFolder && currentFolder.name.length > 20
                  ? currentFolder.name.slice(0, 20) + "..."
                  : currentFolder.name}
              </h1>
            )}
            {props.view === "folder" && (
              <div className="create">
                <input
                  type="search"
                  placeholder="Search folders"
                  aria-label="search folders"
                  onChange={(e) => {
                    if (!e.target.value) {
                      const arr = foldersCopy;
                      setFolders(arr);
                    } else {
                      const filtered = foldersCopy.filter((folder) =>
                        folder.name
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase())
                      );
                      setFolders(filtered);
                    }
                  }}
                />
                <button type="button" onClick={() => setNewFolderModal(true)}>
                  <img src={add} alt="" />
                  New folder
                </button>
              </div>
            )}
            {props.view === "project" && (
              <div className="create">
                <input
                  type="search"
                  placeholder="Search projects"
                  aria-label="search projects"
                  onChange={(e) => {
                    if (!e.target.value) {
                      const arr = projectsCopy;
                      setProjects(arr);
                    } else {
                      const filtered = projectsCopy.filter((project) =>
                        project.title
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase())
                      );
                      setProjects(filtered);
                    }
                  }}
                />
                <button type="button" onClick={() => setNewProjectModal(true)}>
                  <img src={add} alt="" />
                  New project
                </button>
              </div>
            )}
            {props.view === "folder" && (
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      <th className="empty"></th>
                      <th
                        onClick={
                          folderSortMethod === "nameAsc" ||
                          folderSortMethod === "nameDesc"
                            ? folderSortMethod === "nameAsc"
                              ? () => sortArray("nameDesc")
                              : () => sortArray("nameAsc")
                            : () => sortArray("nameAsc")
                        }
                      >
                        <div>
                          <span>Name</span>
                          {folderSortMethod === "nameAsc" ||
                          folderSortMethod === "nameDesc" ? (
                            <img
                              src={sort}
                              style={
                                folderSortMethod === "nameAsc"
                                  ? { transform: "rotate(180deg)" }
                                  : {}
                              }
                              alt={
                                folderSortMethod === "nameAsc"
                                  ? "sorted by name ascending"
                                  : "sorted by name descending"
                              }
                            />
                          ) : null}
                        </div>
                      </th>
                      <th
                        onClick={
                          folderSortMethod === "lastModifiedAsc" ||
                          folderSortMethod === "lastModifiedDesc"
                            ? folderSortMethod === "lastModifiedAsc"
                              ? () => sortArray("lastModifiedDesc")
                              : () => sortArray("lastModifiedAsc")
                            : () => sortArray("lastModifiedDesc")
                        }
                      >
                        <span>Last modified</span>
                        {folderSortMethod === "lastModifiedAsc" ||
                        folderSortMethod === "lastModifiedDesc" ? (
                          <img
                            src={sort}
                            style={
                              folderSortMethod === "lastModifiedAsc"
                                ? { transform: "rotate(180deg)" }
                                : {}
                            }
                            alt={
                              folderSortMethod === "lastModifiedAsc"
                                ? "sorted by oldest to newest"
                                : "sorted by newest to oldest"
                            }
                          />
                        ) : null}
                      </th>
                      <th className="empty"></th>
                    </tr>
                    {folders.length ? (
                      folders
                        .slice(10 * folderPage - 10, 10 * folderPage - 1)
                        .map((folder, i) => (
                          <tr
                            onMouseOver={
                              !optionsModal.state
                                ? () => setHovered({ num: i, state: true })
                                : null
                            }
                            onMouseLeave={() => setHovered({})}
                            onClick={
                              optionsModal.state || renameFolder.state
                                ? null
                                : () => {
                                    navigate(`/folders/${folder.id}`);
                                    setCurrentFolder(folder);
                                    setHovered({});
                                  }
                            }
                            className={
                              ((hovered.num === i && hovered.state) ||
                                (optionsModal.num === i &&
                                  optionsModal.state)) &&
                              !renameFolder.state
                                ? "hovered"
                                : null
                            }
                            style={
                              hovered.num === i &&
                              hovered.state &&
                              optionsModal.num !== i &&
                              !renameFolder.state
                                ? { cursor: "pointer" }
                                : {}
                            }
                            key={i}
                          >
                            <td>
                              <img
                                src={folderImg}
                                className="folder"
                                alt="folder"
                              />
                            </td>
                            {renameFolder.num !== i && (
                              <td>
                                {folder.name.length > 20
                                  ? folder.name.slice(0, 20) + "..."
                                  : folder.name}
                              </td>
                            )}
                            {renameFolder.num === i && renameFolder.state && (
                              <td className="rename">
                                <input
                                  type="text"
                                  name="renameFolder"
                                  id="renameFolder"
                                  value={newFolderName}
                                  minLength="1"
                                  maxLength="50"
                                  aria-label="rename folder"
                                  onChange={(e) =>
                                    setNewFolderName(() => e.target.value)
                                  }
                                  ref={inputRef}
                                  className="rename"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewFolderName("");
                                    setRenameFolder({});
                                  }}
                                >
                                  <img src={cancel} alt="cancel" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    newFolderName.trim().length > 0
                                      ? updateFolder("rename", folder.id)
                                      : alert("You must enter a name!");
                                  }}
                                >
                                  <img src={confirm} alt="confirm" />
                                </button>
                              </td>
                            )}
                            <td>{formatDate(folder.updatedAt)}</td>
                            <td>
                              <button
                                className="options"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOptionsModal(
                                    i === optionsModal.num
                                      ? () => ({
                                          num: i,
                                          state: !optionsModal.state,
                                        })
                                      : () => ({ num: i, state: true })
                                  );
                                }}
                              >
                                <img src={options} alt="options" />
                              </button>
                              {optionsModal.num === i && optionsModal.state && (
                                <div
                                  className="options-modal-container"
                                  ref={clickAwayRef}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRenameFolder({ num: i, state: true });
                                      setNewFolderName(folder.name);
                                      setOptionsModal(false);
                                    }}
                                  >
                                    <img src={rename} alt="" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      getNumProjects(folder.id);
                                      setSelectedFolder(folder);
                                      setOptionsModal({});
                                    }}
                                  >
                                    <img src={remove} alt="" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td className="empty">No folders found.</td>
                        <td className="empty">-</td>
                        <td className="empty">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="page-numbers">
                  {folders.length > 0 && (
                    <span>
                      Showing {folderPage * 10 - 9}-
                      {folderPage * 10 > folders.length
                        ? folders.length
                        : folderPage * 10}{" "}
                      of {folders.length}
                    </span>
                  )}
                  {folders.length > 10 && (
                    <div>
                      {folderPage !== 1 && (
                        <button type="button" onClick={() => setFolderPage(1)}>
                          {"<<"}
                        </button>
                      )}
                      {folderPage > 1 && (
                        <button
                          type="button"
                          onClick={() => setFolderPage(folderPage - 1)}
                        >
                          {"<"}
                        </button>
                      )}
                      {folderPage > 1 && (
                        <button
                          className="page"
                          type="button"
                          onClick={() => setFolderPage(folderPage - 1)}
                        >
                          {folderPage - 1}
                        </button>
                      )}
                      <button className="page current" type="button">
                        {folderPage}
                      </button>
                      {folderPage + 1 <= Math.ceil(folders.length / 10) && (
                        <button
                          className="page"
                          type="button"
                          onClick={() => setFolderPage(folderPage + 1)}
                        >
                          {folderPage + 1}
                        </button>
                      )}
                      {folderPage + 1 <= Math.ceil(folders.length / 10) && (
                        <button
                          type="button"
                          onClick={() => setFolderPage(folderPage + 1)}
                        >
                          {">"}
                        </button>
                      )}
                      {folderPage !== Math.ceil(folders.length / 10) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFolderPage(Math.ceil(folders.length / 10))
                          }
                        >
                          {">>"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {props.view === "project" && (
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      <th
                        onClick={
                          projectSortMethod === "typeAsc" ||
                          projectSortMethod === "typeDesc"
                            ? projectSortMethod === "typeAsc"
                              ? () => sortArray("typeDesc")
                              : () => sortArray("typeAsc")
                            : () => sortArray("typeAsc")
                        }
                      >
                        <span>Type</span>
                        {projectSortMethod === "typeAsc" ||
                        projectSortMethod === "typeDesc" ? (
                          <img
                            src={sort}
                            style={
                              projectSortMethod === "typeAsc"
                                ? { transform: "rotate(180deg)" }
                                : {}
                            }
                            alt={
                              projectSortMethod === "typeAsc"
                                ? "sorted by chart type name ascending"
                                : "sorted by chart type name descending"
                            }
                          />
                        ) : null}
                      </th>
                      <th
                        onClick={
                          projectSortMethod === "nameAsc" ||
                          projectSortMethod === "nameDesc"
                            ? projectSortMethod === "nameAsc"
                              ? () => sortArray("nameDesc")
                              : () => sortArray("nameAsc")
                            : () => sortArray("nameAsc")
                        }
                      >
                        <div>
                          <span>Name</span>
                          {projectSortMethod === "nameAsc" ||
                          projectSortMethod === "nameDesc" ? (
                            <img
                              src={sort}
                              style={
                                projectSortMethod === "nameAsc"
                                  ? { transform: "rotate(180deg)" }
                                  : {}
                              }
                              alt={
                                projectSortMethod === "nameAsc"
                                  ? "sorted by name ascending"
                                  : "sorted by name descending"
                              }
                            />
                          ) : null}
                        </div>
                      </th>
                      <th
                        onClick={
                          projectSortMethod === "lastModifiedAsc" ||
                          projectSortMethod === "lastModifiedDesc"
                            ? projectSortMethod === "lastModifiedAsc"
                              ? () => sortArray("lastModifiedDesc")
                              : () => sortArray("lastModifiedAsc")
                            : () => sortArray("lastModifiedDesc")
                        }
                      >
                        <span>Last modified</span>
                        {projectSortMethod === "lastModifiedAsc" ||
                        projectSortMethod === "lastModifiedDesc" ? (
                          <img
                            src={sort}
                            style={
                              projectSortMethod === "lastModifiedAsc"
                                ? { transform: "rotate(180deg)" }
                                : {}
                            }
                            alt={
                              projectSortMethod === "lastModifiedAsc"
                                ? "sorted by oldest to newest"
                                : "sorted by newest to oldest"
                            }
                          />
                        ) : null}
                      </th>
                      <th className="empty"></th>
                    </tr>
                    {projects.length ? (
                      projects
                        .slice(projectPage * 10 - 10, projectPage * 10 - 1)
                        .map((project, i) => (
                          <tr
                            onMouseOver={
                              !optionsModal.state && renameProject.num !== i
                                ? () => setHovered({ num: i, state: true })
                                : null
                            }
                            onMouseLeave={() => setHovered({})}
                            className={
                              ((hovered.num === i && hovered.state) ||
                                (optionsModal.num === i &&
                                  optionsModal.state)) &&
                              !renameProject.state
                                ? "hovered"
                                : null
                            }
                            style={
                              hovered.num === i &&
                              hovered.state &&
                              optionsModal.num !== i &&
                              !renameProject.state
                                ? { cursor: "pointer" }
                                : {}
                            }
                            key={i}
                            onClick={() => {
                              if (
                                renameProject.state !== true &&
                                !optionsModal.state
                              ) {
                                navigate(`/projects/${project.id}`);
                              }
                            }}
                          >
                            <td>
                              <img
                                src={
                                  project.type === "SANKEY"
                                    ? sankeyChart
                                    : pieChart
                                }
                                className="chart"
                                alt={
                                  project.type === "SANKEY"
                                    ? "sankey chart"
                                    : "pie chart"
                                }
                              />
                            </td>
                            {renameProject.num !== i && (
                              <td>
                                {project.title.length > 20
                                  ? project.title.slice(0, 20) + "..."
                                  : project.title}
                              </td>
                            )}
                            {renameProject.num === i && renameProject.state && (
                              <td className="rename">
                                <input
                                  type="text"
                                  name="renameProject"
                                  id="renameProject"
                                  value={newProjectName}
                                  minLength="50"
                                  maxLength="50"
                                  aria-label="rename project"
                                  onChange={(e) => {
                                    setNewProjectName(() => e.target.value);
                                  }}
                                  ref={inputRef}
                                  className="rename"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewProjectName("");
                                    setRenameProject({});
                                  }}
                                >
                                  <img src={cancel} alt="cancel" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    newProjectName.trim().length > 0
                                      ? updateProject("rename", project.id)
                                      : alert("You must enter a name!");
                                  }}
                                >
                                  <img src={confirm} alt="confirm" />
                                </button>
                              </td>
                            )}
                            <td>{formatDate(project.updatedAt)}</td>
                            <td>
                              <button
                                className="options"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOptionsModal(
                                    i === optionsModal.num
                                      ? () => ({
                                          num: i,
                                          state: !optionsModal.state,
                                        })
                                      : () => ({ num: i, state: true })
                                  );
                                }}
                              >
                                <img src={options} alt="options" />
                              </button>

                              {optionsModal.num === i && optionsModal.state && (
                                <div
                                  className="options-modal-container"
                                  ref={clickAwayRef}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRenameProject({ num: i, state: true });
                                      setNewProjectName(project.title);
                                      setOptionsModal({});
                                    }}
                                  >
                                    <img src={rename} alt="" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMoveModal(true);
                                      setSelectedProject(project);
                                      setOptionsModal({});
                                    }}
                                  >
                                    <img src={move} alt="" />
                                    <span>Move</span>
                                  </button>
                                  <button
                                    type="buttone"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProject(project);
                                      setOptionsModal(false);
                                      setDeleteProjectModal(true);
                                    }}
                                  >
                                    <img src={remove} alt="" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td className="empty">No projects found.</td>
                        <td className="empty">-</td>
                        <td className="empty">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="page-numbers">
                  {projects.length > 0 && (
                    <span>
                      Showing {projectPage * 10 - 9}-
                      {projectPage * 10 > projects.length
                        ? projects.length
                        : projectPage * 10}{" "}
                      of {projects.length}
                    </span>
                  )}
                  {projects.length > 10 && (
                    <div>
                      {projectPage !== 1 && (
                        <button type="button" onClick={() => setProjectPage(1)}>
                          {"<<"}
                        </button>
                      )}
                      {projectPage > 1 && (
                        <button
                          type="button"
                          onClick={() => setProjectPage(projectPage - 1)}
                        >
                          {"<"}
                        </button>
                      )}
                      {projectPage > 1 && (
                        <button
                          className="page"
                          type="button"
                          onClick={() => setProjectPage(projectPage - 1)}
                        >
                          {projectPage - 1}
                        </button>
                      )}
                      <button className="page current" type="button">
                        {projectPage}
                      </button>
                      {projectPage + 1 <= Math.ceil(projects.length / 10) && (
                        <button
                          className="page"
                          type="button"
                          onClick={() => setProjectPage(projectPage + 1)}
                        >
                          {projectPage + 1}
                        </button>
                      )}
                      {projectPage + 1 <= Math.ceil(projects.length / 10) && (
                        <button
                          type="button"
                          onClick={() => setProjectPage(projectPage + 1)}
                        >
                          {">"}
                        </button>
                      )}
                      {projectPage !== Math.ceil(projects.length / 10) && (
                        <button
                          type="button"
                          onClick={() =>
                            setProjectPage(Math.ceil(projects.length / 10))
                          }
                        >
                          {">>"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {!currentFolder && params.folderId && (
          <div className="no-folder">
            <img src={notFound} alt="" />
            <span>Folder could not be found.</span>
            <a href="/folders">Back to folders</a>
          </div>
        )}
        <Footer />
      </div>
    );
  else return <Unauthorized />;
}

export default Directory;
