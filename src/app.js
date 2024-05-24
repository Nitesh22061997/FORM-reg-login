require("dotenv").config();
const express = require("express")
const app = express()
require("./db/conn")
const path = require("path")
const port = process.env.PORT || 3000;
const hbs = require("hbs")
const Register = require("./models/registers")
const bcrypt = require("bcryptjs")


const static_path = path.join(__dirname, "../public")
const templates_Path = path.join(__dirname, "../templates/views")
const partials_Path = path.join(__dirname, "../templates/partials")

app.use(express.static(static_path))
app.set("view engine", "hbs")
app.set("views", templates_Path)
hbs.registerPartials(partials_Path)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
    res.render("index")
})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmpassword
        if (password === cpassword) {
            const registerEmployee = new Register(req.body)

            // console.log("Success part is :" + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part is:" + token);

            const registered = await registerEmployee.save()
            // console.log("registered part is " + registered);
            res.status(201).render("index")
        }
        else {
            res.send("passwords are not matching")
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// Login  check
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const useremail = await Register.findOne({ email: email })

        const isMatch = await bcrypt.compare(password, useremail.password)


        const token = await useremail.generateAuthToken();
        console.log("the token part is:" + token);

        if (isMatch) {
            res.status(201).render("index")
        } else {
            res.send("passwords are not matching")
        }

    } catch (e) {
        res.status(400).send("Invalid Credentials")
    }
})


app.listen(port, () => {
    console.log(`server is runnig at the port: ${port}`);
})
