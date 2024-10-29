function addValidClass(err, message) {
    if (err.classList.contains("invalid")) {err.classList.remove("invalid")}
    if (!err.classList.contains("valid")) {err.classList.add("valid")}
    err.innerHTML = message
}
function addInvalidClass(err, message) {
    if (err.classList.contains("valid")) {err.classList.remove("valid")}
    if (!err.classList.contains("invalid")) {err.classList.add("invalid")}
    err.innerHTML = message
    anyInvalid = True
}

var inputFields = document.getElementsByClassName("inputElem")
function checkInputs() {
    for (i=0; i<inputFields.length; i++) {
        var err = inputFields[i].getElementsByClassName("err")[0]
        var item = inputFields[i].getElementsByClassName("item")[0]
        const backgroundColorValid = 'rgb(179, 245, 186)'
        const backgroundColorInvalid = 'rgb(245, 179, 179)' //TODO: set properties in css file and get them
        const borderColorValid = 'rgb(69, 130, 75)'
        const borderColorInvalid = 'rgb(130, 69, 69)'
        var anyInvalid = false;

        if (item.id === "username") {
            if (item.value.length <1) {
                addInvalidClass(err, "Must be at least 1 letter")
            } else if (item.value.length > 16){
                addInvalidClass(err, "Cannot be more than 16 letters")
            } else if (item.value.match("^[a-zA-Z0-9]*$")) {
                addValidClass(err, "Valid username")
            } else {
                addInvalidClass(err, "Only letters and numbers")
            }
        }

        if (item.id === "email") {
            if (!item.value.match("^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")) {
                addInvalidClass(err, "Invalid email address")
            } else {
                addValidClass(err, "Valid email")
            }
        }

        if (item.id === "password") {
            if (item.value.length < 8) {
                addInvalidClass(err, "Must be at least 8 letters")
            } else if (item.value.length > 32) {
                addInvalidClass(err, "Cannot be more than 32 letters")
            } else if (item.value.match("^[a-zA-Z0-9!@#$%^&]{8,32}$")) {
                addValidClass(err, "Valid password")
            } else {
                addInvalidClass(err, "Invalid characters")
            }
        }

        if (item.id === "passwordConf") {
            var passwordLabel = document.getElementById("passwordLabel")
            var password = document.getElementById("password")
            if (passwordLabel.classList.contains("invalid")) {
                addInvalidClass(err, "Original password is invalid")
            } else if (item.value != password.value) {
                addInvalidClass(err, "Passwords don't match")
            } else {
                addValidClass(err, "Passwords match")
            }
        }

        if (item.id === "birthdate") {
            var date = new Date(item.value)
            if (isNaN(date)) {
                addInvalidClass(err, "Invalid birthdate")
            } else {
                var diff = Date.now() - date.getTime()
                var age_dt = new Date(diff)
                var diff = Math.abs(age_dt.getUTCFullYear() - 1970)
                if (diff < 18 | diff > 120) {
                    addInvalidClass(err, "Must be 18")
                } else {
                    addValidClass(err, "Valid Birthday")
                }
            }
        }
    }
    if (anyInvalid) {
        document.getElementById("submitButton").disabled = true
    } else {
        document.getElementById("submitButton").disabled = false
    }
}