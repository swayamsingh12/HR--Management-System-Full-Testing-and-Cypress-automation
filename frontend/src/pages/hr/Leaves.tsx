import { useEffect, useState } from 'react';
import { leavesApi } from '../../api/leaves';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const HRLeaves = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await leavesApi.getPending();
      setLeaves(response);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leavesApi.updateStatus(id, 'approved');
      toast.success('Leave approved');
      loadPendingLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await leavesApi.updateStatus(id, 'rejected', reason);
        toast.success('Leave rejected');
        loadPendingLeaves();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to reject leave');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-500 mt-2">Approve or reject leave requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Pending Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending leave requests</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                      <br />
                      <span className="text-xs text-gray-500">{leave.employee?.employeeId}</span>
                    </TableCell>
                    <TableCell className="capitalize">{leave.leaveType}</TableCell>
                    <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(leave._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(leave._id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
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

export default HRLeaves;

