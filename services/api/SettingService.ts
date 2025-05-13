import axiosClient from "@/utils/axiosClient";


export const getSetting = async ()=>{
    try {
        const temp = await axiosClient.get(`/setting`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const updateSetting = async (data: any)=>{
    try {
        const temp = await axiosClient.put(`/setting`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}
