
import net from 'node:net';
import fs from "fs";
import path from "node:path";
import zlib from "zlib";

const FILE_ROOT = path.resolve("./files");

const server = net.createServer((socket) => {
    // Creating a buffer
    let buffer = Buffer.alloc(0);
    // Making head parsed to be false
    let headersParsed = false;
    let contentLength = 0;
    let contentEncoding = null;
    let headers = {};
    let bodyBuffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
        //Total data is in buffer now
        buffer = Buffer.concat([buffer, chunk]);

        //2. Parsing headers only
        if (!headersParsed) {
            const boundary = Buffer.from("\r\n\r\n"); // it's like how to write \r\n\r\n in buffer 
            const idx = buffer.indexOf(boundary); //finding this boundary in buffer

            //Headers are not completed yet
            if (idx === -1) {
                return;
            }

            //Split headers and body
            const headerPart = buffer.slice(0, idx).toString();

            const bodyPart = buffer.slice(idx + boundary.length);


            //Parse the header;
            const lines = headerPart.split("\r\n");
            const [method, path] = lines[0].split(" ");

            //Headers 
            headers = Object.fromEntries(
                lines.slice(1).map((line) => {
                    const i = line.indexOf(":");
                    return [
                        line.slice(0, i).toLowerCase(),
                        line.slice(i + 1).trim(),
                    ];
                })
            );

            contentLength = Number(headers["content-length"] || 0);
            contentEncoding = headers["accept-encoding"];
            headersParsed = true;

            //Put body in bodybuffer
            bodyBuffer = Buffer.concat([bodyBuffer, bodyPart]);

            buffer = Buffer.alloc(0);
            console.log("METHOD:", method);
            console.log("PATH:", path);
            console.log("HEADERS:", headers);
        } else {
            // 3. Accumulate body bytes
            bodyBuffer = Buffer.concat([bodyBuffer, buffer]);
            buffer = Buffer.alloc(0);
        }
        if (headersParsed && bodyBuffer.length >= contentLength) {
            const body = bodyBuffer.slice(0, contentLength).toString();
            console.log("BODY:", body);

            const acceptsGzip =
                headers["accept-encoding"] &&
                headers["accept-encoding"].includes("gzip");

            const responseBody = Buffer.from("OK");
            if (acceptsGzip) {
               
                const gzipped = zlib.gzipSync(responseBody);
                socket.write(
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Length: ${gzipped.length}\r\n` +
                    `Content-Encoding: ${contentEncoding}\r\n\r\n`
                );
                socket.write(gzipped);
            } else {
                socket.write(
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Length: ${responseBody.length}\r\n\r\n`
                );
                socket.write(responseBody);
            }

            // reset for next request (keep-alive later)
            headersParsed = false;
            bodyBuffer = Buffer.alloc(0);
        }
    });
    socket.on('end', () => {
        console.log('client disconnected');
    });
});

server.on('error', (err) => {
    throw err;
});

server.listen(3000, () => {
    console.log('server bound');
});

const read = (filepath) => {
    return fs.promises.readFile(filepath, 'utf8');
};
