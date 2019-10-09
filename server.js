let express = require("express");
let app = express();
let multer = require("multer");
let upload = multer();
let reloadMagic = require("./reload-magic.js");
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;
let dbo;
let result;
let url = require("./mongoUrl.js"); //your MongoDB url goes here
MongoClient.connect(url(), { useNewUrlParser: true }, (err, db) => {
  dbo = db.db("DiscGolfData");
});
const cheerio = require("cheerio");
const request = require("request");

reloadMagic(app);

app.use("/", express.static("build"));
app.use("/", express.static("public"));

app.post("/loadEventDetails", upload.none(), (req, resp) => {
  let id = req.body.id;
  request(
    { method: "GET", url: "https://www.pdga.com/tour/event/" + id },
    (err, res, body) => {
      let $ = cheerio.load(body);

      let MPOPlayers = [];
      let FPOPlayers = [];
      let title = $("#page-title").text();

      $("#tournament-stats-0")
        .find("tr")
        .each(function(i, e) {
          let player = $(this)
            .find("a")
            .text();
          let rating = $(this)
            .find(".player-rating")
            .text();
          let place = $(this)
            .find(".place")
            .text();
          let roundScores = [];
          $(this)
            .find(".round")
            .each(function(i, e) {
              console.log($(this).text());
              roundScores[i] = $(this).text();
            });
          MPOPlayers[i] = { [player]: { rating, place, roundScores } };
        });

      $("#tournament-stats-1")
        .find("tr")
        .each(function(i, e) {
          let player = $(this)
            .find("a")
            .text();
          let rating = $(this)
            .find(".player-rating")
            .text();
          let place = $(this)
            .find(".place")
            .text();
          let roundScores = [];
          $(this)
            .find(".round")
            .each(function(i, e) {
              console.log($(this).text());
              roundScores[i] = $(this).text();
            });
          FPOPlayers[i] = { [player]: { rating, place, roundScores } };
        });

      console.log(MPOPlayers);

      MPOPlayers = MPOPlayers.slice(1);
      FPOPlayers = FPOPlayers.slice(1);

      dbo
        .collection("Tournaments")
        .insertOne({ [title]: { MPO: MPOPlayers, FPO: FPOPlayers } });

      resp.send(
        JSON.stringify({
          success: true,
          MPO: MPOPlayers,
          FPO: FPOPlayers
        })
      );
    }
  );
});

app.all("/*", (req, res, next) => {
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
