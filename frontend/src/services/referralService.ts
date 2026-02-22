import { api } from './api';

export interface ReferralStats {
  referralCode: string;
  sawapPoints: number;
  referralCount: number;
}

export interface ReferralItem {
  refereeName: string;
  joinedAt: number;
}

export const getMyReferral = async (): Promise<ReferralStats> => {
  return api('/referrals/me');
};

export const getMyReferrals = async (): Promise<ReferralItem[]> => {
  return api('/referrals/list');
};

export const copyReferralLink = (referralCode: string): boolean => {
  const link = `${window.location.origin}/register?ref=${referralCode}`;
  try {
    navigator.clipboard.writeText(link);
    return true;
  } catch {
    return false;
  }
};
