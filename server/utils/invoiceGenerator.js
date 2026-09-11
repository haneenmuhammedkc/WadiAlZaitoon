import PDFDocument from "pdfkit";

/**
 * Escapes unsafe string characters for PDF rendering
 */
const safeText = (val, fallback = "N/A") => {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
};

/**
 * Generates a clean, professional A4 PDF invoice for a confirmed Wadi Al Zaitoon booking.
 * Returns a Promise that resolves to a Buffer containing the complete PDF binary.
 *
 * @param {Object} data - Contains booking, payment, package, buyer, and traveller details.
 * @returns {Promise<Buffer>} PDF Buffer
 */
export const generateBookingInvoicePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const { booking, payment, travellers = [] } = data;

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Invoice - ${booking?._id}`,
          Author: "Wadi Al Zaitoon Tourism",
          Subject: "Booking Payment Invoice",
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const navyColor = "#0F172A";
      const coralColor = "#E11D48";
      const slateDark = "#334155";
      const slateLight = "#64748B";
      const bgLight = "#F8FAFC";
      const borderColor = "#E2E8F0";

      const bookingIdStr = String(booking?._id || "000000");
      const createdDate = booking?.createdAt ? new Date(booking.createdAt) : new Date();
      const invoiceYear = createdDate.getFullYear();
      const invoiceSuffix = bookingIdStr.slice(-6).toUpperCase();
      const invoiceNumber = `INV-${invoiceYear}-${invoiceSuffix}`;
      const formattedInvoiceDate = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const buyerName = safeText(booking?.buyer?.username, "Customer");
      const buyerEmail = safeText(booking?.buyer?.email, "N/A");
      const buyerPhone = safeText(booking?.buyer?.phone, "N/A");

      const pkgName = safeText(booking?.packageDetails?.packageName, "Tour Package");
      const pkgDestination = safeText(booking?.packageDetails?.packageDestination, "N/A");
      const travelDate = safeText(booking?.date, "Scheduled");
      const personsCount = Number(booking?.persons) || 1;
      const daysCount = booking?.packageDetails?.packageDays || 1;
      const nightsCount = booking?.packageDetails?.packageNights || 1;
      const accommodation = safeText(booking?.packageDetails?.packageAccommodation, "Standard Stay");
      const meals = safeText(booking?.packageDetails?.packageMeals, "Included");

      const totalAmount = Number(booking?.totalPrice || payment?.amount || 0);
      const paymentId = safeText(booking?.razorpayPaymentId || payment?.providerPaymentId, "Captured");
      const orderId = safeText(booking?.razorpayOrderId || payment?.providerOrderId, "N/A");
      const paymentDate = booking?.paidAt
        ? new Date(booking.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : formattedInvoiceDate;

      // --- HEADER SECTION ---
      doc
        .fillColor(navyColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("WADI AL ZAITOON", 40, 40);

      doc
        .fillColor(coralColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("TRAVEL & TOURISM SERVICES", 40, 66);

      // Right-aligned Invoice Meta Block
      doc
        .fillColor(navyColor)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("BOOKING PAYMENT INVOICE", 320, 40, { align: "right" });

      doc
        .fillColor(slateLight)
        .fontSize(9)
        .font("Helvetica")
        .text(`Invoice No: ${invoiceNumber}`, 320, 58, { align: "right" })
        .text(`Date: ${formattedInvoiceDate}`, 320, 70, { align: "right" })
        .text(`Booking Ref: ${bookingIdStr}`, 320, 82, { align: "right" });

      // Horizontal Divider
      doc
        .moveTo(40, 102)
        .lineTo(555, 102)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      // --- CUSTOMER & STATUS SUMMARY BOX ---
      const boxY = 114;
      doc
        .roundedRect(40, boxY, 515, 80, 8)
        .fillAndStroke(bgLight, borderColor);

      // Customer Info Column
      doc
        .fillColor(coralColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("CUSTOMER DETAILS", 54, boxY + 12);

      doc
        .fillColor(navyColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(buyerName, 54, boxY + 24);

      doc
        .fillColor(slateDark)
        .fontSize(9)
        .font("Helvetica")
        .text(`Email: ${buyerEmail}`, 54, boxY + 40)
        .text(`Phone: ${buyerPhone}`, 54, boxY + 54);

      // Reservation Status Column
      doc
        .fillColor(coralColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("RESERVATION STATUS", 340, boxY + 12);

      doc
        .fillColor(navyColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Booking Status: CONFIRMED", 340, boxY + 24);

      doc
        .fillColor("#166534") // Emerald green text
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Payment Status: CAPTURED / PAID", 340, boxY + 40);

      doc
        .fillColor(slateDark)
        .fontSize(9)
        .font("Helvetica")
        .text("Method: Razorpay Standard Checkout", 340, boxY + 54);

      // --- TRIP DETAILS SECTION ---
      const tripY = 210;
      doc
        .fillColor(navyColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("ITINERARY & RESERVATION SPECS", 40, tripY);

      doc
        .moveTo(40, tripY + 16)
        .lineTo(555, tripY + 16)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      const detailsGridY = tripY + 26;

      const drawDetailItem = (label, val, x, y) => {
        doc
          .fillColor(slateLight)
          .fontSize(8)
          .font("Helvetica-Bold")
          .text(label.toUpperCase(), x, y);

        doc
          .fillColor(navyColor)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(val, x, y + 12, { width: 230 });
      };

      drawDetailItem("Package Title", pkgName, 40, detailsGridY);
      drawDetailItem("Destination", pkgDestination, 300, detailsGridY);

      drawDetailItem("Departure Date", travelDate, 40, detailsGridY + 36);
      drawDetailItem("Tour Duration", `${nightsCount} Nights / ${daysCount} Days`, 300, detailsGridY + 36);

      drawDetailItem("Total Travelers", `${personsCount} ${personsCount === 1 ? "Person" : "Persons"}`, 40, detailsGridY + 72);
      drawDetailItem("Accommodation", accommodation, 300, detailsGridY + 72);

      // --- TRAVELLER ROSTER TABLE ---
      let currentY = detailsGridY + 120;

      if (Array.isArray(travellers) && travellers.length > 0) {
        doc
          .fillColor(navyColor)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("REGISTERED PASSENGER MANIFEST", 40, currentY);

        doc
          .moveTo(40, currentY + 16)
          .lineTo(555, currentY + 16)
          .lineWidth(1)
          .strokeColor(borderColor)
          .stroke();

        const tableHeaderY = currentY + 24;
        doc
          .rect(40, tableHeaderY, 515, 20)
          .fill(bgLight);

        doc
          .fillColor(navyColor)
          .fontSize(8)
          .font("Helvetica-Bold")
          .text("#", 50, tableHeaderY + 6)
          .text("PASSENGER FULL NAME", 80, tableHeaderY + 6)
          .text("AGE", 340, tableHeaderY + 6)
          .text("GENDER", 440, tableHeaderY + 6);

        let rowY = tableHeaderY + 24;
        travellers.forEach((t, idx) => {
          if (rowY > 700) {
            doc.addPage({ size: "A4", margin: 40 });
            rowY = 40;
          }

          doc
            .fillColor(slateDark)
            .fontSize(9)
            .font("Helvetica")
            .text(String(idx + 1), 50, rowY)
            .text(safeText(t.fullName, "Passenger"), 80, rowY, { width: 240 })
            .text(String(t.age ?? "N/A"), 340, rowY)
            .text(safeText(t.gender, "N/A"), 440, rowY);

          doc
            .moveTo(40, rowY + 14)
            .lineTo(555, rowY + 14)
            .lineWidth(0.5)
            .strokeColor("#F1F5F9")
            .stroke();

          rowY += 20;
        });

        currentY = rowY + 10;
      }

      if (currentY > 660) {
        doc.addPage({ size: "A4", margin: 40 });
        currentY = 40;
      }

      // --- FINANCIAL BREAKDOWN & TOTAL ---
      doc
        .fillColor(navyColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("PAYMENT TRANSACTION BREAKDOWN", 40, currentY);

      doc
        .moveTo(40, currentY + 16)
        .lineTo(555, currentY + 16)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      const finY = currentY + 26;

      // Table Header
      doc
        .rect(40, finY, 515, 20)
        .fill(bgLight);

      doc
        .fillColor(navyColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("DESCRIPTION", 50, finY + 6)
        .text("TRANSACTION DETAILS", 250, finY + 6)
        .text("AMOUNT (INR)", 460, finY + 6, { align: "right" });

      const finRowY = finY + 26;

      doc
        .fillColor(slateDark)
        .fontSize(9)
        .font("Helvetica")
        .text(`${pkgName} (${personsCount} x Travelers)`, 50, finRowY, { width: 190 })
        .text(`Pay ID: ${paymentId}\nOrder ID: ${orderId}\nPaid On: ${paymentDate}`, 250, finRowY, { width: 200 })
        .font("Helvetica-Bold")
        .text(`₹${totalAmount.toLocaleString()}`, 460, finRowY, { align: "right" });

      // Total Box Block
      const totalBoxY = finRowY + 46;
      doc
        .rect(340, totalBoxY, 215, 34)
        .fill(navyColor);

      doc
        .fillColor("#FFFFFF")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("TOTAL AMOUNT PAID", 352, totalBoxY + 10);

      doc
        .fillColor("#FFFFFF")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`₹${totalAmount.toLocaleString()} INR`, 352, totalBoxY + 10, { align: "right" });

      // --- FOOTER SECTION ---
      const footerY = 760;
      doc
        .moveTo(40, footerY)
        .lineTo(555, footerY)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      doc
        .fillColor(slateLight)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "Thank you for choosing Wadi Al Zaitoon Tourism. This is a computer-generated booking payment invoice and requires no physical signature.",
          40,
          footerY + 10,
          { align: "center", width: 515 }
        )
        .text(
          "Wadi Al Zaitoon Tourism & Travel Services • Support: support@wadialzaitoon.com",
          40,
          footerY + 22,
          { align: "center", width: 515 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
