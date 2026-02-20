import { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendance';
import { employeesApi } from '../../api/employees';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const HRAttendance = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadAttendance();
    }
  }, [selectedEmployee, startDate, endDate]);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getAll();
      setEmployees(response.filter((e: any) => e.isActive));
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const loadAttendance = async () => {
    if (!selectedEmployee) return;
    try {
      setLoading(true);
      const response = await attendanceApi.getEmployeeAttendance(
        selectedEmployee,
        startDate || undefined,
        endDate || undefined
      );
      setAttendance(response);
      
      // Get today's status
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecord = response.find((r: any) => {
        const recordDate = new Date(r.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
      setTodayStatus(todayRecord || null);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    try {
      setPunching(true);
      await attendanceApi.punchInForEmployee(selectedEmployee);
      toast.success('Punched in successfully for employee!');
      loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to punch in');
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    try {
      setPunching(true);
      await attendanceApi.punchOutForEmployee(selectedEmployee);
      toast.success('Punched out successfully for employee!');
      loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to punch out');
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500 mt-2">View and manage employee attendance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Filter Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {selectedEmployee && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Status</p>
                  <p className="text-lg font-semibold mt-1">
                    {todayStatus?.punchIn ? (
                      <span className="text-green-600">Present</span>
                    ) : (
                      <span className="text-red-600">Absent</span>
                    )}
                  </p>
                  {todayStatus?.punchIn && (
                    <p className="text-sm text-gray-500 mt-1">
                      Punch In: {format(new Date(todayStatus.punchIn.time), 'hh:mm a')}
                    </p>
                  )}
                  {todayStatus?.punchOut && (
                    <p className="text-sm text-gray-500">
                      Punch Out: {format(new Date(todayStatus.punchOut.time), 'hh:mm a')}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {(!todayStatus || !todayStatus.punchIn) && (
                    <Button onClick={handlePunchIn} disabled={punching} size="lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Punch In
                    </Button>
                  )}
                  {todayStatus?.punchIn && !todayStatus?.punchOut && (
                    <Button onClick={handlePunchOut} disabled={punching} variant="destructive" size="lg">
                      <XCircle className="w-5 h-5 mr-2" />
                      Punch Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEmployee ? (
            <div className="text-center py-8 text-gray-500">Please select an employee to view attendance</div>
          ) : loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No attendance records found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Punch In</TableHead>
                  <TableHead>Punch Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Working Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {record.punchIn ? format(new Date(record.punchIn.time), 'hh:mm a') : '-'}
                    </TableCell>
                    <TableCell>
                      {record.punchOut ? format(new Date(record.punchOut.time), 'hh:mm a') : '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' || record.status === 'late'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{record.workingHours || '-'} hrs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HRAttendance;

