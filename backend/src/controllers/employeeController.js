import Employee from "../models/Employee.js";
import User from "../models/User.js";
import LeaveBalance from "../models/LeaveBalance.js";
import { generateEmployeeId } from "../utils/generateEmployeeId.js";
import { generateToken } from "../utils/generateToken.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      dateOfJoining,
      department,
      position,
      salary,
      address,
      emergencyContact,
    } = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    const employeeId = await generateEmployeeId();

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      dateOfJoining: dateOfJoining || new Date(),
      department,
      position,
      salary: salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 },
      address,
      emergencyContact,
    });

    // Create user account
    const defaultPassword = `${employeeId}@123`; // Default password
    const user = await User.create({
      email,
      password: defaultPassword,
      role: "employee",
      employeeId: employee._id,
    });

    // Create leave balance
    await LeaveBalance.create({
      employee: employee._id,
      annual: { total: 12, used: 0, remaining: 12 },
      casual: { total: 6, used: 0, remaining: 6 },
      sick: { total: 6, used: 0, remaining: 6 },
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee,
      credentials: {
        email,
        password: defaultPassword,
        employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { department, isActive, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findById(id);
    }

    // If not found by _id or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Authorization: Allow admin/hr to view any employee, or employees to view their own
    if (
      req.user.role === "employee" &&
      req.employee?._id?.toString() !== employee._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this employee's profile" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findById(id);
    }

    // If not found by _id or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Authorization: Allow admin/hr to update any employee, or employees to update their own
    if (
      req.user.role === "employee" &&
      req.employee?._id?.toString() !== employee._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this employee's profile" });
    }

    // Update the employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const isActiveValue = isActive !== undefined ? isActive : true;
    const { id } = req.params;

    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findByIdAndUpdate(
        id,
        { isActive: isActiveValue },
        { new: true },
      );
    }

    // If not found by _id or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOneAndUpdate(
        { employeeId: id },
        { isActive: isActiveValue },
        { new: true },
      );
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update user status
    await User.findOneAndUpdate(
      { employeeId: employee._id },
      { isActive: isActiveValue },
    );

    res.json({ message: "Employee status updated", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findByIdAndDelete(id);
    }

    // If not found by _id or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOneAndDelete({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete associated user
    await User.findOneAndDelete({ employeeId: employee._id });

    // Delete associated leave balance
    await LeaveBalance.findOneAndDelete({ employee: employee._id });

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setSalary = async (req, res) => {
  try {
    const { basic, hra, allowances, deductions } = req.body;
    const { id } = req.params;

    let employee = null;

    // Check if id is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      employee = await Employee.findByIdAndUpdate(
        id,
        {
          salary: {
            basic: basic || 0,
            hra: hra || 0,
            allowances: allowances || 0,
            deductions: deductions || 0,
          },
        },
        { new: true },
      );
    }

    // If not found by _id or not a valid ObjectId, try by employeeId
    if (!employee) {
      employee = await Employee.findOneAndUpdate(
        { employeeId: id },
        {
          salary: {
            basic: basic || 0,
            hra: hra || 0,
            allowances: allowances || 0,
            deductions: deductions || 0,
          },
        },
        { new: true },
      );
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Salary updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
