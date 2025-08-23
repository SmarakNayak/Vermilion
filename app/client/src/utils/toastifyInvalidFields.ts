import { type FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

export const toastifyInvalidFields = (errors: FieldErrors) => {
  Object.entries(errors).forEach(([fieldName, error]) => {
    if (error?.message) {
      toast.error(`${fieldName}: ${error.message}`);
    }
  });
};