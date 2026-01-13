# HTTP Server from Scratch (Raw TCP)

This repository documents my journey of building an **HTTP/1.1 server from scratch**, directly on top of **TCP sockets**, without using frameworks like Express, Fastify, or Node’s `http` module.

This is a **learning-first project**.

The code is not written to be “perfect” from day one.  
Instead, it evolves **stage by stage**, showing how understanding of HTTP and TCP deepens over time.

---

## Why I built this

I had used HTTP servers and frameworks for a long time, but I wanted to understand:

- how HTTP requests actually arrive over TCP
- why body parsing is hard
- what keep-alive really means
- how multiple requests work on one connection
- what frameworks are abstracting away

So I decided to build everything manually.

---

## Important note (read this first)

This is **not production-ready code**.

Some early stages contain:
- naive parsing
- unsafe assumptions
- incomplete protocol handling

This is **intentional**.

The goal is to show:
> how mistakes happen, why they break, and how they get fixed.

---

## How to read this repository

- Each **stage** corresponds to a logical milestone
- Each stage is represented by:
  - a **git commit**

## Stages Overview

### Stage 1 — Bind to a Port
- Created a raw TCP server using Node’s `net` module
- Learned that TCP provides bytes, not requests

---

### Stage 2 — Respond with HTTP 200
- Manually wrote an HTTP response
- Learned about:
  - HTTP status lines
  - CRLF (`\r\n`) line endings

---

### Stage 3 — Extract Request Line
- Parsed the HTTP method and path from raw request text
- First exposure to the HTTP request format

---

### Stage 4 — Respond with Body
- Added a response body
- Learned why `Content-Length` is required

---

### Stage 5 — Read Request Headers
- Parsed headers line-by-line
- Converted headers into a key–value object
- Understood header termination via a blank line

---

### Stage 6 — Concurrent Connections
- Tested multiple clients connecting simultaneously
- Learned that Node.js handles concurrent TCP sockets by default
- No code changes required — this was a conceptual stage

---

### Stage 7 — Return a File
- Implemented basic file serving (`/file/:name`)
- Learned why naïve file access is dangerous
- Later added basic path resolution safety

---

### Stage 8 — Read Request Body
- Stopped using string-based parsing
- Started working with `Buffer`s
- Implemented body reading using `Content-Length`
- Learned that TCP data can arrive in chunks

This stage introduced real complexity.

---

### Stage 9 — HTTP Compression
- Implemented gzip compression using `Accept-Encoding`
- Learned about content negotiation
- Learned that compressed responses must be sent as raw bytes

---

### Stage 10 — Persistent Connections (Keep-Alive)
- Learned that HTTP requests ≠ TCP connections
- Implemented loop-based parsing
- Supported multiple requests on the same socket

Biggest conceptual shift in the project.

---

### Stage 11 — Concurrent Persistent Connections
- Multiple clients, each using keep-alive connections
- Verified that per-socket state isolation works
- Stress-tested with concurrent `curl` requests

---

### Stage 12 — Proper Connection Closure
- Implemented `Connection: close`
- Ensured sockets close only when required
- Finalized correct HTTP/1.1 connection lifecycle

---

## What this project taught me

- TCP is a stream, not a message protocol
- HTTP parsing must be incremental
- Buffer management is critical
- Most bugs come from incorrect assumptions about boundaries
- Frameworks exist for good reasons

## What this server supports

- HTTP/1.1 request parsing
- Request bodies via Content-Length
- Gzip compression
- Keep-alive connections
- Concurrent clients
- Proper connection teardown

## How to Run

Start the server:

```bash
node index.js
```

## Test Examples 

```base
curl localhost:8080/health
curl --http1.1 localhost:8080/health localhost:8080/health
curl -X POST localhost:8080/health -d "hello"
curl -H "Accept-Encoding: gzip" localhost:8080/health --compressed
curl -H "Connection: close" localhost:8080/health
```