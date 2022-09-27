const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const middleware = require('../middlewares/auth')

router.get('/test', function(req, res){
    return res.send({status: true, msg: "running"})
})

// User API-----------------------------------------------------------------------------------------------------

router.post('/register', userController.createUser)

router.post("/login", userController.loginUser)

// Books API------------------------------------------------------------------------------------------

router.post("/books", middleware.authentication, bookController.createBook)

router.get("/books", middleware.authentication, bookController.getBooks)

router.get("/books/:bookId",middleware.authentication, bookController.getBooksWithReview)

router.put("/books/:bookId",middleware.authentication,middleware.authorisation,bookController.updateBook)


router.delete("/books/:bookId",middleware.authentication,middleware.authorisation,bookController.deleteBookByParam)

// Review API-------------------------------------------------------------------------------------

router.post("/books/:bookId/review", reviewController.createReview)

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)










module.exports = router