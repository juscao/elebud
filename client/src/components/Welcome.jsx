import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Welcome(props) {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState("sign in");
  const [width, setWidth] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Welcome | Elebud";
    if (props.user) {
      navigate("/");
    }
    setWidth(window.innerWidth);
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!props.user)
    return (
      <div className="wrapper">
        <Navbar user={props.user} logoutUser={props.logoutUser} />
        <div id="welcome-container">
          {(width > 767 || (width < 768 && form === "sign up")) && (
            <div>
              <h2>Register</h2>
              <form
                aria-label="create account form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    alert("Passwords do not match!");
                  } else {
                    const success = await props.createUser(
                      newUsername,
                      newPassword
                    );
                    if (success) {
                      navigate("/folders");
                    }
                  }
                }}
              >
                <div>
                  <label id="new-username-label">Username:</label>
                  <input
                    type="text"
                    pattern="[A-Za-z0-9]+"
                    placeholder="Letters/numbers only"
                    required
                    minLength="6"
                    maxLength="20"
                    aria-labelledby="new-username-label"
                    aria-describedby="username-requirements"
                    onChange={(e) => setNewUsername(() => e.target.value)}
                  />
                </div>
                <div>
                  <label id="new-password-label">Password:</label>
                  <input
                    type="password"
                    placeholder="8+ characters"
                    required
                    minLength="6"
                    aria-labelledby="new-password-label"
                    aria-describedby="password-requirements"
                    onChange={(e) => setNewPassword(() => e.target.value)}
                  />
                </div>
                <div>
                  <label id="confirm-password-label">Confirm Password:</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    aria-labelledby="confirm-password-label"
                    onChange={(e) => setConfirmPassword(() => e.target.value)}
                  />
                </div>
                <button className="sign-up" type="submit">
                  Sign Up
                </button>
              </form>
              <span className="other">
                Already have an account?{" "}
                <button type="button" onClick={() => setForm("sign in")}>
                  Sign in
                </button>
              </span>
            </div>
          )}
          {(width > 767 || (width < 768 && form === "sign in")) && (
            <div>
              <h2>Sign in</h2>
              <form
                aria-label="sign in form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const success = await props.verifyUser(username, password);
                  if (success) {
                    navigate("/folders");
                  }
                }}
              >
                <div>
                  <label id="username-label">Username:</label>
                  <input
                    type="text"
                    required
                    aria-labelledby="username-label"
                    onChange={(e) => setUsername(() => e.target.value)}
                  />
                </div>
                <div>
                  <label id="password-label">Password:</label>
                  <input
                    type="password"
                    required
                    aria-labelledby="password-label"
                    onChange={(e) => setPassword(() => e.target.value)}
                  />
                </div>
                <button className="sign-in" type="submit">
                  Sign In
                </button>
              </form>
              <span className="other">
                Don't have an account?{" "}
                <button type="button" onClick={() => setForm("sign up")}>
                  Sign up
                </button>
              </span>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
}

export default Welcome;
