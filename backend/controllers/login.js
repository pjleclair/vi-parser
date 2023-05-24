const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(
        userForToken, 
        process.env.SECRET,
        { expiresIn: 60*60 }
    )

    response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

loginRouter.get('/', async (req,res) => {
    try {
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (decodedToken.exp*1000 <= Date.now()) {
            return res.status(401).json({ error: 'token invalid' })
        } else {
            return res.status(201).json({msg: "valid token"})
        }
    } catch (error) {
        return res.status(401).json({error: 'token invalid'})
    }
})

module.exports = loginRouter