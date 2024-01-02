const http = require("http");
const fs = require("fs/promises");

const readContent = async (filename) => {
  const getInfo = await fs.readFile(`./${filename}`, `utf8`);
  return getInfo;
};

const server = http.createServer((request, response) => {
  const { method, url } = request;
  if (url === "/api" && method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.write(JSON.stringify({ message: "Hello!" }));
    response.end();
  }

  if (url.includes("/api/books") && method === "GET") {
    readContent("./data/books.json").then((data) => {
      const books = JSON.parse(data);

      if (url === "/api/books"){
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.write(JSON.stringify({ books: books }));
        response.end();
      } else {
        const bookId = url.split("/")[url.split("/").length - 1];
        
        books.forEach((book) => { 
          if (book.bookId === Number(bookId)){
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.write(JSON.stringify({ book: book }));
            response.end();
          }
        })
      }

    });
  }

  if (url === "/api/authors" && method === "GET") {
    readContent("./data/authors.json").then((data) => {
      const authors = JSON.parse(data);
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json");
      response.write(JSON.stringify({ authors: authors }));
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
