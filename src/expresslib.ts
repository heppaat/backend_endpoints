import http from "http";

type Response = {
  json: (data: any) => void;
};

export const express = () => {
  let getRequestURLs: string[] = [];
  let responseDatas: any[] = [];

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (getRequestURLs.includes(req.url!)) {
      let index = getRequestURLs.indexOf(req.url!);
      return res.end(JSON.stringify(responseDatas[index]));
    }
    res.end(
      JSON.stringify({
        data: "Invalid input HAHA",
      })
    );
  });

  return {
    get: (
      url: string,
      requestListenerFunction: (req: unknown, res: Response) => void
    ) => {
      getRequestURLs = [...getRequestURLs, url];
      requestListenerFunction(null, {
        json: (data) => {
          responseDatas = [...responseDatas, data];
        },
      });
    },
    listen: (port: number) => {
      server.listen(port);
    },
  };
};

export default express;
