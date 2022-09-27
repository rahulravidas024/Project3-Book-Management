const mongoose = require('mongoose')

const isValid = function(value){
    if(!value || typeof value === "undefined" || value === null || typeof value != 'string') return false
    if(typeof value === "string" && value.trim().length === 0 ) return false
    return true
}

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

function onlyNumbers(val){
    if(val < 1 || val > 5){
        return false
    }
    val = val.toString().split("")

    for(let ele of val){
        if(ele == "."){
            return false
        }
    }
    return true
}

function checkObject(value){
    if (typeof value == "undefined" || typeof value == null || typeof value!= 'object') {
        return false
     }else{
        return true
     }
}

// Regex

const regexName = /^[a-zA-Z ]{2,30}$/

const regexEmail = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/

const regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/

const regexPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/

const regexPincode = /^(\d{4}|\d{6})$/

const regexIsbn =/^(97(8|9))?\d{9}(\d|X)$/

const regexDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/


module.exports = {isValid, isValidObjectId, onlyNumbers, checkObject, regexName, regexEmail, regexPassword, regexPhone, regexPincode, regexIsbn, regexDate}






// const idMatch = function (value){
//     let user = /^[0-9a-fA-F]{24}$/.test(value)
//     return user
// }