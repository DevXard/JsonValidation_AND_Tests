process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book;

beforeEach( async () => {
    const result = await db.query(
        `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ('06911631518', 'http:// amazonco.com/r2r34t', 'Gorge Lane', 'english', 322, 'Some University', 'Learn to Clumb', 2017) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`);
    book = result.rows[0]
    
})

afterEach(async () => {
    await db.query(`DELETE FROM books`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /books", () =>{
    test("Shoud get all books", async () => {
        const result = await request(app).get('/books')
        
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({books: [book]})
        expect(result.body.books.length).toBe(1)
        expect(Array.isArray(result.body.books)).toBe(true)
    })
})

describe("GET /books/id", () =>{
    test("Shoud get book by id", async () => {
        const result = await request(app).get(`/books/${book.isbn}`)
        
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({book: book})
    })
    test('Responds with 404 if invalid id', async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe("POST /books/", () => {
    test("Shoud create newBook", async () => {
        const res = await request(app).post('/books/').send({
            "isbn": "06911631518",
	        "amazon_url": "http:// amazonco.com/r2r34t",
            "author": "Gorge Lane",
            "language": "english",
            "pages": 322,
            "publisher": "Some University",
            "title": "Learn to Clumb",
            "year": 2017
        })

        expect(res.statusCode).toBe(201)
        expect(res.body.msg.instance).toEqual({
            "isbn": "06911631518",
	        "amazon_url": "http:// amazonco.com/r2r34t",
            "author": "Gorge Lane",
            "language": "english",
            "pages": 322,
            "publisher": "Some University",
            "title": "Learn to Clumb",
            "year": 2017
        })
    })

    test("Shoud fail to create newBook", async () => {
        const res = await request(app).post('/books/').send({
            "isbn": "06911631518",
	        "amazon_url": "http:// amazonco.com/r2r34t",
            "author": "Gorge Lane",
            "language": "english",
            "pages": "322",
            "publisher": "Some University",
            "title": "Learn to Clumb",
            "year": 2017
        })
        expect(res.statusCode).toBe(400)
    })
})

describe("PUT /books/id", () => {
    test("Shoud update book", async () => {
        const res = await request(app).put(`/books/${book.isbn}`).send({
            "isbn": "06911631518",
	        "amazon_url": "http:// amazonco.com/r2r34t",
            "author": "Bruno Lane",
            "language": "english",
            "pages": 322,
            "publisher": "Some University",
            "title": "Learn to Clumb",
            "year": 2017
        })
        expect(res.statusCode).toBe(200)
        expect(res.body.book.author).toEqual("Bruno Lane")
    })
    test("Shoud fail to update newBook", async () => {
        const res = await request(app).put(`/books/${book.isbn}`).send({
            "isbn": "06911631518",
	        "amazon_url": "http:// amazonco.com/r2r34t",
            "author": "Gorge Lane",
            "language": "english",
            "pages": "322",
            "publisher": "Some University",
            "title": "Learn to Clumb",
            "year": 2017
        })
        expect(res.statusCode).toBe(400)
    })
})

describe("DELETE /books/id",  () => {
    test("Shoud delete book", async () => {
        const res = await request(app).delete(`/books/${book.isbn}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ message: "Book deleted" }
        )
    })
})