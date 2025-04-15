import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Home(props) {
  useEffect(() => {
    document.title = "Home | Elebud";
  }, []);

  return (
    <div className="wrapper">
      <Navbar user={props.user} logoutUser={props.logoutUser} />
      <div id="home-container">
        <div className="hero">
          <img
            src="https://images.unsplash.com/photo-1669399213378-2853e748f217?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
          <div className="text">
            <h1 className="title">WELCOME TO ELEBUD!</h1>
            <h2 className="description">
              Elebud is a charting tool to help you visualize your finances.
            </h2>
            <a
              href={props.user ? "/folders" : "/welcome"}
              aria-label={
                props.user ? "go to folders page" : "go to welcome page"
              }
            >
              Get started ➝
            </a>
          </div>
        </div>
        <div className="cta">
          <div className="card">
            <span className="title">
              Track your income and expenses with ease
            </span>
            <span className="description">
              Stay on top of your financials with our easy-to-use application.
            </span>
          </div>
          <div className="card">
            <span className="title">Download your charts for sharing</span>
            <span className="description">
              Convert your charts into PNG images with the click of a button.
            </span>
          </div>
          <div className="card">
            <span className="title">Completely free to join and use</span>
            <span className="description">
              All registered users will have access to all features for free.
            </span>
          </div>
        </div>
        <div className="questions">
          <h2 className="title">Still have questions?</h2>
          <h3 className="description">
            You may visit our <a href="/faq">FAQ page</a> or
            <a href="/contact"> contact us</a> through the form on our website.
          </h3>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
