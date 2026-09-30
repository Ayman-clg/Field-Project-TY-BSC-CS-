import PDFDocument from 'pdfkit';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Stock from '../models/Stock.js';

/**
 * @desc    Stream Purchase Order PDF using PDFKit
 * @route   GET /api/reports/po/:id/pdf
 * @access  Private
 */
export const streamPurchaseOrderPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await PurchaseOrder.findById(id)
      .populate('targetWarehouse')
      .populate('createdBy', 'name email role')
      .populate('items.product');

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="PO_${po.poNumber}.pdf"`
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Color Palette
    const primaryColor = '#1E3A8A'; // Navy
    const secondaryColor = '#3B82F6'; // Blue
    const darkText = '#1F2937'; // Slate 800
    const lightText = '#6B7280'; // Slate 500
    const borderColor = '#E5E7EB'; // Gray 200

    // Header Background Accent
    doc.rect(40, 40, 515, 60).fill('#F8FAFC');

    // Company Header
    doc
      .fillColor(primaryColor)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('APEX LOGISTICS & SUPPLY CHAIN', 55, 52);

    doc
      .fillColor(lightText)
      .fontSize(9)
      .font('Helvetica')
      .text('Enterprise Multi-Location SCM • Global Distribution Center', 55, 76)
      .text('support@apexsupplychain.internal | +1 (800) 555-APEX', 55, 88);

    // PO Title on the right
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PURCHASE ORDER', 360, 52, { align: 'right', width: 180 });

    doc
      .fillColor(secondaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`#${po.poNumber}`, 360, 72, { align: 'right', width: 180 });

    doc
      .fillColor(lightText)
      .fontSize(9)
      .font('Helvetica')
      .text(`Status: ${po.status}`, 360, 88, { align: 'right', width: 180 });

    doc.moveDown(2);

    // Meta Info Row (Supplier & Warehouse)
    const startY = 120;
    
    // Vendor Box
    doc.rect(40, startY, 245, 95).stroke(borderColor);
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('VENDOR / SUPPLIER:', 50, startY + 10);

    doc
      .fillColor(darkText)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(po.supplier?.name || 'N/A', 50, startY + 25)
      .font('Helvetica')
      .fontSize(9)
      .fillColor(lightText)
      .text(po.supplier?.email || 'No email provided', 50, startY + 40)
      .text(po.supplier?.phone || 'No phone provided', 50, startY + 54)
      .text(po.supplier?.address || 'Standard Vendor Address', 50, startY + 68);

    // Destination Warehouse Box
    doc.rect(310, startY, 245, 95).stroke(borderColor);
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('SHIP TO WAREHOUSE:', 320, startY + 10);

    doc
      .fillColor(darkText)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(po.targetWarehouse?.name || 'Central Distribution', 320, startY + 25)
      .font('Helvetica')
      .fontSize(9)
      .fillColor(lightText)
      .text(`Code: ${po.targetWarehouse?.code || 'WH-01'}`, 320, startY + 40)
      .text(`Location: ${po.targetWarehouse?.location || 'Main Depot'}`, 320, startY + 54)
      .text(`Order Date: ${new Date(po.createdAt).toLocaleDateString()}`, 320, startY + 68)
      .text(`Expected: ${new Date(po.expectedDeliveryDate).toLocaleDateString()} | Terms: ${po.paymentTerms || 'Net 30'}`, 320, startY + 82);

    // Items Table Header
    const tableTop = 230;
    doc.rect(40, tableTop, 515, 22).fill(primaryColor);

    doc
      .fillColor('#FFFFFF')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ITEM #', 45, tableTop + 6)
      .text('SKU', 95, tableTop + 6)
      .text('DESCRIPTION', 170, tableTop + 6)
      .text('QTY', 370, tableTop + 6, { width: 40, align: 'right' })
      .text('UNIT PRICE', 420, tableTop + 6, { width: 60, align: 'right' })
      .text('TOTAL', 490, tableTop + 6, { width: 60, align: 'right' });

    let currentY = tableTop + 24;
    doc.font('Helvetica').fontSize(9);

    po.items.forEach((item, index) => {
      // Zebra background
      if (index % 2 === 0) {
        doc.rect(40, currentY, 515, 20).fill('#F9FAFB');
      }

      doc
        .fillColor(darkText)
        .text((index + 1).toString(), 45, currentY + 5)
        .text(item.sku || item.product?.sku || 'SKU-00', 95, currentY + 5)
        .text(item.name || item.product?.name || 'Product Item', 170, currentY + 5, { width: 190, ellipsis: true })
        .text(item.quantity.toString(), 370, currentY + 5, { width: 40, align: 'right' })
        .text(`$${Number(item.unitPrice).toFixed(2)}`, 420, currentY + 5, { width: 60, align: 'right' })
        .text(`$${Number(item.total).toFixed(2)}`, 490, currentY + 5, { width: 60, align: 'right' });

      currentY += 20;
    });

    // Divider Line
    doc.moveTo(40, currentY + 5).lineTo(555, currentY + 5).stroke(borderColor);
    currentY += 15;

    // Totals Section
    const totalsLeft = 360;
    doc.font('Helvetica').fontSize(9).fillColor(lightText);
    doc.text('Subtotal:', totalsLeft, currentY, { width: 100, align: 'right' });
    doc.fillColor(darkText).text(`$${Number(po.subtotal).toFixed(2)}`, 470, currentY, { width: 80, align: 'right' });

    currentY += 15;
    doc.fillColor(lightText).text(`Tax (${po.taxRate || 5}%):`, totalsLeft, currentY, { width: 100, align: 'right' });
    doc.fillColor(darkText).text(`$${Number(po.taxAmount || 0).toFixed(2)}`, 470, currentY, { width: 80, align: 'right' });

    currentY += 18;
    doc.rect(totalsLeft, currentY - 4, 195, 24).fill('#EFF6FF');
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('GRAND TOTAL:', totalsLeft + 10, currentY + 2)
      .text(`$${Number(po.totalAmount).toFixed(2)}`, 470, currentY + 2, { width: 80, align: 'right' });

    // Notes & Signatures
    const bottomY = Math.max(currentY + 50, 640);

    // Notes
    doc.rect(40, bottomY, 270, 70).stroke(borderColor);
    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('NOTES & TERMS:', 50, bottomY + 8);

    doc
      .fillColor(lightText)
      .fontSize(8)
      .font('Helvetica')
      .text(
        po.notes || '1. All deliveries must match approved SKU standards.\n2. Invoices must reference this PO number.\n3. Inspection completed at receiving bay.',
        50,
        bottomY + 22,
        { width: 250, lineGap: 2 }
      );

    // Authorized Signature Box
    doc.rect(330, bottomY, 225, 70).stroke(borderColor);
    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('AUTHORIZED APPROVAL:', 340, bottomY + 8);

    doc
      .fillColor(darkText)
      .fontSize(8)
      .font('Helvetica')
      .text(`Issued by: ${po.createdBy?.name || 'Supply Chain Admin'} (${po.createdBy?.role || 'Admin'})`, 340, bottomY + 22);

    doc.moveTo(340, bottomY + 52).lineTo(530, bottomY + 52).stroke('#9CA3AF');
    doc.fontSize(7).fillColor(lightText).text('Signature & Date', 340, bottomY + 55);

    // Footer
    doc
      .fontSize(8)
      .fillColor('#9CA3AF')
      .text(
        'Apex SCM Multi-Location System • Automated Purchase Order Engine • Confidential',
        40,
        780,
        { align: 'center', width: 515 }
      );

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
