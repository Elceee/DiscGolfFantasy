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
      let MPORatings = [];
      let FPOPlayers = [];
      let FPORatings = [];
      let title = $("#page-title").text();

      $("#tournament-stats-0")
        .find("a")
        .each(function(i, e) {
          MPOPlayers[i] = $(this).text();
        });

      $("#tournament-stats-0")
        .find(".player-rating")
        .each(function(i, e) {
          MPORatings[i] = $(this).text();
        });

      $("#tournament-stats-1")
        .find("a")
        .each(function(i, e) {
          FPOPlayers[i] = $(this).text();
        });

      $("#tournament-stats-1")
        .find(".player-rating")
        .each(function(i, e) {
          FPORatings[i] = $(this).text();
        });

      MPORatings = MPORatings.slice(1);
      FPORatings = FPORatings.slice(1);

      let amalgamatedMPO = [];
      let amalgamatedFPO = [];

      for (players = 0; players < MPOPlayers.length; players++) {
        let object = {
          playerName: MPOPlayers[players],
          rating: MPORatings[players]
        };
        amalgamatedMPO.push(object);
      }

      for (players = 0; players < FPOPlayers.length; players++) {
        let object = {
          playerName: FPOPlayers[players],
          rating: FPORatings[players]
        };
        amalgamatedFPO.push(object);
      }

      dbo
        .collection("Tournaments")
        .insertOne({ [title]: { MPO: amalgamatedMPO, FPO: amalgamatedFPO } });

      resp.send(
        JSON.stringify({
          success: true,
          MPO: amalgamatedMPO,
          FPO: amalgamatedFPO
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
