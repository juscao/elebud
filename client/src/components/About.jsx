import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import about from "../imgs/about.svg";
function About(props) {
  useEffect(() => {
    document.title = "About | Elebud";
  }, []);
  return (
    <div className="wrapper">
      <Navbar user={props.user} logoutUser={props.logoutUser} />
      <div id="about-container">
        <h1>About Elebud</h1>
        <div className="top">
          <img src={about} alt="" />
          <p>
            Elebud is a chart and diagram generator designed to help you track
            your finances. It is a free-to-use service that runs entirely in
            your browser, requiring no downloads or prior experience with any
            application. All you need is a clear idea of what you want to
            visualize. Whether you're looking for a better way to understand
            your budget or analyze how your investments are distributed, Elebud
            can help. Currently, it supports Sankey diagrams and pie charts,
            with plans to add more chart types in the future. Signing up is
            completely free.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
