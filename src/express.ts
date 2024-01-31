import express from "./expresslib";

const server = express();

server.get("/api/countries", (req, res) => {
  res.json({
    data: ["Finnorszag", "Dania"],
  });
});

server.get("/api/cities", (req, res) => {
  res.json({
    data: ["Helsinki", "Koppenhaga"],
  });
});

server.listen(4001);
