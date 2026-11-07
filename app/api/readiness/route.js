import { NextResponse } from 'next/server';
import { getTrialReadinessReport } from '../../../lib/storage.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const report = await getTrialReadinessReport();
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
