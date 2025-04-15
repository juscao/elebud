import Navbar from "./Navbar";
import Footer from "./Footer";

function FAQ(props) {
  return (
    <div className="wrapper">
      <Navbar user={props.user} logoutUser={props.logoutUser} />
      <div id="faq-container">
        <h1>Frequently Asked Questions</h1>
        <div>
          <h2>
            I. What advantages can Elebud provide over professional software
            like Microsoft Excel?
          </h2>
          <p>
            Our application has an extremely low barrier to entry and is
            completely free to use. If you don't like it, no harm done—you can
            always explore another application that better suits your needs.
          </p>
        </div>
        <div>
          <h2>
            II. I have suggestions and/or feedback. Where can I get in contact?
          </h2>
          <p>
            You can head over to our <a href="/contact">contact page</a> where
            you can submit your feedback or report any issues.
          </p>
        </div>
        <div>
          <h2>III. Why is the logo an elephant?</h2>
          <p>
            I was just brainstorming names and things like "Finance Cat" popped
            into my mind, but I recently went to Cambodia and the elephant is
            extremely prominent in their culture so I thought to do something
            with that. The "bud" is short for budget. It's easy to say and easy
            to remember.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default FAQ;
