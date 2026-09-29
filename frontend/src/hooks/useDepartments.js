import { departmentService } from '../services/api';
import { useFetch } from './useFetch';

/** Departments from the API (admins can add/rename/delete them). */
export function useDepartments() {
  const { data, loading, error, refetch } = useFetch(() => departmentService.getAll(), []);
  const departments = data || [];
  return { departments, names: departments.map((d) => d.name), loading, error, refetch };
}
