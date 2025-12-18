export const getFullAvatarUrl = (filename: string): string => {
  if (filename.startsWith('http')) {
    return filename;
  }

  const azureAccount = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME;
  
  if (azureAccount) {
    return `https://${azureAccount}.blob.core.windows.net/pdp-2025/avatars/${filename}`;
  }

  return `/avatars/${filename}`;
};

