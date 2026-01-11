import net from "node:net";

const server = net.createServer((socket)=>{
	socket.on('data', (data) => {
        console.log(data.toString());
        const response = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n\r\n"
        const encoding = new TextEncoder().encode(response);
        socket.write(encoding);
});
})

server.listen(3000, () => {
    console.log("server bound");
});