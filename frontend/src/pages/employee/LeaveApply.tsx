import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { leavesApi } from '../../api/leaves';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

const leaveSchema = z.object({
  leaveType: z.enum(['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type LeaveForm = z.infer<typeof leaveSchema>;

const LeaveApply = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
  });

  const leaveType = watch('leaveType');

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await leavesApi.getMyBalance();
      setBalance(response);
    } catch (error) {
      toast.error('Failed to load leave balance');
    }
  };

  const onSubmit = async (data: LeaveForm) => {
    try {
      setLoading(true);
      await leavesApi.apply(data);
      toast.success('Leave applied successfully!');
      navigate('/employee/leaves');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBalance = () => {
    if (!balance || !leaveType) return 0;
    return balance[leaveType]?.remaining || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-500 mt-2">Submit a leave request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Leave Application
              </CardTitle>
              <CardDescription>Fill in the details to apply for leave</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select id="leaveType" {...register('leaveType')}>
                    <option value="">Select leave type</option>
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </Select>
                  {errors.leaveType && (
                    <p className="text-sm text-destructive">{errors.leaveType.message}</p>
                  )}
                  {leaveType && (
                    <p className="text-sm text-muted-foreground">
                      Available: {getAvailableBalance()} days
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-destructive">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    id="reason"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('reason')}
                    placeholder="Please provide a reason for your leave request..."
                  />
                  {errors.reason && (
                    <p className="text-sm text-destructive">{errors.reason.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/employee/leaves')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {balance ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Annual Leave</p>
                    <p className="text-2xl font-bold">{balance.annual?.remaining || 0} / {balance.annual?.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Casual Leave</p>
                    <p className="text-2xl font-bold">{balance.casual?.remaining || 0} / {balance.casual?.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sick Leave</p>
                    <p className="text-2xl font-bold">{balance.sick?.remaining || 0} / {balance.sick?.total || 0}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaveApply;

