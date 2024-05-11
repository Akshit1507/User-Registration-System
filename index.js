import express from "express";
import path from "path";
import { config } from "dotenv";

const app = express();
config({
  path: "./config.env",
});

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/success", (req, res) => {
  res.render("success.ejs");
});
app.get("/failure", (req, res) => {
  res.render("failure.ejs");
});

app.post("/register", async (req, res) => {
  try {
    // Process the form data
    const { Name, Email } = req.body;

    // Prepare the data to send to Klaviyo
    const data = {
      profiles: [{ email: Email, $first_name: Name.split(" ")[0] }],
    };

    // Make a POST request to Klaviyo API
    const response = await fetch(
      `https://a.klaviyo.com/api/v2/list/${process.env.LIST_ID}/members?api_key=${process.env.PRIVATE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    // Check if the request was successful
    if (response.ok) {
      console.log("User added to Klaviyo successfully");
      // Handle successful registration (redirect or send response)
      //   res.status(200).send("User registered successfully");
      res.render("success.ejs");
    } else {
      // Handle error response from Klaviyo API
      const errorData = await response.json();
      console.error("Error adding user to Klaviyo:", errorData);
      //res.status(500).send("Error registering user");
      res.render("failure.ejs");
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
