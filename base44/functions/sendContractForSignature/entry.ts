import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function generateToken(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { contract_id } = await req.json();
    const contract = await base44.entities.RentalContract.get(contract_id);

    if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

    // Generate or reuse a secure signing token
    const signingToken = contract.signing_token || generateToken(20);

    await base44.entities.RentalContract.update(contract_id, {
      status: 'sent',
      signing_token: signingToken,
    });

    // Clean invite URL — no query params, token in path
    const appUrl = Deno.env.get('APP_URL') || 'https://app.moderokyc.com';
    const inviteLink = `${appUrl}/invite/${signingToken}`;

    const emailBody = `Hello ${contract.tenant_name},

Your landlord ${contract.landlord_name} has sent you a rental agreement for review and signature.

📍 Property: ${contract.property_address || 'See contract for details'}
💶 Monthly Rent: €${contract.monthly_rent}
📅 Lease Period: ${contract.lease_start_date} – ${contract.lease_end_date}
🔒 Security Deposit: €${contract.deposit_amount || 0}

To review and sign your contract, please click the link below:
${inviteLink}

No account is required — the link will take you directly to the signing page.
This link is unique to you and should not be shared.

Best regards,
${contract.landlord_name}
Modero Contract System`;

    await base44.integrations.Core.SendEmail({
      to: contract.tenant_email,
      subject: `📋 Rental Contract Ready for Your Signature — ${contract.property_address || 'Your New Home'}`,
      body: emailBody,
      from_name: contract.landlord_name || 'Modero Contracts',
    });

    return Response.json({ success: true, signing_token: signingToken, invite_link: inviteLink });
  } catch (error) {
    console.error('sendContractForSignature error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});