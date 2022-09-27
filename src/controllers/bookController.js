const mongoose = require('mongoose')
const moment = require('moment');
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const { isValid, isValidObjectId, regexIsbn, regexDate } = require("../validators/validator")

// -----------------------------------------------------------------------------------------------------------------------
const createBook = async function (req, res) {
    try {
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, deletedAt, isDeleted, releasedAt } = data;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide some data to create user" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "please provide a title" })
        }
        let checkTitle = await bookModel.findOne({ title })
        if (checkTitle) return res.status(400).send({ status: false, message: "book with same title is already present...!" })

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "please provide a excerpt" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "please provide userId" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "please provide  valid userId" })
        }
        let decodedId = req.token.userId
        if (decodedId !== userId) {

            return res.status(403).send({ status: false, msg: "unauthorised access" })
        }
        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, msg: "userId not found" })

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "please provide a ISBN" })
        }
        if (!regexIsbn.test(ISBN)) {
            return res.status(400).send({ status: false, msg: "please provide Valid ISBN" })
        }
        let checkISBN = await bookModel.findOne({ ISBN })
        if (checkISBN) return res.status(400).send({ status: false, message: "book with same ISBN is already present...!" })

        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "please provide category" })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "please provide subcategory" })
        }

        if (reviews) {
                reviews = 0
        }

        if (isDeleted) {
            if (!typeof isDeleted == Boolean) {
                return res.status(400).send({ status: false, msg: "isDeleted only in boolean" })
            } else {
                isDeleted = false
            }
        }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, msg: "please provide releasedAt in proper format" })
        }
        if (!regexDate.test(releasedAt)) {
            return res.status(400).send({ status: false, msg: "please provide Valid Date" })
        }

        let bookdata = { title, excerpt, userId, ISBN, category, subcategory, reviews, deletedAt, isDeleted, releasedAt }
        let saveBook = await bookModel.create(bookdata);
        return res.status(201).send({ status: true, msg: "book created successfully", data: saveBook })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
// --------------------------------------------------------------------------------------------------------------------
const getBooks = async function (req, res) {
    try {
        const { userId, category, subcategory } = req.query
        const filterBook = { isDeleted: false }
        if (userId || userId == "") {
            if (!isValid(userId)) {
                return res.status(400).send({ status: false, message: "Invalid userId" })
            }
            filterBook["userId"] = userId
        }
        if (category) {
            if (!isValid(category)) {
                return res.status(400).send({ status: false, message: "Invalid category" })
            }
            filterBook["category"] = category
        }
        if (subcategory) {
            if (!isValid(subcategory)) {
                return res.status(400).send({ status: false, message: "Invalid subcategory" })
            }

            filterBook['subcategory'] = subcategory
        }
        let returnBooks = await bookModel.find(filterBook).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
        if (Object.keys(returnBooks).length == 0) {
            return res.status(404).send({ status: false, message: " book not found" })
        }
        else {
            return res.status(200).send({ status: true, message: 'Books list', data: returnBooks })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
// -------------------------------------------------------------------------------------------------------------------
const getBooksWithReview = async function (req, res) {
    try {
        let obj = {}
        let bookId = req.params.bookId

        if (!isValid(bookId)) return res.status(400).send({ status: false, msg: "Please enter valid book id" })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Please Enter correct Book Id" })

        const getBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!getBook) {
            return res.status(404).send({ status: false, message: "Book Not Found" })
        }
        obj._id = getBook._id
        obj.title = getBook.title
        obj.excerpt = getBook.excerpt
        obj.userId = getBook.userId
        obj.category = getBook.category
        obj.subcategory = getBook.subcategory
        obj.isDeleted = getBook.isDeleted
        obj.reviews = getBook.reviews
        obj.releasedAt = getBook.releasedAt
        obj.createdAt = getBook.createdAt
        obj.updatedAt = getBook.updatedAt

        const getReviewData = await reviewModel.find({ bookId: getBook._id, isDeleted: false })
        if (!getReviewData) {
            return res.status(404).send({ status: false, msg: "review not found" })
        }
        obj.reviewsData = getReviewData

        return res.status(200).send({ status: true, message: "Books List", data: obj })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------
const updateBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!isValid(bookId)) return res.status(400).send({ status: false, msg: "please enter valid book id" })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Please Enter correct Book Id" })

        const bookIdExist = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookIdExist) return res.status(404).send({ status: false, message: "Book Not Found" })

        let bodyData = req.body
        let { title, excerpt, releasedAt, ISBN } = bodyData
        if (Object.keys(bodyData).length == 0) return res.status(400).send({ status: false, message: "Please Enter Required Data" })

        let filter = {}

        if (Object.values(bodyData).includes(title)) {
            if (!isValid(title))
                return res.status(400).send({ status: false, msg: "please provide title in proper format" })

            let checkTitle = await bookModel.findOne({ title })
            if (checkTitle) return res.status(400).send({ status: false, message: "book with same title is already present...!" })
            filter.title = title

        }

        if (Object.values(bodyData).includes(excerpt)) {
            if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "please provide a excerpt" })
            filter.excerpt = excerpt
        }


        if (Object.values(bodyData).includes(releasedAt)) {
            if (!regexDate.test(releasedAt)) {
                return res.status(400).send({ status: false, message: "please provide  date in proper format" })
            }
            filter.releasedAt = releasedAt
        }

        if (Object.values(bodyData).includes(ISBN)) {
            if (!regexIsbn.test(ISBN)) return res.status(400).send({ status: false, msg: "please provide Valid ISBN" })

            let checkISBN = await bookModel.findOne({ ISBN })
            if (checkISBN) return res.status(400).send({ status: false, message: "book with same ISBN is already present...!" })
            filter.ISBN = ISBN
        }

        const update = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: filter  },
            { new: true })

        return res.status(200).send({ status: true, message: "Update Book Successfully", data: update })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
// -------------------------------------------------------------------------------------------------------------------------------------

const deleteBookByParam = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if(!isValid(bookId)) return res.status(400).send({status: false, msg: "please enter valid book id"})
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "please provide  valid bookId" })
        }

        let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBook) {
            return res.status(404).send({ status: false, message: "Book not found" })
        }

        let deletebook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } })
        return res.status(200).send({ status: true, message: "deleted successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createBook, getBooksWithReview, getBooks, updateBook, deleteBookByParam }
