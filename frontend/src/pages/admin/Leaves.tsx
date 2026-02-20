import { useEffect, useState } from 'react';
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
import { Check, X, Eye } from 'lucide-react';
import { adminLeavesApi } from '../../api/admin';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await adminLeavesApi.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setLeaves(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      await adminLeavesApi.approve(leaveId, remarks);
      toast.success('Leave approved successfully');
      setShowDetailsModal(false);
      setRemarks('');
      loadLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      await adminLeavesApi.reject(leaveId, remarks);
      toast.success('Leave rejected successfully');
      setShowDetailsModal(false);
      setRemarks('');
      loadLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-500 mt-2">Approve or reject employee leave requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 border border-gray-300 rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({leaves.length})</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Total: ${leaves.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading leaves...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No leave requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-mono">
                        {leave.employee.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </TableCell>
                      <TableCell>{leave.employee.department}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {leave.leaveType}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(leave.startDate)}</TableCell>
                      <TableCell>{formatDate(leave.endDate)}</TableCell>
                      <TableCell className="font-semibold">{leave.days}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowDetailsModal(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(leave._id)}
                                className="p-1 hover:bg-green-100 rounded text-green-600"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(leave._id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      {/* Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Leave Request - {selectedLeave.employee.firstName}{' '}
                {selectedLeave.employee.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Leave Type</Label>
                <p className="font-semibold">{selectedLeave.leaveType}</p>
              </div>
              <div>
                <Label className="text-gray-600">Duration</Label>
                <p className="font-semibold">
                  {formatDate(selectedLeave.startDate)} to{' '}
                  {formatDate(selectedLeave.endDate)} ({selectedLeave.days} days)
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Reason</Label>
                <p className="font-semibold">{selectedLeave.reason}</p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <p
                  className={`font-semibold px-2 py-1 rounded inline-block ${getStatusColor(
                    selectedLeave.status
                  )}`}
                >
                  {selectedLeave.status.charAt(0).toUpperCase() +
                    selectedLeave.status.slice(1)}
                </p>
              </div>

              {selectedLeave.status === 'pending' && (
                <div>
                  <Label>Remarks (optional)</Label>
                  <Input
                    placeholder="Add remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setRemarks('');
                  }}
                >
                  Close
                </Button>
                {selectedLeave.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedLeave._id)}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedLeave._id)}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminLeaves;

