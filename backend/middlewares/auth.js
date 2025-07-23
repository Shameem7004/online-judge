const jwt = require('jsonwebtoken');
const User = require('../models/User')


const auth = async (req, res, next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.finById(decoded.id);
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();

    } catch(error){
        console.log('Autherization error', error);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

module.exports = auth;