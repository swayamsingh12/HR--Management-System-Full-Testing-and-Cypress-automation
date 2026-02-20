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
import { Calendar, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { adminAttendanceApi } from '../../api/admin';
import { employeesApi } from '../../api/employees';

interface AttendanceRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
  };
  date: string;
  punchIn?: { time: string };
  punchOut?: { time: string };
  status: 'present' | 'absent' | 'late';
}

interface FormData {
  employeeId: string;
  date: string;
}

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState('');
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    loadData();
  }, [startDate, endDate, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attData, empData] = await Promise.all([
        adminAttendanceApi.getByDateRange(startDate, endDate),
        employeesApi.getAll(),
      ]);

      let filtered = attData;
      if (statusFilter) {
        filtered = filtered.filter((a: any) => a.status === statusFilter);
      }

      setAttendance(filtered);
      setEmployees(empData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const onPunch = async (data: FormData) => {
    try {
      if (punchType === 'in') {
        await adminAttendanceApi.punchIn(data.employeeId, new Date(data.date));
        toast.success('Punched in successfully');
      } else {
        await adminAttendanceApi.punchOut(data.employeeId, new Date(data.date));
        toast.success('Punched out successfully');
      }
      setShowPunchModal(false);
      reset();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to punch');
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500 mt-2">Track and manage employee attendance</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <Button
              onClick={() => {
                setPunchType('in');
                setShowPunchModal(true);
              }}
              className="gap-2"
              variant="outline"
            >
              <LogIn className="w-4 h-4" /> Punch In
            </Button>
            <Button
              onClick={() => {
                setPunchType('out');
                setShowPunchModal(true);
              }}
              className="gap-2"
              variant="outline"
            >
              <LogOut className="w-4 h-4" /> Punch Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records ({attendance.length})</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Total: ${attendance.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading attendance...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Punch Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-mono">
                        {record.employee.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </TableCell>
                      <TableCell>{record.employee.department}</TableCell>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatTime(record.punchIn?.time)}</TableCell>
                      <TableCell>{formatTime(record.punchOut?.time)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Punch Modal */}
      {showPunchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {punchType === 'in' ? 'Punch In Employee' : 'Punch Out Employee'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onPunch)} className="space-y-4">
                <div>
                  <Label>Employee *</Label>
                  <Input
                    as="select"
                    {...register('employeeId', { required: true })}
                    placeholder="Select employee"
                  />
                  <select
                    {...register('employeeId', { required: true })}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
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
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    {...register('date', { required: true })}
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPunchModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {punchType === 'in' ? 'Punch In' : 'Punch Out'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;

