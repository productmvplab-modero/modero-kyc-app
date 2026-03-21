import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import jsPDF from 'npm:jspdf@4.0.0';

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

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);

    let y = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('RENTAL AGREEMENT', margin, y);
    y += 15;

    // Header info
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const headerInfo = [
      `Date: ${new Date().toLocaleDateString()}`,
      `Property: ${contract.property_address}`,
      `Monthly Rent: €${contract.monthly_rent}`
    ];
    
    headerInfo.forEach(info => {
      pdf.text(info, margin, y);
      y += 7;
    });
    y += 5;

    // Party Information
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(11);
    pdf.text('PARTIES:', margin, y);
    y += 8;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    const parties = [
      `Landlord: ${contract.landlord_name}`,
      `Email: ${contract.landlord_email}`,
      ``,
      `Tenant: ${contract.tenant_name}`,
      `Email: ${contract.tenant_email}`
    ];

    parties.forEach(party => {
      pdf.text(party, margin, y);
      y += 6;
    });
    y += 5;

    // Contract Content
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(11);
    pdf.text('TERMS & CONDITIONS:', margin, y);
    y += 8;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    const contentLines = pdf.splitTextToSize(contract.contract_content, maxWidth);
    
    contentLines.forEach(line => {
      if (y > pageHeight - margin - 20) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 5;
    });

    y += 10;

    // Signature Section
    if (y > pageHeight - margin - 40) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(11);
    pdf.text('SIGNATURES:', margin, y);
    y += 12;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    // Landlord signature
    pdf.text(`Landlord Signature: ${contract.landlord_signed ? contract.landlord_signature : '_______________'}`, margin, y);
    y += 8;
    pdf.text(`Date: ${contract.landlord_signed_date ? new Date(contract.landlord_signed_date).toLocaleDateString() : '_______________'}`, margin, y);
    y += 15;

    // Tenant signature
    pdf.text(`Tenant Signature: ${contract.tenant_signed ? contract.tenant_signature : '_______________'}`, margin, y);
    y += 8;
    pdf.text(`Date: ${contract.tenant_signed_date ? new Date(contract.tenant_signed_date).toLocaleDateString() : '_______________'}`, margin, y);

    // Generate PDF as base64
    const pdfData = pdf.output('arraybuffer');
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfData)));

    return Response.json({ 
      pdf_url: `data:application/pdf;base64,${base64Pdf}`,
      pdf_name: `contract_${contract.tenant_name.replace(/\s+/g, '_')}.pdf`
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});