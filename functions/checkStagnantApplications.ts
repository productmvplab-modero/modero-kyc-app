import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const STAGNANT_HOURS = 48;

function getActionNeeded(inquiry) {
  if (!inquiry.tenant_email || !inquiry.tenant_phone) {
    return { type: 'follow_up', message: `Follow up with ${inquiry.tenant_name} — contact details incomplete.` };
  }
  if (!inquiry.documents?.id_document_url || inquiry.id_verification_status === 'pending') {
    return { type: 'id_verification', message: `ID verification pending for ${inquiry.tenant_name} — remind them to complete identity check.` };
  }
  if (!inquiry.documents?.payslip_url || !inquiry.documents?.cv_url) {
    return { type: 'document_review', message: `Missing documents from ${inquiry.tenant_name} — payslips or CV not uploaded.` };
  }
  if (inquiry.credit_check_status === 'pending' || inquiry.credit_check_status === 'in_review') {
    return { type: 'credit_check', message: `Credit check still pending for ${inquiry.tenant_name} — review Dun & Bradstreet status.` };
  }
  if (inquiry.landlord_decision === 'pending' && inquiry.status === 'qualified') {
    return { type: 'decision_pending', message: `${inquiry.tenant_name} is qualified — landlord decision still pending.` };
  }
  return { type: 'follow_up', message: `Application from ${inquiry.tenant_name} has not progressed in ${STAGNANT_HOURS}+ hours — review and take action.` };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cutoff = new Date(Date.now() - STAGNANT_HOURS * 60 * 60 * 1000).toISOString();

    // Get all active inquiries not updated in 48h
    const inquiries = await base44.asServiceRole.entities.Inquiry.filter({
      status: { $nin: ['rejected', 'rented'] }
    });

    const stagnant = inquiries.filter(inq => {
      const lastUpdate = inq.updated_date || inq.created_date;
      return lastUpdate < cutoff;
    });

    // Get existing unread notifications to avoid duplicates
    const existing = await base44.asServiceRole.entities.Notification.filter({ is_read: false });
    const existingInquiryIds = new Set(existing.map(n => n.inquiry_id));

    let created = 0;
    for (const inquiry of stagnant) {
      if (existingInquiryIds.has(inquiry.id)) continue;

      const hoursStagnant = Math.floor(
        (Date.now() - new Date(inquiry.updated_date || inquiry.created_date).getTime()) / (1000 * 60 * 60)
      );

      const { type, message } = getActionNeeded(inquiry);

      await base44.asServiceRole.entities.Notification.create({
        inquiry_id: inquiry.id,
        tenant_name: inquiry.tenant_name,
        type,
        message,
        hours_stagnant: hoursStagnant,
        is_read: false,
        owner_email: inquiry.created_by || '',
      });
      created++;
    }

    return Response.json({ checked: stagnant.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});