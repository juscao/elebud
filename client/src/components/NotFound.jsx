import { useNavigate } from "react-router-dom";
import notFound from "../imgs/not-found.svg";

function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <div id="not-found-container">
        <img src={notFound} alt="" />
        <span>The page you are looking for does not exist.</span>
        <span>
          <a onClick={() => navigate(-1)}>Go back to previous page</a>
        </span>
      </div>
    </>
  );
}

export default NotFound;
