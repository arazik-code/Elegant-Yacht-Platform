// Sell Yacht Listing Submission API

import { NextRequest, NextResponse } from 'next/server';
import { sendListingReceivedEmail, sendListingAlertToAdmin } from '@/lib/email';

// Simple ID generator (no uuid dependency needed)
function generateSubmissionId(): string {
  return `SY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

interface SellYachtSubmission {
  name: string;
  phone: string;
  email: string;
  yachtBrand: string;
  yachtModel: string;
  yachtYear: string;
  yachtLength: string;
  condition: string;
  askingPrice?: number;
  location?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SellYachtSubmission = await request.json();

    // Basic validation
    if (!body.name || !body.phone || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate submission ID
    const submissionId = generateSubmissionId();

    // Construct yacht name
    const yachtName = `${body.yachtBrand} ${body.yachtModel}`.trim() || 'Unknown Yacht';

    // Send email to yacht owner (confirmation)
    const ownerEmailResult = await sendListingReceivedEmail({
      ownerName: body.name,
      ownerEmail: body.email,
      yachtName,
      yachtMake: body.yachtBrand,
      yachtModel: body.yachtModel,
      yachtYear: body.yachtYear,
      yachtLength: body.yachtLength ? `${body.yachtLength} ft` : undefined,
      askingPrice: body.askingPrice
        ? `USD ${body.askingPrice.toLocaleString()}`
        : undefined,
      submissionId,
      additionalNotes: body.notes,
    });

    if (!ownerEmailResult.success) {
      console.error('Failed to send owner confirmation:', ownerEmailResult.error);
    }

    // Send email to admin (alert)
    const adminEmailResult = await sendListingAlertToAdmin({
      ownerName: body.name,
      ownerEmail: body.email,
      ownerPhone: body.phone,
      yachtName,
      yachtMake: body.yachtBrand,
      yachtModel: body.yachtModel,
      askingPrice: body.askingPrice
        ? `USD ${body.askingPrice.toLocaleString()}`
        : undefined,
      submissionId,
    });

    if (!adminEmailResult.success) {
      console.error('Failed to send admin alert:', adminEmailResult.error);
    }

    // TODO: Optionally save to database
    // await prisma.yachtListingSubmission.create({
    //   data: {
    //     id: submissionId,
    //     ...body,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Listing submitted successfully',
      submissionId,
      emailsSent: {
        ownerConfirmation: ownerEmailResult.success,
        adminAlert: adminEmailResult.success,
      },
    });
  } catch (error) {
    console.error('Sell yacht API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
