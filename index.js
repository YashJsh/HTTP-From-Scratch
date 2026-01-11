import net from "node:net";
import fs from "node:fs";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const rawRequest = data.toString();

    // Parse request line
    const requestLine = rawRequest.split("\r\n")[0];
    const [method, requestPath] = requestLine.split(" ");

    console.log("Method:", method);
    console.log("Path:", requestPath);

    // Route: serve files
    if (requestPath.startsWith("/file/")) {
      const fileName = requestPath.replace("/file/", "");

      fs.readFile(`./files/${fileName}`, "utf8", (err, fileData) => {
        if (err) {
          const responseBody = "Not Found";
          const response =
            `HTTP/1.1 404 Not Found\r\n` +
            `Content-Length: ${responseBody.length}\r\n\r\n` +
            responseBody;

          socket.write(response);
          return;
        }

        const response =
          `HTTP/1.1 200 OK\r\n` +
          `Content-Length: ${fileData.length}\r\n\r\n` +
          fileData;

        socket.write(response);
      });

      return;
    }

    // Route: /health
    if (requestPath === "/health") {
      const responseBody = "OK";
      const response =
        `HTTP/1.1 200 OK\r\n` +
        `Content-Length: ${responseBody.length}\r\n\r\n` +
        responseBody;

      socket.write(response);
      return;
    }

    // Default response
    const responseBody = "Not Found";
    const response =
      `HTTP/1.1 200 OK\r\n` +
      `Content-Length: ${responseBody.length}\r\n\r\n` +
      responseBody;

    socket.write(response);
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(3000, () => {
  console.log("server bound");
});
