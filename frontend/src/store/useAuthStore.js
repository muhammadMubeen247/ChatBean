import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import {toast} from 'react-hot-toast'
import {io} from 'socket.io-client'

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser:res.data})
            get().connectSocket();
        } catch (error) {
            set({authUser:null})
            console.log("Error in checkAuth",error);
        } finally{
            set({isCheckingAuth:false})
        }
    },
    signup: async(data) => {
        set({isSigningUp:true})
        try {
            console.log("Sending formData:", data);
            const res = await axiosInstance.post('/auth/signup', data);
            set({authUser:res.data});
            toast.success('Sign Up Successful');
            get().connectSocket();
            
        } catch (error) {
            console.error("Error in signup", error);
            toast.error(error?.response?.data?.message || "Signup failed");
        } finally{
            set({isSigningUp:false});
        }
    },
    logout: async(data) => {
        try {
            const res = axiosInstance.post('/auth/logout')
            set({authUser: null})
            toast.success('Logged Out Successfully')
            get().disconnectSocket();
        } catch (error) {
            console.log('Error Logging Out',error)
            toast.error('Something went wrong')
        }
    },
    login: async(data) => {
        set({isLoggingIn:true})
        try {
            const res = await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success('Logged In Successfully')
            get().connectSocket();
        } catch (error) {
            toast.error('Something went wrong')
            console.log('Error while signing in')
        }finally{
            set({ isLoggingIn:false })
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data.user });
            toast.success('Profile Updated Successfully');
        }catch (error) {
            console.log(error, 'Error Updating Profile Pic');
            toast.error(error?.response?.data || 'Something went wrong');
        }finally {
            set({ isUpdatingProfile: false });
        }
    },
connectSocket: () => {
    const {authUser} = get()
    console.log("Attempting to connect socket with user:", authUser);

    if(!authUser || get().socket?.connected) {
        console.log("Socket connection blocked - No auth user or already connected");
        return;
    }

    const socket = io(BASE_URL, {
        auth: {
            userId: authUser._id // Make sure this matches what backend expects
        },
        withCredentials: true
    });

    socket.on("connect", () => {
        console.log("Socket connected, userId:", authUser._id);
        set({socket}); // Set socket in store after connection
    });

    socket.on("getOnlineUsers", (userIds) => {
        console.log("Received online users:", userIds);
        set({onlineUsers: userIds});
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });
},
    disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
        socket.disconnect();
        set({ socket: null });
        console.log('Socket disconnected');
    } else {
        console.log('No socket to disconnect or already disconnected');
    }
    },
}))

export default useAuthStore;