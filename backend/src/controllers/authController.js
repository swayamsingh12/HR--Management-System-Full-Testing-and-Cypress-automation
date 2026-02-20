import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "Account is inactive. Please contact administrator.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const employee = user.employeeId
      ? await Employee.findById(user.employeeId)
      : null;

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: employee?.employeeId || null,
        name: employee ? `${employee.firstName} ${employee.lastName}` : "Admin",
        department: employee?.department || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error during login" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const employee = user.employeeId
      ? await Employee.findById(user.employeeId)
      : null;

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: employee?.employeeId || null,
        name: employee ? `${employee.firstName} ${employee.lastName}` : "Admin",
        department: employee?.department || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
