import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Directory from "./components/Directory";
import Project from "./components/Project";
import About from "./components/About";
import Welcome from "./components/Welcome";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import "./App.css";

function App() {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  async function createUser(username, password) {
    try {
      const response = await fetch(`/api/v1/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      if (response.status === 409) {
        alert("Username already exists!");
        return null;
      }
      const data = await response.json();
      if (data) {
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getUser() {
    try {
      const response = await fetch(`/api/v1/users`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyUser(username, password) {
    try {
      const response = await fetch(`/api/v1/users/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.status === 401) {
        alert("The username or password is incorrect.");
        return null;
      }
      const data = await response.json();
      if (data) {
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function logoutUser() {
    try {
      const response = await fetch(`/api/v1/users/session`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data) {
        setUser("");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const router = createBrowserRouter([
    { path: "/", element: <Home user={user} logoutUser={logoutUser} /> },
    {
      path: "/folders",
      element: (
        <Directory view={"folder"} user={user} logoutUser={logoutUser} />
      ),
    },
    {
      path: "/folders/:folderId",
      element: (
        <Directory view={"project"} user={user} logoutUser={logoutUser} />
      ),
    },
    {
      path: "/projects/:projectId",
      element: <Project user={user} logoutUser={logoutUser} />,
    },
    { path: "/about", element: <About user={user} logoutUser={logoutUser} /> },
    {
      path: "/welcome",
      element: (
        <Welcome
          user={user}
          createUser={createUser}
          verifyUser={verifyUser}
          logoutUser={logoutUser}
        />
      ),
    },
    { path: "/faq", element: <FAQ user={user} logoutUser={logoutUser} /> },
    {
      path: "/contact",
      element: <Contact user={user} logoutUser={logoutUser} />,
    },
    { path: "*", element: <NotFound /> },
  ]);
  if (!loading)
    return (
      <div>
        <RouterProvider router={router} />
      </div>
    );
}

export default App;
