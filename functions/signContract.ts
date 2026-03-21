import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, role, signature_name } = await req.json();

    if (!token || !role || !signature_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find contract by signing token
    const contracts = await base44.entities.RentalContract.filter({ signing_token: token });
    if (!contracts || contracts.length === 0) {
      return Response.json({ error: 'Invalid signing token' }, { status: 404 });
    }

    const contract = contracts[0];
    const now = new Date().toISOString();

    if (role === 'tenant') {
      if (contract.tenant_signed) {
        return Response.json({ error: 'Contract already signed by tenant' }, { status: 400 });
      }

      await base44.entities.RentalContract.update(contract.id, {
        tenant_signature: signature_name,
        tenant_signed: true,
        tenant_signed_date: now,
        status: 'tenant_signed'
      });

      // Send email to landlord notifying of tenant signature
      await base44.integrations.Core.SendEmail({
        to: contract.landlord_email,
        subject: `Contract Signed by Tenant - ${contract.property_address}`,
        body: `Tenant ${contract.tenant_name} has signed the rental contract for ${contract.property_address}. Please review and sign to complete the process.`,
        from_name: 'Modero Contracts'
      });

    } else if (role === 'landlord') {
      if (contract.landlord_signed) {
        return Response.json({ error: 'Contract already signed by landlord' }, { status: 400 });
      }

      if (!contract.tenant_signed) {
        return Response.json({ error: 'Tenant must sign first' }, { status: 400 });
      }

      await base44.entities.RentalContract.update(contract.id, {
        landlord_signature: signature_name,
        landlord_signed: true,
        landlord_signed_date: now,
        status: 'fully_signed'
      });

      // Send confirmation email to both parties
      const confirmEmail = `
The rental contract for ${contract.property_address} has been fully signed and is now legally binding.

Contract Details:
Property: ${contract.property_address}
Monthly Rent: €${contract.monthly_rent}
Lease Period: ${contract.lease_start_date} to ${contract.lease_end_date}

Both parties have signed on ${new Date(now).toLocaleDateString()}.
      `;

      await base44.integrations.Core.SendEmail({
        to: contract.tenant_email,
        subject: `Rental Contract Completed - ${contract.property_address}`,
        body: confirmEmail,
        from_name: 'Modero Contracts'
      });

      await base44.integrations.Core.SendEmail({
        to: contract.landlord_email,
        subject: `Rental Contract Completed - ${contract.property_address}`,
        body: confirmEmail,
        from_name: 'Modero Contracts'
      });
    } else {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    return Response.json({ success: true, status: contract.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});