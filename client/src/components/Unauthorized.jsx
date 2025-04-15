import unauthorized from "../imgs/unauthorized.svg";

function Unauthorized() {
  return (
    <>
      <div id="unauthorized-container">
        <img src={unauthorized} alt="" />
        <span>You do not have authority to view this page.</span>
        <span>
          <a href="/">Go back home</a>
        </span>
      </div>
    </>
  );
}

export default Unauthorized;
