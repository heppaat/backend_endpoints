import http from "http";

const server = http.createServer((req, res) => {
  if (req.url === "/api/countries") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        data: ["Finnorszag", "Dania"],
      })
    );
  }
  if (req.url === "/api/cities") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        data: ["Helsinki", "Koppenhaga"],
      })
    );
  }

  res.end(
    JSON.stringify({
      data: "Invalid url",
    })
  );
});

server.listen(4000);
