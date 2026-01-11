import net from "node:net";

//NOTE : Took the help of AI Here to refactor the code better;
const server = net.createServer((socket) => {
  let buffer = Buffer.alloc(0);
  let headersParsed = false;
  let headers = {};
  let contentLength = 0;
  let bodyBuffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    // Accumulate raw bytes
    buffer = Buffer.concat([buffer, chunk]);

    // Parse headers once
    if (!headersParsed) {
      const boundary = Buffer.from("\r\n\r\n");
      const boundaryIndex = buffer.indexOf(boundary);

      if (boundaryIndex === -1) {
        return; // headers not complete yet
      }

      // Split headers and body start
      const headerPart = buffer.slice(0, boundaryIndex).toString();
      const bodyStart = buffer.slice(boundaryIndex + boundary.length);

      const lines = headerPart.split("\r\n");
      const [method, requestPath] = lines[0].split(" ");

      headers = Object.fromEntries(
        lines.slice(1).map((line) => {
          const index = line.indexOf(":");
          return [
            line.slice(0, index).toLowerCase(),
            line.slice(index + 1).trim(),
          ];
        })
      );

      contentLength = Number(headers["content-length"] || 0);
      headersParsed = true;

      bodyBuffer = Buffer.concat([bodyBuffer, bodyStart]);
      buffer = Buffer.alloc(0);

      console.log("Method:", method);
      console.log("Path:", requestPath);
      console.log("Headers:", headers);
    } else {
      // Continue reading body
      bodyBuffer = Buffer.concat([bodyBuffer, buffer]);
      buffer = Buffer.alloc(0);
    }

    // Body fully received
    if (headersParsed && bodyBuffer.length >= contentLength) {
      const requestBody = bodyBuffer
        .slice(0, contentLength)
        .toString();

      console.log("Body:", requestBody);

      // Simple response (same for all routes)
      const responseBody = "OK";
      const response =
        `HTTP/1.1 200 OK\r\n` +
        `Content-Length: ${responseBody.length}\r\n\r\n` +
        responseBody;

      socket.write(response);

      // Reset state (no keep-alive handling yet)
      headersParsed = false;
      bodyBuffer = Buffer.alloc(0);
    }
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(3000, () => {
  console.log("server bound");
});
