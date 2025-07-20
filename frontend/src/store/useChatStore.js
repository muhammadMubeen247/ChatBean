import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js';
import {toast} from 'react-hot-toast'

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async() => {
        set({isUsersLoading: true});
        try {
            const res = axiosInstance.get('/message/users')
            set({users:res.data})
        } catch (error) {
            toast.error('Error Retrieving Users');
            console.log('Error Retrieving Users',error);
        }finally{
            set({isUsersLoading:false})
        }
    }
}))