import net from "node:net";

const server = net.createServer((socket)=>{
	socket.on('data', (data) => {
        const raw = data.toString();
        const headers  = raw.split("\r\n")[0].split(" ");
        const method = headers[0];
        const path = headers[1];
        console.log("Method: ",method);
        console.log("Path: ", path);
        const response = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n"
        const encoding = new TextEncoder().encode(response);
        socket.write(encoding);
});
})

server.listen(3000, () => {
    console.log("server bound");
});