import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try{
        const cookie = req.cookies.jwt;
        if(!cookie){
            return res.status(401).json({message: 'Unauthorized - No token provided'});
        }
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized - Invalid token'});
        }
        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(401).json({message: 'Unauthorized - User not found'});
        }
        req.user = user;
        next();
    }
    catch(error){
        console.error("Error in protectRoute middleware:", error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}