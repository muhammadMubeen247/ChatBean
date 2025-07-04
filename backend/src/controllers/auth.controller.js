import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req,res)=>{
    const {email, username, password, confirmPassword} = req.body;
    try{
        if(!email || !username || !password || !confirmPassword){
            return res.status(400).send('All fields are required');
        }
        if(password !== confirmPassword){
            return res.status(400).send('Passwords do not match');
        }
        const existingUser = await User.findOne({ email});
        if (existingUser){
            return res.status(400).send('User already exists with this email');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            username,
            password: hashedPassword
        })


        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    _id: newUser._id,
                    email: newUser.email,
                    username: newUser.username,
                    profilePic: newUser.profilePic,
                }
            });
        }
        else{
            return res.status(500).send('Error creating user');
        }
    }
    catch(error){
        console.error("Error during signup:", error);
        res.status(500).send('Internal Server Error');
    }
}  

export const login = async (req,res)=>{
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).send('Email and password are required');
        }

        const user = await User.findOne({ email});
        if(!user){
            return res.status(400).send('Invalid email or password');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return res.status(400).send('Invalid email or password');
        }
        generateToken(user._id,res);
        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
            }
        });
    }
    catch(error){
        console.error("Error during login:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const updateProfile = async (req,res)=>{
    try{
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).send('Profile picture is required');
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
        if(!updatedUser){
            return res.status(404).send('User not found');
        }
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                profilePic: uploadResponse.secure_url,
            }
        });


    }
    catch{
        console.error("Error during profile update:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const checkAuth = (req,res)=>{
    try{
        res.status(200).json(req.user);
    }
    catch(error){
        console.error("Error during authentication check:", error);
        res.status(500).send('Internal Server Error');
    }
}

