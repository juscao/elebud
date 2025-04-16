import logo from "../imgs/logo.svg";
import facebook from "../imgs/facebook.svg";
import instagram from "../imgs/instagram.svg";
import youtube from "../imgs/youtube.svg";
import github from "../imgs/github.svg";

function Footer() {
  return (
    <footer className="footer">
      <img src={logo} alt="" />
      <div className="links">
        <a
          href="https://facebook.com"
          target="_blank"
          aria-label="to facebook page"
        >
          <img src={facebook} alt="facebook logo" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          aria-label="to instagram page"
        >
          <img src={instagram} alt="instagram logo" />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          aria-label="to youtube page"
        >
          <img src={youtube} alt="youtube logo" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          aria-label="to github page"
        >
          <img src={github} alt="github logo" />
        </a>
      </div>
      <span className="copyright">
        © {new Date().getFullYear()} Elebud. All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;
