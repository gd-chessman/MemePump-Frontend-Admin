
import axiosClient from "@/utils/axiosClient";


export const getListWallets = async (search: string = '', page: number = 1, limit: number = 100)=>{
    try {
        const temp = await axiosClient.get(`/list-wallets?search=${search}&page=${page}&limit=${limit}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}