import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeesApi } from '../../api/employees';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Edit, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeesApi.getById(id!);
      setEmployee(response);
    } catch (error) {
      toast.error('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/hr/employees')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-500 mt-2">View employee details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/hr/employees/${id}/edit`)}>
          <Edit className="w-5 h-5 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-semibold">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-semibold">
                    {employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Joining</p>
                  <p className="font-semibold">
                    {employee.dateOfJoining ? format(new Date(employee.dateOfJoining), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-semibold">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-semibold">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Salary Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Basic Salary</p>
                <p className="text-2xl font-bold">₹{employee.salary?.basic?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">HRA</p>
                <p className="text-xl font-semibold">₹{employee.salary?.hra?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allowances</p>
                <p className="text-xl font-semibold">₹{employee.salary?.allowances?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deductions</p>
                <p className="text-xl font-semibold">₹{employee.salary?.deductions?.toLocaleString() || 0}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Gross Salary</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{((employee.salary?.basic || 0) + (employee.salary?.hra || 0) + (employee.salary?.allowances || 0)).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

