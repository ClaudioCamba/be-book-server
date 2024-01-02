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

      if (url === "/api/books") {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.write(JSON.stringify({ books: books }));
        response.end();
      } else {
        if (url.includes("/author")) {
          const bookId = url.split("/")[url.split("/").length - 2];
          let getAuthorId;
          books.forEach((book) => {
            if (book.bookId === Number(bookId)) {
              getAuthorId = book.authorId;
            }
          });
          readContent("./data/authors.json").then((data) => {
            const authors = JSON.parse(data);
            const doesntExist = authors.every((author) => {
              return author.authorId !== getAuthorId;
            });
            if (doesntExist) {
              response.statusCode = 404;
              response.end();
            } else {
              authors.forEach((author) => {
                if (author.authorId === getAuthorId) {
                  response.statusCode = 200;
                  response.setHeader("Content-Type", "application/json");
                  response.write(JSON.stringify({ author: author }));
                  response.end();
                }
              });
            }
          });
        } else if (url.includes("?fiction=")) {
          const isFiction = url.split('=')[1] === 'true'? true : false;
          const filteredBooks = books.filter((book)=> book.isFiction === isFiction);
          if (filteredBooks.length > 0) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.write(JSON.stringify({ book: filteredBooks }));
            response.end();
          } else {
            response.statusCode = 204;
            response.end();
          }
        } else {
          const bookId = url.split("/")[url.split("/").length - 1];
          const doesntExist = books.every((book) => {
            return book.bookId !== Number(bookId);
          });
          if (doesntExist) {
            response.statusCode = 404;
            response.end();
          } else {
            books.forEach((book) => {
              if (book.bookId === Number(bookId)) {
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
                response.write(JSON.stringify({ book: book }));
                response.end();
              }
            });
          }
        }
      }
    });
  }

  if (url === "/api/books" && method === "POST") {
    let body = "";
    request.on("data", (packet) => {
      body += packet;
    });
    request.on("end", () => {
      readContent("./data/books.json").then((fileContents) => {
        const allBooks = JSON.parse(fileContents);
        const newBook = JSON.parse(body);
        const doesntExist = allBooks.every((book) => {
          return book.bookId !== newBook.bookId;
        });
        if (doesntExist) {
          allBooks.push(JSON.parse(body));
          fs.writeFile(
            "./data/books.json",
            JSON.stringify(allBooks),
            "utf8"
          ).then(() => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.write(JSON.stringify({ books: newBook }));
            response.end();
          });
        } else {
          response.statusCode = 409;
          response.end();
        }
      });
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
