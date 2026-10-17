export const formatLKR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "LKR 0";
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
};

export const money = (amount: number): string => formatLKR(amount);

export const formatCompactLKR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "LKR 0";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `LKR ${(amount / 1_000).toFixed(1)}K`;
  }
  return formatLKR(amount);
};

export const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};
