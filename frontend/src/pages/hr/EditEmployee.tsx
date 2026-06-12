import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { employeesApi } from '../../api/employees';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import toast from 'react-hot-toast';
import { Edit } from 'lucide-react';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  basicSalary: z
    .string()
    .min(1, 'Basic salary is required')
    .refine((v) => Number(v) > 0, 'Basic salary must be a positive number'),
  hra: z.string().optional(),
  allowances: z.string().optional(),
  deductions: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const response = await employeesApi.getById(id!);
      setEmployee(response);
      reset({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth).toISOString().split('T')[0] : '',
        dateOfJoining: response.dateOfJoining ? new Date(response.dateOfJoining).toISOString().split('T')[0] : '',
        department: response.department,
        position: response.position,
        basicSalary: response.salary?.basic?.toString() || '0',
        hra: response.salary?.hra?.toString() || '0',
        allowances: response.salary?.allowances?.toString() || '0',
        deductions: response.salary?.deductions?.toString() || '0',
      });
    } catch (error) {
      toast.error('Failed to load employee');
    }
  };

  const onSubmit = async (data: EmployeeForm) => {
    try {
      setLoading(true);
      const employeeData = {
        ...data,
        salary: {
          basic: parseFloat(data.basicSalary),
          hra: parseFloat(data.hra || '0'),
          allowances: parseFloat(data.allowances || '0'),
          deductions: parseFloat(data.deductions || '0'),
        },
      };
      await employeesApi.update(id!, employeeData);
      toast.success('Employee updated successfully!');
      navigate('/hr/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
        <p className="text-gray-500 mt-2">Update employee information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input id="dateOfJoining" type="date" {...register('dateOfJoining')} />
                {errors.dateOfJoining && (
                  <p className="text-sm text-destructive">{errors.dateOfJoining.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select id="department" {...register('department')}>
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" {...register('position')} />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Salary Structure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Basic Salary</Label>
                  <Input id="basicSalary" type="number" {...register('basicSalary')} />
                  {errors.basicSalary && (
                    <p className="text-sm text-destructive">{errors.basicSalary.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hra">HRA</Label>
                  <Input id="hra" type="number" {...register('hra')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowances">Allowances</Label>
                  <Input id="allowances" type="number" {...register('allowances')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input id="deductions" type="number" {...register('deductions')} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Employee'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/hr/employees')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEmployee;

