import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../imgs/logo.svg";
import hamburger from "../imgs/hamburger.svg";
import close from "../imgs/close.svg";

function Navbar(props) {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  return (
    <>
      <nav className="navbar">
        <div className="top">
          <img src={logo} className="navbar-logo" alt="" />
          <div className="navbar-links">
            <div className="left">
              <a href="/">Home</a>
              {props.user && <a href="/folders">My projects</a>}
              <a href="/about">About</a>
              <a href="/faq">FAQ</a>
              <a href="/contact">Contact</a>
            </div>
            <div className="right">
              {props.user ? (
                <a
                  onClick={async () => {
                    const success = await props.logoutUser();
                    if (success) {
                      navigate("/welcome");
                    }
                  }}
                >
                  Sign out
                </a>
              ) : (
                <a href="/welcome">Sign in</a>
              )}
            </div>
          </div>
          <button type="button" onClick={() => setMenu(() => !menu)}>
            <img
              src={menu ? close : hamburger}
              alt={menu ? "close menu" : "open menu"}
            />
          </button>
        </div>
        {menu && (
          <div className="bottom">
            <a href="/">Home</a>
            {props.user && <a href="/folders">My projects</a>}
            <a href="/about">About</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact</a>
            {props.user ? (
              <a
                onClick={async () => {
                  const success = await props.logoutUser();
                  if (success) {
                    navigate("/welcome");
                  }
                }}
              >
                Sign out
              </a>
            ) : (
              <a href="/welcome">Sign in</a>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
