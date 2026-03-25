import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Generate a unique audit ID
function generateAuditId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MOD';
  for (let i = 0; i < 9; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { token, role, signature_name, contract_id } = body;

    // Support both token-based (tenant invite link) and contract_id-based (admin landlord signing)
    let contract;
    if (token) {
      const contracts = await base44.asServiceRole.entities.RentalContract.filter({ signing_token: token });
      if (!contracts || contracts.length === 0) {
        return Response.json({ error: 'Invalid or expired signing link.' }, { status: 404 });
      }
      contract = contracts[0];
    } else if (contract_id) {
      // Landlord signing from admin panel — requires auth
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      contract = await base44.entities.RentalContract.get(contract_id);
    } else {
      return Response.json({ error: 'Missing token or contract_id' }, { status: 400 });
    }

    if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });
    if (!role || !signature_name) return Response.json({ error: 'Missing role or signature_name' }, { status: 400 });

    const now = new Date().toISOString();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
    const auditId = contract.audit_id || generateAuditId();

    if (role === 'tenant') {
      if (contract.tenant_signed) {
        return Response.json({ error: 'Contract already signed by tenant.' }, { status: 400 });
      }

      // Update contract
      await base44.asServiceRole.entities.RentalContract.update(contract.id, {
        tenant_signature: signature_name,
        tenant_signed: true,
        tenant_signed_date: now,
        tenant_signed_ip: ip,
        audit_id: auditId,
        status: contract.landlord_signed ? 'fully_signed' : 'tenant_signed',
      });

      // Record signature entry
      await base44.asServiceRole.entities.ContractSignature.create({
        contract_id: contract.id,
        user_type: 'tenant',
        name: contract.tenant_name,
        email: contract.tenant_email,
        signature_text: signature_name,
        signed_at: now,
        ip_address: ip,
        audit_id: auditId,
      });

      // Notify landlord
      if (contract.landlord_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contract.landlord_email,
          subject: `✅ Tenant Signed — ${contract.property_address || 'Rental Contract'}`,
          body: `${contract.tenant_name} has signed the rental contract for ${contract.property_address}.\n\nSigned at: ${now}\nAudit ID: ${auditId}\n\nPlease log in to Modero to countersign the contract.`,
          from_name: 'Modero Contracts',
        });
      }

      return Response.json({ success: true, status: 'tenant_signed', audit_id: auditId });

    } else if (role === 'landlord') {
      if (contract.landlord_signed) {
        return Response.json({ error: 'Contract already signed by landlord.' }, { status: 400 });
      }

      const newStatus = contract.tenant_signed ? 'fully_signed' : 'landlord_signed';

      await base44.asServiceRole.entities.RentalContract.update(contract.id, {
        landlord_signature: signature_name,
        landlord_signed: true,
        landlord_signed_date: now,
        landlord_signed_ip: ip,
        audit_id: auditId,
        status: newStatus,
      });

      await base44.asServiceRole.entities.ContractSignature.create({
        contract_id: contract.id,
        user_type: 'landlord',
        name: contract.landlord_name,
        email: contract.landlord_email,
        signature_text: signature_name,
        signed_at: now,
        ip_address: ip,
        audit_id: auditId,
      });

      // If both have signed, notify both parties
      if (newStatus === 'fully_signed') {
        const completedBody = `The rental contract for ${contract.property_address} has been fully signed by both parties and is now legally binding.\n\nAudit ID: ${auditId}\nSigned on: ${new Date(now).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}\n\nLog in to Modero to download the finalized PDF.`;

        await Promise.all([
          base44.asServiceRole.integrations.Core.SendEmail({
            to: contract.tenant_email,
            subject: `🎉 Contract Fully Signed — ${contract.property_address}`,
            body: completedBody,
            from_name: 'Modero Contracts',
          }),
          base44.asServiceRole.integrations.Core.SendEmail({
            to: contract.landlord_email,
            subject: `🎉 Contract Fully Signed — ${contract.property_address}`,
            body: completedBody,
            from_name: 'Modero Contracts',
          }),
        ]);
      }

      return Response.json({ success: true, status: newStatus, audit_id: auditId });

    } else {
      return Response.json({ error: 'Invalid role. Must be "tenant" or "landlord".' }, { status: 400 });
    }

  } catch (error) {
    console.error('signContract error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});