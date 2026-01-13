
import net from 'node:net';
import fs from "fs";
import path from "node:path";
import zlib from "zlib";

//Stage - 11 : Concurrent persistent connections.
//For this our code, doesn't need any change as our code already heandles concurrent persistent connetions.

const FILE_ROOT = path.resolve("./files");

const server = net.createServer((socket) => {
    // Creating a buffer
    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
        //Total data is in buffer now
        buffer = Buffer.concat([buffer, chunk]);

        while (true) {
            const boundary = Buffer.from("\r\n\r\n"); // it's like how to write \r\n\r\n in buffer 
            const idx = buffer.indexOf(boundary); //finding this boundary in buffer

            //Headers are not completed yet
            if (idx === -1) {
                break;
            }

            //Split headers 
            const headerPart = buffer.slice(0, idx).toString();

            //Parse the header;
            const lines = headerPart.split("\r\n");
            const [method, path] = lines[0].split(" ");

            //Headers 
            const headers = Object.fromEntries(
                lines.slice(1).map((line) => {
                    const i = line.indexOf(":");
                    return [
                        line.slice(0, i).toLowerCase(),
                        line.slice(i + 1).trim(),
                    ];
                })
            );

            const contentLength = Number(headers["content-length"] || 0);

            //Check if full body is available : 
            const totalRequestLength = idx + 4 + contentLength;
            if (buffer.length < totalRequestLength) break;

            const body = buffer.slice(idx + 4, totalRequestLength).toString();

            console.log("METHOD:", method);
            console.log("PATH:", path);
            console.log("HEADERS:", headers);
            console.log("BODY:", body);

            const responseBody = Buffer.from("OK");
            const acceptsGzip = headers["accept-encoding"]?.includes("gzip");

            if (acceptsGzip) {
                const gzipped = zlib.gzipSync(responseBody);
                socket.write(
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Length: ${gzipped.length}\r\n` +
                    `Content-Encoding: gzip\r\n\r\n`
                );
                socket.write(gzipped);
            } else {
                socket.write(
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Length: ${responseBody.length}\r\n\r\n`
                );
                socket.write(responseBody);
            }
            buffer = buffer.slice(totalRequestLength);
        }
    });
    socket.on('end', () => {
        console.log('client disconnected');
    });
});

server.on('error', (err) => {
    throw err;
});

server.listen(8080, () => {
    console.log('server bound');
});

const read = (filepath) => {
    return fs.promises.readFile(filepath, 'utf8');
};
