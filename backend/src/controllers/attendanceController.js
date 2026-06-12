import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { sendError } from "../utils/errorResponse.js";

export const punchIn = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Check if already punched in today
    const existingAttendance = await Attendance.findOne({
      employee: req.employee._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ _id: -1 });

    if (existingAttendance && existingAttendance.punchIn) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
      attendance.punchIn = {
        time: new Date(),
        location: req.body.location || "Office",
      };
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: req.employee._id,
        date: today,
        punchIn: {
          time: new Date(),
          location: req.body.location || "Office",
        },
        status: "incomplete",
      });
    }

    res.json({ message: "Punched in successfully", attendance });
  } catch (error) {
    sendError(res, error);
  }
};

export const punchOut = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Query with explicit conditions to find only records without punch out
    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      punchIn: { $exists: true, $ne: null },
      punchOut: { $exists: false },
    }).sort({ _id: -1 });

    if (!attendance) {
      // Check if there's a record at all
      const existingRecord = await Attendance.findOne({
        employee: req.employee._id,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      }).sort({ _id: -1 });

      if (!existingRecord) {
        return res.status(400).json({ message: "Please punch in first" });
      }

      if (existingRecord.punchOut) {
        return res.status(400).json({ message: "Already punched out today" });
      }

      return res.status(400).json({ message: "Invalid attendance record" });
    }

    const updated = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        punchOut: {
          time: new Date(),
          location: req.body.location || "Office",
        },
      },
      { new: true },
    );

    res.json({ message: "Punched out successfully", attendance: updated });
  } catch (error) {
    sendError(res, error);
  }
};

// Admin/HR can punch in/out for employees
export const punchInForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let employee = null;

    // Check if employeeId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);

    if (isValidObjectId) {
      employee = await Employee.findById(employeeId);
    }

    // If not found or not a valid ObjectId, try by employeeId string
    if (!employee) {
      employee = await Employee.findOne({ employeeId });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ _id: -1 });

    if (existingAttendance && existingAttendance.punchIn) {
      return res
        .status(400)
        .json({ message: "Employee already punched in today" });
    }

    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
      attendance.punchIn = {
        time: new Date(),
        location: req.body.location || "Office",
      };
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employee._id,
        date: today,
        punchIn: {
          time: new Date(),
          location: req.body.location || "Office",
        },
        status: "incomplete",
      });
    }

    res.json({ message: "Punched in successfully for employee", attendance });
  } catch (error) {
    sendError(res, error);
  }
};

export const punchOutForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let employee = null;

    // Check if employeeId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);

    if (isValidObjectId) {
      employee = await Employee.findById(employeeId);
    }

    // If not found or not a valid ObjectId, try by employeeId string
    if (!employee) {
      employee = await Employee.findOne({ employeeId });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Query with explicit conditions to find only records without punch out
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      punchIn: { $exists: true, $ne: null },
      punchOut: { $exists: false },
    }).sort({ _id: -1 });

    if (!attendance) {
      // Check if there's a record at all
      const existingRecord = await Attendance.findOne({
        employee: employee._id,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      }).sort({ _id: -1 });

      if (!existingRecord) {
        return res
          .status(400)
          .json({ message: "Employee has not punched in today" });
      }

      if (existingRecord.punchOut) {
        return res
          .status(400)
          .json({ message: "Employee already punched out today" });
      }

      return res.status(400).json({ message: "Invalid attendance record" });
    }

    attendance.punchOut = {
      time: new Date(),
      location: req.body.location || "Office",
    };

    // Save to trigger pre-save hook for working hours calculation
    await attendance.save();

    res.json({ message: "Punched out successfully for employee", attendance });
  } catch (error) {
    sendError(res, error);
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(403).json({ message: "Employee profile not found" });
    }

    const { startDate, endDate } = req.query;
    const query = { employee: req.employee._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    // Get today's status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const todayAttendance = await Attendance.findOne({
      employee: req.employee._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ _id: -1 });

    res.json({
      attendance,
      todayStatus: todayAttendance || { status: "absent" },
    });
  } catch (error) {
    sendError(res, error);
  }
};

export const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findById(id);
    }

    // If not found or not a valid ObjectId, try by employeeId string
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const query = { employee: employee._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "firstName lastName employeeId")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    sendError(res, error);
  }
};

export const regularizeAttendance = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    attendance.status = status;
    attendance.isRegularized = true;
    attendance.regularizationReason = reason;
    await attendance.save();

    res.json({ message: "Attendance regularized successfully", attendance });
  } catch (error) {
    sendError(res, error);
  }
};
export const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const query = {};

    if (employeeId) {
      // Check if employeeId is a valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);

      if (isValidObjectId) {
        query.employee = employeeId;
      } else {
        // If it's an employee ID string, find the employee and get their _id
        const employee = await Employee.findOne({ employeeId });
        if (employee) {
          query.employee = employee._id;
        } else {
          // Employee not found, return empty array
          return res.json([]);
        }
      }
    }

    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("employee", "firstName lastName employeeId department")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    sendError(res, error);
  }
};
