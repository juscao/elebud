import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sankey from "./Sankey";
import Pie from "./Pie";
import notFound from "../imgs/not-found.svg";
import Unauthorized from "./Unauthorized";
import NotFound from "./NotFound";

function Project(props) {
  const [project, setProject] = useState(true);

  const params = useParams();

  useEffect(() => {
    getProject();
  }, []);

  async function getProject() {
    try {
      const response = await fetch(`/api/v1/projects/${params.projectId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 404) {
        setProject(false);
        return;
      }
      const data = await response.json();
      if (!props.user) {
        setProject("unauthorized");
      }
      if (data.project.userId === props.user.id) {
        setProject(data.project);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function updateProject(type, title, description) {
    try {
      const response = await fetch(`/api/v1/projects/${params.projectId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title,
          description,
        }),
      });
      const data = await response.json();
      setProject(data.update);
    } catch (error) {
      console.log(error);
    }
  }

  if (project === "unauthorized") {
    return <Unauthorized />;
  } else if (!project) {
    return <NotFound />;
  } else if (project) {
    return (
      <div id="project-container">
        <Navbar user={props.user} logoutUser={props.logoutUser} />
        {project && project.type === "SANKEY" && (
          <Sankey project={project} updateProject={updateProject} />
        )}
        {project && project.type === "PIE" && <Pie />}
        {!project && (
          <div className="no-project">
            <img src={notFound} />
            <span>Project could not be found.</span>
            <a href="/folders">Back to projects</a>
          </div>
        )}
        <Footer />
      </div>
    );
  }
}

export default Project;
