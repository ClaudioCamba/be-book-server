const http = require("http");
const fs = require("fs/promises");

const readContent = async (filename) => {
  const getInfo = await fs.readFile(`./${filename}`, `utf8`);
  return getInfo;
};

const responseFunc = (response, status,  toWrite) => {
  response.statusCode = status;
  if (toWrite){
    response.setHeader("Content-Type", "application/json");
    response.write(toWrite);
  }
  response.end();
}


const server = http.createServer((request, response) => {
  const { method, url } = request;
  if (url === "/api" && method === "GET") {
    responseFunc(response, 200, JSON.stringify({ message: "Hello!" }));
  }

  if (url.includes("/api/books") && method === "GET") {
    readContent("./data/books.json").then((data) => {
      const books = JSON.parse(data);

      if (url === "/api/books") {
        responseFunc(response, 200, JSON.stringify({ books: books }));
 
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
              responseFunc(response, 404, null);
            } else {
              authors.forEach((author) => {
                if (author.authorId === getAuthorId) {
                  responseFunc(response, 200, JSON.stringify({ author: author }));
                }
              });
            }
          });
        } else if (url.includes("?fiction=")) {
          const fictionQuery = url.split("=")[1]
          if(fictionQuery === "true" || fictionQuery === "false"){
            const isFiction = fictionQuery === "true" ? true : false;
            const filteredBooks = books.filter(
              (book) => book.isFiction === isFiction
            );
            if (filteredBooks.length > 0) {
              responseFunc(response, 200, JSON.stringify({ book: filteredBooks }));
            }
          }

          responseFunc(response, 204, null);

        } else {
          const bookId = url.split("/")[url.split("/").length - 1];
          const doesntExist = books.every((book) => {
            return book.bookId !== Number(bookId);
          });
          if (doesntExist) {
            responseFunc(response, 404, null);
          } else {
            books.forEach((book) => {
              if (book.bookId === Number(bookId)) {
                responseFunc(response, 200, JSON.stringify({ book: book }));
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
      const newBook = JSON.parse(body);
      const hasKeys = ["bookId", "bookTitle", "authorId", "isFiction"].every(
        (key) => {
          return newBook.hasOwnProperty(key);
        }
      );
      if (!hasKeys) {
        responseFunc(response, 400, null);
      } else {
        readContent("./data/books.json").then((fileContents) => {
          const allBooks = JSON.parse(fileContents);
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
              responseFunc(response, 200, JSON.stringify({ books: newBook }));
            });
          } else {
            responseFunc(response, 409, null);
          }
        });
      }
    });
  }

  if (url === "/api/authors" && method === "GET") {
    readContent("./data/authors.json").then((data) => {
      const authors = JSON.parse(data);
      responseFunc(response, 200, JSON.stringify({ authors: authors }));
    });
  }
});

server.listen(8080, (err) => {
  if (err) console.log(err);
  else console.log("server is listening on 8080...");
});
