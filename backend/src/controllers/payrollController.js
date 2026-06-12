import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import PDFDocument from 'pdfkit';
import { sendError } from '../utils/errorResponse.js';

const calculateSalary = (salary, workingDays, presentDays) => {
  const basic = salary.basic || 0;
  const hra = salary.hra || 0;
  const allowances = salary.allowances || 0;
  const gross = basic + hra + allowances;

  // Simple tax calculation (10% of gross)
  const tax = gross * 0.1;
  const providentFund = basic * 0.12; // 12% of basic
  const deductions = tax + providentFund + (salary.deductions || 0);

  // Pro-rated salary based on attendance
  const attendanceRatio = presentDays / workingDays;
  const netSalary = (gross - deductions) * attendanceRatio;

  return {
    basic,
    hra,
    allowances,
    gross,
    deductions: {
      tax,
      providentFund,
      other: salary.deductions || 0,
      total: deductions
    },
    netSalary: Math.round(netSalary)
  };
};

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: 'Please provide employeeId, month, and year' });
    }

    // Give recent attendance writes a moment to settle before reading them
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll already generated for this month' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Calculate working days in month (exclude weekends)
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const weekday = new Date(year, month - 1, day).getDay();
      if (weekday !== 0 && weekday !== 6) {
        workingDays++;
      }
    }

    // Get attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['present', 'late'] }
    });

    const presentDays = attendance.length;

    // Get leave days
    const leaves = await Leave.find({
      employee: employeeId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      status: 'approved'
    });

    let leaveDays = 0;
    leaves.forEach(leave => {
      const leaveStart = new Date(Math.max(new Date(leave.startDate), startDate));
      const leaveEnd = new Date(Math.min(new Date(leave.endDate), endDate));
      leaveDays += Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
    });

    const salaryDetails = calculateSalary(employee.salaryAtJoining || employee.salary, workingDays, presentDays);

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      salary: {
        basic: salaryDetails.basic,
        hra: salaryDetails.hra,
        allowances: salaryDetails.allowances,
        gross: salaryDetails.gross
      },
      deductions: salaryDetails.deductions,
      netSalary: salaryDetails.netSalary,
      workingDays,
      presentDays,
      leaveDays,
      generatedBy: req.user._id
    });

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName employeeId department');

    res.status(201).json({ message: 'Payroll generated successfully', payroll: populatedPayroll });
  } catch (error) {
    sendError(res, error);
  }
};

export const getMyPayrolls = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: 'Employee profile not found' });
    }

    const payrolls = await Payroll.find({ employee: req.employee._id })
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    sendError(res, error);
  }
};

export const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const query = {};

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employeeId) query.employee = employeeId;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    sendError(res, error);
  }
};

export const downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId department email');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    // Check authorization
    if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.employee?._id?.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.employee.employeeId}-${payroll.month}-${payroll.year}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Employee: ${payroll.employee.firstName} ${payroll.employee.lastName}`, { align: 'left' });
    doc.text(`Employee ID: ${payroll.employee.employeeId}`);
    doc.text(`Department: ${payroll.employee.department}`);
    doc.text(`Period: ${payroll.month}/${payroll.year}`);
    doc.moveDown();

    // Salary Details
    doc.fontSize(14).text('EARNINGS', { underline: true });
    doc.fontSize(12);
    doc.text(`Basic Salary: ₹${payroll.salary.basic}`);
    doc.text(`HRA: ₹${payroll.salary.hra}`);
    doc.text(`Allowances: ₹${payroll.salary.allowances}`);
    doc.text(`Gross Salary: ₹${payroll.salary.gross}`);
    doc.moveDown();

    // Deductions
    doc.fontSize(14).text('DEDUCTIONS', { underline: true });
    doc.fontSize(12);
    doc.text(`Tax: ₹${payroll.deductions.tax}`);
    doc.text(`Provident Fund: ₹${payroll.deductions.providentFund}`);
    doc.text(`Other: ₹${payroll.deductions.other}`);
    doc.text(`Total Deductions: ₹${payroll.deductions.total}`);
    doc.moveDown();

    // Net Salary
    doc.fontSize(16).text(`Net Salary: ₹${payroll.netSalary}`, { align: 'right' });
    doc.moveDown();

    // Attendance Summary
    doc.fontSize(14).text('ATTENDANCE SUMMARY', { underline: true });
    doc.fontSize(12);
    doc.text(`Working Days: ${payroll.workingDays}`);
    doc.text(`Present Days: ${payroll.presentDays}`);
    doc.text(`Leave Days: ${payroll.leaveDays}`);

    doc.end();
  } catch (error) {
    sendError(res, error);
  }
};

