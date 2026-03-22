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

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 0;

    // ─── COLORS ────────────────────────────────────────────────────
    const orange = [249, 115, 22];    // #f97316
    const darkGray = [30, 30, 30];
    const midGray = [100, 100, 100];
    const lightGray = [245, 245, 245];
    const borderGray = [220, 220, 220];
    const white = [255, 255, 255];
    const green = [34, 197, 94];

    // ─── HELPERS ───────────────────────────────────────────────────
    const checkPage = (needed = 10) => {
      if (y + needed > pageHeight - margin) {
        pdf.addPage();
        drawHeader();
        y = 38;
      }
    };

    const drawHeader = () => {
      // Orange top bar
      pdf.setFillColor(...orange);
      pdf.rect(0, 0, pageWidth, 18, 'F');

      // Logo "M" circle
      pdf.setFillColor(...white);
      pdf.circle(margin + 5, 9, 5, 'F');
      pdf.setTextColor(...orange);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('M', margin + 5, 9 + 3.5, { align: 'center' });

      // Brand name
      pdf.setTextColor(...white);
      pdf.setFontSize(13);
      pdf.setFont(undefined, 'bold');
      pdf.text('Modero', margin + 13, 9 + 3.5);

      // Tagline right side
      pdf.setFontSize(7);
      pdf.setFont(undefined, 'normal');
      pdf.text('Rental Management Platform', pageWidth - margin, 9 + 2, { align: 'right' });
      pdf.text('www.moderokyc.com', pageWidth - margin, 9 + 6, { align: 'right' });
    };

    const sectionTitle = (title) => {
      checkPage(14);
      pdf.setFillColor(...orange);
      pdf.rect(margin, y, 3, 7, 'F');
      pdf.setTextColor(...orange);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text(title.toUpperCase(), margin + 6, y + 5.5);
      // Thin line
      pdf.setDrawColor(...borderGray);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 6, y + 7.5, pageWidth - margin, y + 7.5);
      y += 13;
    };

    const bodyText = (text, bold = false) => {
      pdf.setFont(undefined, bold ? 'bold' : 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...darkGray);
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach(line => {
        checkPage(6);
        pdf.text(line, margin, y);
        y += 5.5;
      });
    };

    const labelValue = (label, value) => {
      checkPage(7);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...midGray);
      pdf.text(label, margin, y);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...darkGray);
      pdf.text(value || '—', margin + 38, y);
      y += 6.5;
    };

    // ─── BUILD PDF ─────────────────────────────────────────────────

    // Header
    drawHeader();
    y = 26;

    // Document title
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESIDENTIAL RENTAL AGREEMENT', pageWidth / 2, y, { align: 'center' });
    y += 7;

    // Subtitle line
    pdf.setFillColor(...orange);
    pdf.rect(pageWidth / 2 - 25, y, 50, 0.8, 'F');
    y += 6;

    // Meta line
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...midGray);
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    pdf.text(`Agreement Date: ${today}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Intro text
    bodyText(`This Rental Agreement ("Agreement") is entered into as of ${today}, between the Landlord and the Tenant, under the terms and conditions set forth below.`);
    y += 4;

    // ── PARTIES ──
    sectionTitle('1. Parties');

    // Two-column party boxes
    const boxW = (maxWidth - 6) / 2;

    // Landlord box
    pdf.setFillColor(...lightGray);
    pdf.roundedRect(margin, y, boxW, 28, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...orange);
    pdf.text('LANDLORD', margin + 4, y + 7);
    pdf.setTextColor(...darkGray);
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(9);
    pdf.text(contract.landlord_name || '—', margin + 4, y + 14);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...midGray);
    pdf.text(contract.landlord_email || '—', margin + 4, y + 20);

    // Tenant box
    const tx = margin + boxW + 6;
    pdf.setFillColor(...lightGray);
    pdf.roundedRect(tx, y, boxW, 28, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...orange);
    pdf.text('TENANT', tx + 4, y + 7);
    pdf.setTextColor(...darkGray);
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(9);
    pdf.text(contract.tenant_name || '—', tx + 4, y + 14);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...midGray);
    pdf.text(contract.tenant_email || '—', tx + 4, y + 20);

    y += 34;

    // ── PROPERTY ──
    sectionTitle('2. Property');
    labelValue('Address:', contract.property_address || '—');
    y += 2;

    // ── TERM ──
    sectionTitle('3. Lease Term');
    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    labelValue('Start Date:', fmt(contract.lease_start_date));
    labelValue('End Date:', fmt(contract.lease_end_date));
    y += 2;

    // ── FINANCIAL ──
    sectionTitle('4. Rent & Deposit');

    // Highlight box
    pdf.setFillColor(255, 237, 213); // orange-50
    pdf.roundedRect(margin, y, maxWidth, 20, 2, 2, 'F');
    pdf.setDrawColor(...orange);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y, maxWidth, 20, 2, 2, 'S');

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...midGray);
    pdf.text('Monthly Rent', margin + 8, y + 7);
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...orange);
    pdf.text(`€${Number(contract.monthly_rent || 0).toLocaleString()}`, margin + 8, y + 15);

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...midGray);
    pdf.text('Security Deposit', pageWidth / 2 + 10, y + 7);
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...darkGray);
    pdf.text(`€${Number(contract.deposit_amount || 0).toLocaleString()}`, pageWidth / 2 + 10, y + 15);

    y += 26;

    // ── TERMS & CONDITIONS ──
    sectionTitle('5. Terms & Conditions');
    if (contract.contract_content) {
      bodyText(contract.contract_content);
    } else {
      bodyText('No additional terms specified.');
    }
    y += 6;

    // ── SIGNATURES ──
    checkPage(55);
    sectionTitle('6. Signatures');

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...midGray);
    pdf.text('"By signing below, the parties confirm and agree to all the contents of this Agreement."', pageWidth / 2, y, { align: 'center' });
    y += 8;

    const sigBoxH = 40;
    const sigBoxW = (maxWidth - 6) / 2;

    // Draw signature box helper
    const drawSigBox = (x, label, name, signature, signedDate, isSigned) => {
      pdf.setFillColor(...white);
      pdf.setDrawColor(...borderGray);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(x, y, sigBoxW, sigBoxH, 2, 2, 'FD');

      // Header bar
      pdf.setFillColor(isSigned ? 34 : 241, isSigned ? 197 : 245, isSigned ? 94 : 245);
      pdf.roundedRect(x, y, sigBoxW, 10, 2, 2, 'F');
      pdf.rect(x, y + 6, sigBoxW, 4, 'F'); // flatten bottom corners

      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(isSigned ? 21 : 100, isSigned ? 128 : 100, isSigned ? 61 : 100);
      pdf.text(label, x + 4, y + 6.5);

      if (isSigned) {
        pdf.setFontSize(7);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(21, 128, 61);
        pdf.text('✔ SIGNED', x + sigBoxW - 4, y + 6.5, { align: 'right' });
      }

      // Content
      const lineY = y + 16;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...midGray);
      pdf.text('Name:', x + 4, lineY);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...darkGray);
      pdf.text(name || '—', x + 18, lineY);

      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...midGray);
      pdf.text('Signature:', x + 4, lineY + 8);
      if (isSigned && signature) {
        pdf.setFont(undefined, 'italic');
        pdf.setTextColor(...orange);
        pdf.text(signature, x + 24, lineY + 8);
      } else {
        pdf.setDrawColor(...borderGray);
        pdf.setLineWidth(0.3);
        pdf.line(x + 24, lineY + 8, x + sigBoxW - 4, lineY + 8);
      }

      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...midGray);
      pdf.text('Date:', x + 4, lineY + 16);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(...darkGray);
      pdf.text(signedDate ? new Date(signedDate).toLocaleDateString('en-GB') : '_______________', x + 18, lineY + 16);
    };

    drawSigBox(margin, 'LANDLORD', contract.landlord_name, contract.landlord_signature, contract.landlord_signed_date, contract.landlord_signed);
    drawSigBox(margin + sigBoxW + 6, 'TENANT', contract.tenant_name, contract.tenant_signature, contract.tenant_signed_date, contract.tenant_signed);

    y += sigBoxH + 10;

    // ── FOOTER on last page ──
    const footerY = pageHeight - 12;
    pdf.setFillColor(...orange);
    pdf.rect(0, footerY - 2, pageWidth, 0.5, 'F');
    pdf.setFontSize(7);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...midGray);
    pdf.text('Generated by Modero · www.moderokyc.com · This document is legally binding once signed by all parties.', pageWidth / 2, footerY + 3, { align: 'center' });

    // Total pages footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(...midGray);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 3, { align: 'right' });
    }

    const pdfData = pdf.output('arraybuffer');
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfData)));

    return Response.json({
      pdf_url: `data:application/pdf;base64,${base64Pdf}`,
      pdf_name: `Modero_Contract_${(contract.tenant_name || 'tenant').replace(/\s+/g, '_')}.pdf`
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});