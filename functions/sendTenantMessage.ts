import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { inquiry_id, tenant_name, tenant_email, subject, body, type } = await req.json();

    if (!tenant_email || !subject || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email via built-in integration
    await base44.integrations.Core.SendEmail({
      to: tenant_email,
      from_name: 'Modero KYC',
      subject,
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #f59e0b); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Modero</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">Tenant Screening Platform</p>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">${body.replace(/\n/g, '<br/>')}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">This message was sent via Modero KYC platform. If you have questions, contact <a href="mailto:support@moderokyc.com" style="color: #f97316;">support@moderokyc.com</a></p>
          </div>
        </div>
      `
    });

    // Save message record
    const message = await base44.entities.Message.create({
      inquiry_id,
      tenant_name,
      tenant_email,
      subject,
      body,
      type: type || 'custom',
      sent_by: user.email,
      sent_via: ['email', 'in_app'],
      status: 'sent',
    });

    return Response.json({ success: true, message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});