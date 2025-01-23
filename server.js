const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(compression());

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

// MongoDB connection
const dbName = "HilltopDB";
const dbURI = process.env.MONGO_URL;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB database: ${dbName}`);
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "conventioncentrehilltop@gmail.com",
    pass: "hqcv kmno uxvl flfe",
  },
});

// Routes

app.get("/", async (req, res) => {
  res.send("Express on Vercel");
});

// Send email route
app.post("/send-email", async (req, res) => {
  const { subject, text } = req.body;

  const mailOptions = {
    to: "muneereb007@gmail.com", // Replace with recipient's email
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).send({ message: error.toString() });
    }
    res.status(200).send({ message: "Email sent: " + info.response });
  });
});

// Newsletter subscription route
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).send({ message: "Invalid email address." });
  }

  try {
    // Send customer's email to the company's email address
    const mailOptions = {
      to: "muneereb007@gmail.com", // Replace with the company's email address
      subject: "New Newsletter Subscription",
      text: `You have a new subscriber: ${email}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
        return res
          .status(500)
          .send({ message: "Failed to notify the company." });
      }
      res.status(200).send({
        message: "Subscription successful! The company has been notified.",
      });
    });
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).send({ message: "Failed to subscribe. Please try again." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
