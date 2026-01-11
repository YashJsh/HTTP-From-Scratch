//Note : Node’s TCP server already handles multiple connections concurrently by default.
import net from "node:net";

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const rawRequest = data.toString();

        // Split request into lines
        const requestLines = rawRequest.split("\r\n");

        // Parse request line
        const requestLine = requestLines[0].split(" ");

        const method = requestLine[0];
        const requestPath = requestLine[1];
    

        console.log("Method:", method);
        console.log("Path:", requestPath);

        //Parse headers
        const headerLines = [];
        for (let i = 1; i < requestLines.length; i++) {
            if (requestLines[i] === "") {
                break; // end of headers
            }
            headerLines.push(requestLines[i]);
        }

        const headers = Object.fromEntries(
            headerLines.map((line) => {
                const index = line.indexOf(":");
                const key = line.slice(0, index).toLowerCase();
                const value = line.slice(index + 1).trim();
                return [key, value];
            })
        );
        console.log("Headers:", headers);
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
