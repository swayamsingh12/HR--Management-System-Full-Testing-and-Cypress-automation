import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Eye,
  DollarSign,
} from 'lucide-react';
import { adminEmployeesApi } from '../../api/admin';

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  isActive: boolean;
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  department: string;
  position: string;
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  };
}

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      salary: { basic: 0, hra: 0, allowances: 0, deductions: 0 },
    },
  });

  const salaryWatch = watch('salary');

  useEffect(() => {
    loadEmployees();
  }, [filterDepartment, filterStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterDepartment) filters.department = filterDepartment;
      if (filterStatus) filters.isActive = filterStatus === 'active';

      const data = await adminEmployeesApi.getAll(filters);
      setEmployees(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await adminEmployeesApi.update(editingId, data);
        toast.success('Employee updated successfully');
      } else {
        await adminEmployeesApi.create(data);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      reset();
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.employeeId);
    reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await adminEmployeesApi.delete(id);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleActivateDeactivate = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await adminEmployeesApi.deactivate(id);
        toast.success('Employee deactivated');
      } else {
        await adminEmployeesApi.activate(id);
        toast.success('Employee activated');
      }
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSetSalary = async () => {
    if (!selectedEmployee) return;

    try {
      await adminEmployeesApi.setSalary(selectedEmployee.employeeId, salaryWatch);
      toast.success('Salary updated successfully');
      setShowSalaryModal(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update salary');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.employeeId}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const departments = [...new Set(employees.map((e) => e.department))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-2">Manage all employees in the system</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            reset();
            setShowModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-40 border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-40 border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Total: ${filteredEmployees.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                      <TableCell className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            emp.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{emp.salary?.basic?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(emp)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              reset({
                                salary: emp.salary,
                              });
                              setShowSalaryModal(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Set Salary"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleActivateDeactivate(emp.employeeId, emp.isActive)
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                            title={emp.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {emp.isActive ? (
                              <Power className="w-4 h-4 text-green-600" />
                            ) : (
                              <PowerOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(emp.employeeId)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input {...register('firstName', { required: true })} />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input {...register('lastName', { required: true })} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" {...register('email', { required: true })} />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input {...register('phone', { required: true })} />
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <Input {...register('department', { required: true })} />
                  </div>
                  <div>
                    <Label>Position *</Label>
                    <Input {...register('position', { required: true })} />
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salary Modal */}
      {showSalaryModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Set Salary - {selectedEmployee.firstName} {selectedEmployee.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSetSalary();
              }} className="space-y-4">
                <div>
                  <Label>Basic Salary</Label>
                  <Input
                    type="number"
                    {...register('salary.basic')}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>HRA</Label>
                  <Input
                    type="number"
                    {...register('salary.hra')}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Allowances</Label>
                  <Input
                    type="number"
                    {...register('salary.allowances')}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    {...register('salary.deductions')}
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSalaryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Salary</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;

