
import axiosClient from "@/utils/axiosClient";


export const getUserWallets = async ()=>{
    try {
        const temp = await axiosClient.get(`/user-wallets`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}