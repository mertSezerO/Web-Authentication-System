const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs')
const path = require('path')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static('public'))
app.use(flash())
app.use(session({
  secret: 'somevalue',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/login', (req, res) => {
    res.render('login.ejs')
    parseUsers()
})

app.get('/', checkAuthenticated, (req, res) => {
    res.render('loggedin.ejs')
  })
  

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', async (req,res) => {
    try {
        if(user.password !== user.confirmedPassword){
            throw Error("Two different passwords typed")
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.forEach(user => {
            if(user.username === req.body.username){
                throw Error("this username is taken")
            }
            else if(user.email === req.body.email){
                throw Error("there exists already an account with this email")
            }
        });
        const newUser = {
            id: Date.now.toString(),
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        }
        users.push(newUser)
        parseNewUsers(newUser)
        res.redirect('/')
    } catch(err){
        res.redirect('/register')
        console.error(err.message)
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut(function(err) {
        if(err){ return next(err)}
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

async function parseUsers() {
    jsonsInDir = await fs.readdirSync('./Users')
    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join('./Users', file))
        users.push(JSON.parse(fileData))
    }) 
}

async function parseNewUsers(newUser){
    const newJson = JSON.stringify(newUser)
    await fs.writeFileSync(path.join('./Users','user_'+users.length.toString() + '.json'),newJson) 
}

app.listen(3000)