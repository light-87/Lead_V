import { NextResponse } from 'next/server';

const SMARTLEAD_BASE_URL = 'https://server.smartlead.ai/api/v1';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, campaignId, lead, email } = body;

    const apiKey = process.env.SMARTLEAD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Smartlead API key not configured. Please add SMARTLEAD_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Test API connection
    if (action === 'test') {
      try {
        const response = await fetch(
          `${SMARTLEAD_BASE_URL}/campaigns?api_key=${apiKey}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          // Check if it's a 403 error (likely plan limitation)
          if (response.status === 403) {
            return NextResponse.json(
              {
                error: 'API Access Denied - PRO Plan Required',
                message: 'Smartlead API requires a PRO plan for API access. Your current Basic plan does not have API access enabled.',
                solution: 'To use the API:\n1. Go to Smartlead Settings → Activate API\n2. Upgrade to a PRO plan if API is not available\n3. Your API key will be provided after activation',
                status: response.status,
                details: errorText
              },
              { status: 403 }
            );
          }

          return NextResponse.json(
            {
              error: 'Failed to connect to Smartlead API',
              details: errorText,
              status: response.status
            },
            { status: response.status }
          );
        }

        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'Successfully connected to Smartlead API',
          campaigns: data
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Network error connecting to Smartlead', details: error.message },
          { status: 500 }
        );
      }
    }

    // Send email by adding lead to campaign
    if (action === 'send') {
      if (!campaignId) {
        return NextResponse.json(
          { error: 'Campaign ID is required. Please configure it in Settings.' },
          { status: 400 }
        );
      }

      if (!lead || !lead.email) {
        return NextResponse.json(
          { error: 'Lead email is required' },
          { status: 400 }
        );
      }

      // Prepare lead data for Smartlead
      const leadData = {
        lead_list: [
          {
            first_name: lead.first_name || lead.name?.split(' ')[0] || 'There',
            last_name: lead.last_name || lead.name?.split(' ').slice(1).join(' ') || '',
            email: lead.email,
            company_name: lead.company_name || lead.name || '',
            website: lead.website || '',
            location: lead.location || lead.address || '',
            phone_number: lead.phone || '',
            custom_fields: {
              business_type: lead.business_type || '',
              address: lead.address || '',
              ...(email?.subject_line && { email_subject: email.subject_line }),
              ...(email?.email_body && { email_body: email.email_body }),
              ...(email?.key_issues && { key_issues: email.key_issues.join(', ') }),
            },
          },
        ],
        settings: {
          ignore_global_block_list: false,
          ignore_unsubscribe_list: false,
          ignore_duplicate_leads_in_other_campaign: false,
        },
      };

      try {
        const response = await fetch(
          `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/leads?api_key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          // Check if it's a 403 error (likely plan limitation)
          if (response.status === 403) {
            return NextResponse.json(
              {
                error: 'API Access Denied - PRO Plan Required',
                message: 'Cannot send email. Smartlead API requires a PRO plan for API access.',
                solution: 'Please upgrade your Smartlead plan to PRO to use API features.',
                status: response.status,
                details: errorText
              },
              { status: 403 }
            );
          }

          return NextResponse.json(
            {
              error: 'Failed to add lead to Smartlead campaign',
              details: errorText,
              status: response.status
            },
            { status: response.status }
          );
        }

        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: `Email sent to ${lead.email} via Smartlead campaign`,
          data
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Network error sending to Smartlead', details: error.message },
          { status: 500 }
        );
      }
    }

    // Get campaign details
    if (action === 'getCampaign') {
      if (!campaignId) {
        return NextResponse.json(
          { error: 'Campaign ID is required' },
          { status: 400 }
        );
      }

      try {
        const response = await fetch(
          `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}?api_key=${apiKey}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          return NextResponse.json(
            {
              error: 'Failed to fetch campaign details',
              details: errorText,
              status: response.status
            },
            { status: response.status }
          );
        }

        const data = await response.json();
        return NextResponse.json({
          success: true,
          campaign: data
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Network error fetching campaign', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "test", "send", or "getCampaign"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Smartlead API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
