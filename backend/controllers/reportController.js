import Attendance from '../models/Attendance.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// 🔹 GET REPORT (FILTER + ROLE BASED)
export const getReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // 🔐 Role-based access
    if (req.user.role === 'employee') {
      filter.user = req.user.id;
    }

    if (req.user.role === 'manager' && userId) {
      filter.user = userId;
    }

    if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    const data = await Attendance.find(filter).populate('user');

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 EXPORT EXCEL
export const exportExcel = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // 🔐 Role-based access
    if (req.user.role === 'employee') {
      filter.user = req.user.id;
    }

    if (req.user.role === 'manager' && userId) {
      filter.user = userId;
    }

    if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    const data = await Attendance.find(filter).populate('user');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Punch In', key: 'punchIn', width: 25 },
      { header: 'Punch Out', key: 'punchOut', width: 25 },
      { header: 'Working Hours', key: 'hours', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Selfie URL', key: 'selfie', width: 30 },
      { header: 'Location', key: 'location', width: 25 }
    ];

    data.forEach(d => {
      sheet.addRow({
        name: d.user?.name || 'N/A',
        date: d.date || 'N/A',
        punchIn: d.punchIn?.time
          ? new Date(d.punchIn.time).toLocaleString()
          : 'N/A',
        punchOut: d.punchOut?.time
          ? new Date(d.punchOut.time).toLocaleString()
          : 'N/A',
        hours: d.workingHours ?? 0,
        status: d.status || 'N/A',
        selfie: d.punchIn?.selfie || 'N/A',
        location: d.punchIn?.location
          ? `${d.punchIn.location.lat}, ${d.punchIn.location.lng}`
          : 'N/A'
      });
    });

    // Header style
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 EXPORT PDF
export const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // 🔐 Role-based access
    if (req.user.role === 'employee') {
      filter.user = req.user.id;
    }

    if (req.user.role === 'manager' && userId) {
      filter.user = userId;
    }

    if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    const data = await Attendance.find(filter).populate('user');

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance_report.pdf'
    );

    doc.pipe(res);

    // Title
    doc.fontSize(18).text('Attendance Report', { align: 'center' });
    doc.moveDown();

    data.forEach(d => {
      doc.fontSize(12).text(`Name: ${d.user?.name || 'N/A'}`);
      doc.text(`Date: ${d.date || 'N/A'}`);
      doc.text(
        `Punch In: ${
          d.punchIn?.time
            ? new Date(d.punchIn.time).toLocaleString()
            : 'N/A'
        }`
      );
      doc.text(
        `Punch Out: ${
          d.punchOut?.time
            ? new Date(d.punchOut.time).toLocaleString()
            : 'N/A'
        }`
      );
      doc.text(`Working Hours: ${d.workingHours ?? 0}`);
      doc.text(`Status: ${d.status || 'N/A'}`);
      doc.text(`Selfie: ${d.punchIn?.selfie || 'N/A'}`);
      doc.text(
        `Location: ${
          d.punchIn?.location
            ? `${d.punchIn.location.lat}, ${d.punchIn.location.lng}`
            : 'N/A'
        }`
      );

      doc.moveDown();
      doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke(); // divider
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};