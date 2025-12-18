// Azure Storage URLs
export const AZURE_STORAGE_BASE_URL = process.env.AZURE_STORAGE_ACCOUNT_NAME 
  ? `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
  : '';

export const getAvatarUrl = (filename: string) => {
  if (!AZURE_STORAGE_BASE_URL) return `/avatars/${filename}`;
  return `${AZURE_STORAGE_BASE_URL}/avatars/${filename}`;
};

export const getDrinkPhotoUrl = (filename: string) => {
  if (!AZURE_STORAGE_BASE_URL) return `/drinks/${filename}`;
  return `${AZURE_STORAGE_BASE_URL}/drink-proofs/${filename}`;
};

