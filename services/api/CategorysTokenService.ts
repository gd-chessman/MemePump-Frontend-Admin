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

export const createCategoryToken = async (data: any)=>{
    try {
        const temp = await axiosClient.post("/categories-token", data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const updateCategoryToken = async (data: any)=>{
    try {
        const temp = await axiosClient.put(`/categories-token/${data.id}`, data)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const deleteCategoryToken = async (id: string)=>{
    try {
        const temp = await axiosClient.delete(`/categories-token/${id}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}