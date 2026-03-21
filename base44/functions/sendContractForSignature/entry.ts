import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contract_id } = await req.json();
    const contract = await base44.entities.RentalContract.get(contract_id);

    if (!contract) {
      return Response.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Generate signing token if not exists
    const signingToken = contract.signing_token || Math.random().toString(36).substring(2, 15);
    
    // Update contract status to 'sent'
    await base44.entities.RentalContract.update(contract_id, {
      status: 'sent',
      signing_token: signingToken
    });

    // Send email to tenant with signing link
    const signingLink = `${Deno.env.get('APP_URL')}/ContractSignature?token=${signingToken}&role=tenant`;
    
    const emailBody = `
Hello ${contract.tenant_name},

A rental contract has been sent to you for signature. Please review the terms and sign the contract using the link below.

Property: ${contract.property_address}
Monthly Rent: €${contract.monthly_rent}
Lease Period: ${contract.lease_start_date} to ${contract.lease_end_date}

Sign the contract: ${signingLink}

Best regards,
${contract.landlord_name}
    `;

    await base44.integrations.Core.SendEmail({
      to: contract.tenant_email,
      subject: `Rental Contract for ${contract.property_address} - Requires Your Signature`,
      body: emailBody,
      from_name: contract.landlord_name
    });

    return Response.json({ success: true, signing_token: signingToken });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});