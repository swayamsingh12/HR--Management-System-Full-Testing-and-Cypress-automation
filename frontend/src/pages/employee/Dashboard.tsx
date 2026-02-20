import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Calendar, FileText, User, TrendingUp } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import { leavesApi } from '../../api/leaves';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendance: { present: 0, total: 0, percentage: 0 },
    leaves: { total: 0, used: 0, pending: 0 },
    todayStatus: 'absent' as string,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [attendanceRes, leavesRes, balanceRes] = await Promise.all([
        attendanceApi.getMyAttendance().catch(() => ({ attendance: [], todayStatus: { status: 'absent' } })),
        leavesApi.getMyLeaves().catch(() => []),
        leavesApi.getMyBalance().catch(() => ({ annual: { total: 0, used: 0 }, casual: { total: 0, used: 0 }, sick: { total: 0, used: 0 } })),
      ]);

      const attendance = attendanceRes.attendance || [];
      const presentDays = attendance.filter((a: any) => a.status === 'present' || a.status === 'late').length;
      const totalDays = attendance.length || 1;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      const pendingLeaves = (leavesRes || []).filter((l: any) => l.status === 'pending').length;

      setStats({
        attendance: {
          present: presentDays,
          total: totalDays,
          percentage: attendancePercentage,
        },
        leaves: {
          total: (balanceRes.annual?.total || 0) + (balanceRes.casual?.total || 0) + (balanceRes.sick?.total || 0),
          used: (balanceRes.annual?.used || 0) + (balanceRes.casual?.used || 0) + (balanceRes.sick?.used || 0),
          pending: pendingLeaves,
        },
        todayStatus: attendanceRes.todayStatus?.status || 'absent',
      });
    } catch (error: any) {
      console.error('Dashboard error:', error);
      // Don't show error if it's just empty data or auth issue
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Clock, label: 'Attendance', path: '/employee/attendance', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Apply Leave', path: '/employee/leaves/apply', color: 'bg-green-500' },
    { icon: FileText, label: 'Payslips', path: '/employee/payslips', color: 'bg-purple-500' },
    { icon: User, label: 'Profile', path: '/employee/profile', color: 'bg-orange-500' },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-2">Here's your dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.attendance.present} out of {stats.attendance.total} days
            </p>
            <div className="mt-2">
              <div className="text-sm font-medium">
                Today: <span className={stats.todayStatus === 'present' || stats.todayStatus === 'late' ? 'text-green-600' : 'text-red-600'}>
                  {stats.todayStatus === 'present' ? 'Present' : stats.todayStatus === 'late' ? 'Late' : 'Absent'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaves.total - stats.leaves.used}</div>
            <p className="text-xs text-muted-foreground">
              {stats.leaves.used} used out of {stats.leaves.total} total
            </p>
            {stats.leaves.pending > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                {stats.leaves.pending} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.path}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                    onClick={() => navigate(action.path)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="p-6 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.label}</h3>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;

