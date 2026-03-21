import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      booking_id,
      inquiry_id,
      property_id,
      tenant_name,
      tenant_email,
      viewing_date,
      viewing_time,
      property_address,
      property_city,
    } = await req.json();

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: tenant_email,
      subject: `Your Apartment Viewing Confirmed - ${viewing_date} at ${viewing_time}`,
      body: `Hello ${tenant_name},

Your apartment viewing has been confirmed!

📍 Property Details:
${property_address}
${property_city}

📅 Appointment Details:
Date: ${viewing_date}
Time: ${viewing_time}

Please arrive 5 minutes early. If you need to reschedule, please contact the property owner as soon as possible.

Looking forward to seeing you!

Best regards,
Modero Team`,
      from_name: 'Modero',
    });

    // Update booking status
    await base44.asServiceRole.entities.ViewingBooking.update(booking_id, {
      confirmation_sent: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});