import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Contact(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submitContactForm() {
    document.title = "Contact | Elebud";
    try {
      const response = await fetch("api/v1/contact", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      if (response.ok) {
        alert("Form submitted.");
        setName("");
        setEmail("");
        setMessage("");
        setSending(false);
      } else {
        alert("Unable to submit form. Please try again.");
        setSending(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="wrapper">
      <Navbar user={props.user} logoutUser={props.logoutUser} />
      <div id="contact-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!sending) {
              setSending(true);
              submitContactForm();
            }
          }}
          className={sending ? "sending" : "not-sending"}
          aria-label="contact form"
        >
          <h2>Contact</h2>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={sending ? null : (e) => setName(() => e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={
                sending
                  ? null
                  : (e) => {
                      setEmail(() => e.target.value);
                    }
              }
            />
          </div>
          <div>
            <label htmlFor="message">Message:</label>
            <textarea
              name="message"
              required
              value={message}
              onChange={
                sending
                  ? null
                  : (e) => {
                      setMessage(() => e.target.value);
                    }
              }
            />
          </div>
          <button type="submit">{sending ? "Submitting..." : "Submit"}</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;
