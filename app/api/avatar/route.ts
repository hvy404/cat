import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageId = searchParams.get('id');

  if (!imageId) {
    return new NextResponse('Image ID is required', { status: 400 });
  }

  const supabaseStoragePublicUrl = 'https://jiccshhthuhmcudiyljl.supabase.co/storage/v1/object/public/avatars/public/';
  const imageUrl = `${supabaseStoragePublicUrl}${imageId}`;

  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    // Validate content type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const finalContentType = validTypes.includes(contentType || '') ? contentType : 'image/png';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': finalContentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Uh oh, this profile photo does not exist.', { status: 500 });
  }
}