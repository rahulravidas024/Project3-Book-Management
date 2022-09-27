const mongoose = require('mongoose')
const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const { isValid, isValidObjectId, onlyNumbers, regexName, regexDate } = require("../validators/validator")

const createReview = async function (req, res) {
    try {
        let Obj = {}
        let bookId = req.params.bookId
        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "please provide valid book id" })
        }
        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, mgs: "please provide valid book id" })
        let checkId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkId)
            return res.status(404).send({ status: false, msg: "book not found" })

        let data = req.body
        let { reviewedBy, reviewedAt, rating, review, isDeleted } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide some data to create review" })
        }
        Obj.bookId = bookId

        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "reviewers name is in proper format" })
            }
            if (!regexName.test(reviewedBy))
                return res.status(400).send({ status: false, msg: "reviewers name is invalid" })

            Obj.reviewedBy = req.body.reviewedBy
        } else {
            Obj.reviewedBy = "Guest"
        }

        if (reviewedAt) {
            if (!regexDate.test(reviewedAt)) {
                return res.status(400).send({ status: false, msg: "please provide valid date" })
            }
            Obj.reviewedAt = reviewedAt
        }
        if (!reviewedAt) {
            Obj.reviewedAt = Date.now()
        }

        if (!rating) {
            return res.status(400).send({ status: false, msg: "rating is required" })
        }
        if (rating) {
            if (!(typeof rating === "number")) {
                return res.status(400).send({ status: false, msg: "rating should be a number" })
            }
            if (!onlyNumbers(rating))
                return res.status(400).send({ status: false, msg: "rating should be between 1 to 5" })
        }

        Obj.rating = rating

        Obj.review = review

        if (isDeleted == true) {
            return res.status(400).send({ status: false, msg: "you are deleting your data on the time of creation" })
        }
        Obj.isDeleted = isDeleted

        const reviewCreate = await reviewModel.create(Obj)
        const addCount = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true })
        addCount._doc.reviewsData = reviewCreate
        return res.status(201).send({ status: true, msg: "review is successfully done", data: addCount })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------- 

const updateReview = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId
        const data = req.body
        const { review, rating, reviewedBy } = data;

        if(!isValid(bookId)){
            return res.status(400).send({status: false, msg: "please enter valid book id"})
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId not valid" })
        }

        if(!isValid(reviewId)){
            return res.status(400).send({status: false, msg: "please enter valid review id"})
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: " reviewId not valid" })
        }

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide some data to update review" })
        }

        if (Object.values(data).includes(review)) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: "please provide review in proper format" })
            }
        }

        if (Object.values(data).includes(reviewedBy)) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "please provide reviewedBy in proper format." })
            };
            if (!regexName.test(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "reviewedBy is invalid" })
            }
        }

        if (Object.values(data).includes(rating)) {
            if (!(typeof rating === "number")) {
                return res.status(400).send({ status: false, msg: "rating should be a number" })
            }
            if (!onlyNumbers(rating))
                return res.status(400).send({ status: false, msg: "rating should be between 1 to 5" })
        }

        const findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!findBook) {
            return res.status(404).send({ status: false, msg: " book not found" })
        }
        const findReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })
        if (!findReview) {
            return res.status(404).send({ status: false, msg: "reviw does not exist" })
        }

        const updateReviewDetails = await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: data }, { new: true })
        findBook._doc.reviewData = updateReviewDetails
        return res.status(200).send({ status: true, message: "Successfully updated the review of the book.", data: findBook })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// =-----===============================================================================================================

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if(!isValid(bookId)){
            return res.status(400).send({status: false, msg: "please enter correct book id"})
        }
        if (!isValidObjectId(bookId)){
            return res.status(400).send({ status: false, message: "Please enter valid bookId...!" })
        }

        const bookExist = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ deletedAt: 0 })
        if (!bookExist){
            return res.status(404).send({ status: false, message: "No such book found...!" });
    }

        let reviewId = req.params.reviewId;
        if(!isValid(reviewId)){
            return res.status(400).send({status: false, msg: "please enter correct reviewId"})
        }
        if (!isValidObjectId(reviewId)){
            return res.status(400).send({ status: false, message: "enter valid reviewId...!" })
        }

        const reviewExist = await reviewModel.findOne({ _id: reviewId, bookId: bookId})
        if (!reviewExist) return res.status(404).send({ status: false, message: "review not found...!" })

        if(reviewExist.isDeleted == true){
            return res.status(404).send({status: false, msg: "review is already deleted"})
        }
        if (reviewExist.isDeleted == false) {
            await reviewModel.findOneAndUpdate(
                { _id: reviewId, bookId: bookId},
                { $set: { isDeleted: true } },
                { new: true }
            );
            const addCount = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true })
            return res.status(200).send({ status: true, msg: 'successfully deleted review' });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}

module.exports = { createReview, updateReview, deleteReview }
