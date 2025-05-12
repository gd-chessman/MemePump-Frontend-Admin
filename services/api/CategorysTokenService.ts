import axiosClient from "@/utils/axiosClient";


export const getCategoryToken = async ()=>{
    try {
        const temp = await axiosClient.get("/categories-token")
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}