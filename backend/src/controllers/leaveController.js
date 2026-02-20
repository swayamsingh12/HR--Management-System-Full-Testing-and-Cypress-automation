import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";
import Employee from "../models/Employee.js";

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const applyLeave = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    const days = calculateDays(startDate, endDate);

    // Check leave balance
    const leaveBalance = await LeaveBalance.findOne({
      employee: req.employee._id,
    });
    if (!leaveBalance) {
      return res.status(400).json({ message: "Leave balance not found" });
    }

    const balanceField = leaveBalance[leaveType];
    if (!balanceField || balanceField.remaining < days) {
      return res.status(400).json({
        message: `Insufficient ${leaveType} leave balance. Available: ${balanceField?.remaining || 0} days`,
      });
    }

    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: "pending",
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    const leaves = await Leave.find({ employee: req.employee._id }).sort({
      createdAt: -1,
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "pending" })
      .populate("employee", "firstName lastName employeeId department")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id).populate("employee");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    if (status === "rejected") {
      leave.rejectionReason = rejectionReason;
    }

    // Update leave balance if approved
    if (status === "approved") {
      const leaveBalance = await LeaveBalance.findOne({
        employee: leave.employee._id,
      });
      if (leaveBalance) {
        const balanceField = leaveBalance[leave.leaveType];
        if (balanceField) {
          balanceField.used += leave.days;
          balanceField.remaining = balanceField.total - balanceField.used;
          await leaveBalance.save();
        }
      }
    }

    await leave.save();

    res.json({ message: `Leave ${status} successfully`, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaveBalance = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    let leaveBalance = await LeaveBalance.findOne({
      employee: req.employee._id,
    });

    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        employee: req.employee._id,
        annual: { total: 12, used: 0, remaining: 12 },
        casual: { total: 6, used: 0, remaining: 6 },
        sick: { total: 6, used: 0, remaining: 6 },
      });
    }

    res.json(leaveBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { employeeId, status, startDate, endDate } = req.query;
    const query = {};

    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(query)
      .populate("employee", "firstName lastName employeeId department")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
