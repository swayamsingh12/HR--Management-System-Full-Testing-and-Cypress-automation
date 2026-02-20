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
import { Download, Plus, Eye } from 'lucide-react';
import { adminPayrollApi } from '../../api/admin';
import { employeesApi } from '../../api/employees';

interface Payroll {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
  };
  month: number;
  year: number;
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    gross: number;
  };
  deductions: {
    tax: number;
    providentFund: number;
    total: number;
  };
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
}

interface FormData {
  employeeId: string;
  month: string;
  year: string;
}

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      month: monthFilter,
      year: yearFilter,
    },
  });

  useEffect(() => {
    loadData();
  }, [monthFilter, yearFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payData, empData] = await Promise.all([
        adminPayrollApi.getAll({
          month: monthFilter,
          year: yearFilter,
        }),
        employeesApi.getAll(),
      ]);

      setPayrolls(payData);
      setEmployees(empData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = async (data: FormData) => {
    try {
      await adminPayrollApi.generate({
        employeeId: data.employeeId,
        month: parseInt(data.month),
        year: parseInt(data.year),
      });
      toast.success('Payroll generated successfully');
      setShowGenerateModal(false);
      reset();
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Failed to generate payroll. Payroll may already exist for this period.'
      );
    }
  };

  const handleDownload = async (payrollId: string) => {
    try {
      const blob = await adminPayrollApi.downloadPayslip(payrollId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payrollId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download payslip');
    }
  };

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 mt-2">
            Generate and manage employee payroll
          </p>
        </div>
        <Button
          onClick={() => setShowGenerateModal(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Generate Payroll
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <Label>Month</Label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Month</option>
                {months.map((month, idx) => (
                  <option key={month} value={(idx + 1).toString()}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Year</option>
                {[
                  new Date().getFullYear() - 2,
                  new Date().getFullYear() - 1,
                  new Date().getFullYear(),
                  new Date().getFullYear() + 1,
                ].map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payroll - {months[parseInt(monthFilter) - 1]} {yearFilter} (
            {payrolls.length})
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Total: ${payrolls.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading payroll...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No payroll records found for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Present Days</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll._id}>
                      <TableCell className="font-mono">
                        {payroll.employee.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payroll.employee.firstName}{' '}
                        {payroll.employee.lastName}
                      </TableCell>
                      <TableCell>{payroll.employee.department}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{payroll.salary?.gross?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        ₹{payroll.deductions?.total?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{payroll.netSalary?.toLocaleString?.() || '0'}
                      </TableCell>
                      <TableCell>
                        {payroll.presentDays}/{payroll.workingDays}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              setShowDetailsModal(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(payroll._id)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Download Payslip"
                          >
                            <Download className="w-4 h-4" />
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

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Generate Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <select
                    {...register('employeeId', { required: true })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Month *</Label>
                  <select
                    {...register('month', { required: true })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select month</option>
                    {months.map((month, idx) => (
                      <option key={month} value={(idx + 1).toString()}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Year *</Label>
                  <select
                    {...register('year', { required: true })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select year</option>
                    {[
                      new Date().getFullYear() - 2,
                      new Date().getFullYear() - 1,
                      new Date().getFullYear(),
                      new Date().getFullYear() + 1,
                    ].map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGenerateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Generate</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Payroll Details - {selectedPayroll.employee.firstName}{' '}
                {selectedPayroll.employee.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Salary Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>₹{selectedPayroll.salary.basic.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA</span>
                    <span>₹{selectedPayroll.salary.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowances</span>
                    <span>₹{selectedPayroll.salary.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>Gross Salary</span>
                    <span>₹{selectedPayroll.salary.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Deductions</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{selectedPayroll.deductions.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provident Fund</span>
                    <span>
                      ₹{selectedPayroll.deductions.providentFund.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>Total Deductions</span>
                    <span>₹{selectedPayroll.deductions.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Salary</span>
                  <span className="text-green-600">
                    ₹{selectedPayroll.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Attendance</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Working Days</span>
                    <span>{selectedPayroll.workingDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present Days</span>
                    <span>{selectedPayroll.presentDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leave Days</span>
                    <span>{selectedPayroll.leaveDays}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPayroll(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(selectedPayroll._id)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" /> Download Payslip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;

