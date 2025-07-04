import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js';

export const getUsersForSidebar = async (req, res) => {
    try{
        const currentUserId = req.user._id;
        const filteredUsers = (await User.find({ _id: { $ne: currentUserId } })).select('-password');
        if(filteredUsers.length > 0){
            return res.status(200).json({
                message: 'Users fetched successfully',
                users: filteredUsers
            });
        }
        else{
            return res.status(404).json({
                message: 'No users found'
            });
        }
    }
    catch(error){
        console.error("Error fetching users for sidebar:", error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export const getMessages = async (req, res) => {
    const { id:userToChatId } = req.params;
    const currentUserId = req.user._id;
    if(!userToChatId){
        return res.status(400).json({
            message: 'User ID is required'
        });
    }
    try {
        const messages = await Message.find({
            $or: [
                {senderId: currentUserId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: currentUserId}
            ]
        })
        return res.status(200).json({
            message: 'Messages fetched successfully',
            messages: messages
        });

    }
    catch{
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export const sendMessages = async (req, res) => {
    try{
        const { id:userToChatId } = req.params;
        const currentUserId = req.user._id;
        const { text,image } = req.body;
        
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: currentUserId,
            receiverId: userToChatId,
            text: text || '',
            image: imageUrl || ''
        });

        const savedMessage = await newMessage.save();
        if(savedMessage){
            return res.status(200).json({
                message: 'Message sent successfully',
                message: savedMessage
            });
        }
        else{
            return res.status(500).json({
                message: 'Failed to send message'
            });
        }
    }
    catch(error){
        console.error("Error sending message:", error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}