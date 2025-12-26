// Daily Digest Email API Route
// This endpoint can be triggered by a cron job (e.g., Vercel Cron, GitHub Actions)

import { NextRequest, NextResponse } from 'next/server';
import { sendDailyDigestEmail } from '@/lib/email';

// Secret key for authenticating cron requests
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (if configured)
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      const providedSecret = authHeader?.replace('Bearer ', '');

      if (providedSecret !== CRON_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Send the daily digest email
    const result = await sendDailyDigestEmail();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send daily digest',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Daily digest email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Daily digest API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET method for Vercel Cron (Vercel Cron uses GET by default)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret from header (Vercel Cron sends it as CRON_SECRET header)
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      const cronHeader = request.headers.get('x-cron-secret');
      const providedSecret =
        cronHeader || authHeader?.replace('Bearer ', '');

      if (providedSecret !== CRON_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Send the daily digest email
    const result = await sendDailyDigestEmail();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send daily digest',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Daily digest email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Daily digest API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
