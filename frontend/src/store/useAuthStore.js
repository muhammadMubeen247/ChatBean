import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import {toast} from 'react-hot-toast'

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser:res.data})
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
}))