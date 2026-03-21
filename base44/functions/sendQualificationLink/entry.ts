import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inquiry_id } = await req.json();
    
    const inquiry = await base44.entities.Inquiry.get(inquiry_id);
    if (!inquiry) {
      return Response.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Generate unique token if doesn't exist
    const token = inquiry.qualification_token || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update inquiry with token
    if (!inquiry.qualification_token) {
      await base44.entities.Inquiry.update(inquiry_id, { qualification_token: token });
    }

    // Build the qualification link
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:5173';
    const appUrl = `${protocol}://${host}`;
    const qualificationLink = `${appUrl}/TenantQualification?token=${token}&property_id=${inquiry.property_id}&idealista_id=${inquiry.idealista_id || ''}`;

    // Send message to tenant
    const messageBody = `${user.full_name} has sent you a link to start your apartment qualification process:\n\n${qualificationLink}\n\nClick the link above to begin. It's quick, secure, and completely confidential.`;

    await base44.integrations.Core.SendEmail({
      to: inquiry.tenant_email,
      subject: `Complete Your Qualification - Apartment in ${inquiry.city || 'Our Properties'}`,
      body: messageBody,
      from_name: user.full_name || 'Modero'
    });

    return Response.json({ 
      success: true, 
      token: token,
      link: qualificationLink 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});