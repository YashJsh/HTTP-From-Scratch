import net from "node:net";

const server = net.createServer((socket)=>{
	socket.on("data", (data)=>{
        console.log(data.toString());
	});
})

server.listen(3000, () => {
    console.log("server bound");
});