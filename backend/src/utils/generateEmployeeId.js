import Employee from '../models/Employee.js';

export const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const count = await Employee.countDocuments({});
  const employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  return employeeId;
};

