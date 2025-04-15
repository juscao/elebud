import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "",
  port: 587,
  auth: {
    user: "",
    pass: "",
  },
});

const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const info = await transporter.sendMail({
      from: "",
      to: "",
      subject: `New Contact Form Message from ${name}`,
      text: message,
    });
    res.status(200).json({ message: "Form submitted." });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit form." });
  }
};

export default { submitContactForm };
