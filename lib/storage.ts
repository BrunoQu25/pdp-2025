import { BlobServiceClient } from '@azure/storage-blob';
import { logger } from './logger';

export async function uploadPhotoToAzure(file: File): Promise<string> {
  const startTime = Date.now();
  
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'drink-proofs';

    if (!connectionString) {
      // For development without Azure setup, return a placeholder
      logger.warn('Azure Storage not configured, using placeholder', 'Storage', {
        containerName,
        fileName: file.name
      });
      return '/placeholder-drink.jpg';
    }

    logger.info('Starting Azure upload', 'Storage', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      container: containerName
    });

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      logger.info('Creating container', 'Storage', { containerName });
      await containerClient.createIfNotExists({
        access: 'blob'
      });
    }

    // Generate unique blob name
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    logger.debug('Uploading blob', 'Storage', { blobName });

    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    const uploadTime = Date.now() - startTime;
    const url = blockBlobClient.url;

    logger.info('Azure upload successful', 'Storage', {
      blobName,
      uploadTime: `${uploadTime}ms`,
      url: url.substring(0, 100) + '...'
    });

    return url;
  } catch (error) {
    const uploadTime = Date.now() - startTime;
    logger.error('Error uploading to Azure', 'Storage', error, {
      fileName: file.name,
      failedAfter: `${uploadTime}ms`
    });
    throw new Error('Failed to upload photo');
  }
}

