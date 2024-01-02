const http = require("http");
const fs = require("fs/promises");

const server = http.createServer((request, response) => {
  const { method, url } = request;
  console.log(method);
  console.log(url);
  if (url === "/api" && method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.write(JSON.stringify({ message: "Hello!" }));
    response.end();
  }
  if (url === "/api/books" && method === "GET") {
    const readContent = async (filename) => {
      const getInfo = await fs.readFile(`./${filename}`, `utf8`);
      return getInfo;
    };
    readContent("./data/books.json").then((data) => {
      const books = JSON.parse(data);
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json");
      response.write(JSON.stringify({ books: books }));
      response.end();
    });
  }
});

server.listen(8080, (err) => {
  if (err) console.log(err);
  else console.log("server is listening on 8080...");
});

// GET /api/books
// Add a GET /api/books endpoint that responds with a status 200 and a JSON object that has a key of books with a value of the array of books from the ./data/books.json file.
