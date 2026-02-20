import { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Attendance = () => {
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getMyAttendance();
      setAttendance(response.attendance || []);
      setTodayStatus(response.todayStatus);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      setPunching(true);
      await attendanceApi.punchIn();
      toast.success('Punched in successfully!');
      loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to punch in');
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunching(true);
      await attendanceApi.punchOut();
      toast.success('Punched out successfully!');
      loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to punch out');
    } finally {
      setPunching(false);
    }
  };

  const canPunchIn = !todayStatus?.punchIn;
  const canPunchOut = todayStatus?.punchIn && !todayStatus?.punchOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-2">Manage your daily attendance</p>
      </div>

      {/* Punch In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold mt-1">
                {todayStatus?.status === 'present' || todayStatus?.status === 'late' ? (
                  <span className="text-green-600">Present</span>
                ) : (
                  <span className="text-red-600">Absent</span>
                )}
              </p>
              {todayStatus?.punchIn && (
                <p className="text-sm text-gray-500 mt-2">
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
              {canPunchIn && (
                <Button onClick={handlePunchIn} disabled={punching} size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Punch In
                </Button>
              )}
              {canPunchOut && (
                <Button onClick={handlePunchOut} disabled={punching} variant="destructive" size="lg">
                  <XCircle className="w-5 h-5 mr-2" />
                  Punch Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                  <TableHead>Hours</TableHead>
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

export default Attendance;

