import net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const rawRequest = data.toString();

    // Extract request line
    const requestLine = rawRequest.split("\r\n")[0];
    const requestParts = requestLine.split(" ");

    const method = requestParts[0];
    const requestPath = requestParts[1];

    console.log("Method:", method);
    console.log("Path:", requestPath);

    // Route: /
    if (requestPath === "/") {
      const responseBody = "Users\r\n\r\n";
      const response =
        `HTTP/1.1 200 OK\r\n` +
        `Content-Length: ${responseBody.length}\r\n\r\n` +
        responseBody;

      const encodedResponse = new TextEncoder().encode(response);
      socket.write(encodedResponse);
      return;
    }

    // Route: /health
    if (requestPath === "/health") {
      const responseBody = "OK\r\n\r\n";
      const response =
        `HTTP/1.1 200 OK\r\n` +
        `Content-Length: ${responseBody.length}\r\n\r\n` +
        responseBody;

      const encodedResponse = new TextEncoder().encode(response);
      socket.write(encodedResponse);
      return;
    }

    // Default response
    const responseBody = "Not Found\r\n\r\n";
    const response =
      `HTTP/1.1 200 OK\r\n` +
      `Content-Length: ${responseBody.length}\r\n\r\n` +
      responseBody;

    const encodedResponse = new TextEncoder().encode(response);
    socket.write(encodedResponse);
    
  });

  socket.on("end", () => {
    console.log("client disconnected");
  });
});

server.listen(3000, () => {
  console.log("server bound");
});
