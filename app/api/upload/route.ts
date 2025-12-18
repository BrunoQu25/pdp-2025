import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { uploadPhotoToAzure } from '@/lib/storage';
import { logger, logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  logApiRequest(request, 'Upload photo');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn('Unauthorized upload attempt', 'API:Upload');
      logApiError(request, 401, 'No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      logger.warn('Upload attempt without file', 'API:Upload', { userId: session.user.id });
      logApiError(request, 400, 'No file');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    logger.info('Starting photo upload', 'API:Upload', {
      userId: session.user.id,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    });

    const photoUrl = await uploadPhotoToAzure(file);

    logger.info('Photo uploaded successfully', 'API:Upload', {
      userId: session.user.id,
      photoUrl: photoUrl.substring(0, 100) + '...'
    });

    logApiResponse(request, 200, { uploaded: true });

    return NextResponse.json({ url: photoUrl });
  } catch (error) {
    logger.error('Error uploading file', 'API:Upload', error);
    logApiError(request, 500, error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

