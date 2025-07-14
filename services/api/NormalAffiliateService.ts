import { LangCodes } from './../../lang/index';
import axiosClient from "@/utils/axiosClient";


export const getNormalAffiliateStats = async () => {
  try {
    const response = await axiosClient.get('/traditional-referrals');
    return response.data;
  } catch (error) {
    console.log('Error fetching normal affiliate stats:', error);
    return {};
  }
};

export const getNormalAffiliateStatistics = async () => {
  try {
    const response = await axiosClient.get('/traditional-referrals/statistics');
    return response.data;
  } catch (error) {
    console.log('Error fetching normal affiliate referral relations:', error);
    return {};
  }
};  