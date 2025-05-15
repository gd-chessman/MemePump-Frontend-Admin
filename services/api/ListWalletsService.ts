
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

export const updateListWalletsAuth = async (walletId: string, item: any) => {
    try {
        const temp = await axiosClient.put(`/list-wallets/${walletId}/auth`, item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}