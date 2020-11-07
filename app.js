require("dotenv").config();
const express = require("express");
const request = require("request");
const bp = require("body-parser");
const https = require("https");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bp.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// post request for the route "/" (home)
app.post("/", (req, res) => {
  const firstName = req.body.fn;
  const lastName = req.body.ln;
  const email = req.body.email;

  //body parameters to send the data to mailchimp
  const data = {
    //members: An array of objects, each representing an email address and the subscription status for a specific list. Up to 500 members may be added or updated with each API call.
    members: [
      {
        //properties of members
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const JSONdata = JSON.stringify(data);
  const url = "https://us2.api.mailchimp.com/3.0/lists/" + process.env.LIST_ID;
  const Auth = "anser:" + process.env.API_KEY;
  const options = {
    method: "POST",
    auth: Auth,
  };
  
  const request = https.request(url, options, (response) => {
    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
  });
  request.write(JSONdata);
  request.end();
});

// post request for the route "/failure"
app.post("/failure", (req, res) => {
  // redirect the route "/failure" to "/" (home)
  res.redirect("/");
});

//process.env.PORT: Heroku will be the one deciding the port to deploy this website
app.listen(process.env.PORT || port, (req, res) => {
  console.log("server is running on port " + port);
});
