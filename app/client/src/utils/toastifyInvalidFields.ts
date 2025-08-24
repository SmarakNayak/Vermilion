import { type FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Shows a toast notification for each invalid field in a form.
 * Primarily used for testing; in prod, errors are shown inline and
 * the submit button is disabled when the form is invalid.
 * As a result, this function is not called in prod.
 *
 * @param errors - The FieldErrors object from react-hook-form.
 */
export const toastifyInvalidFields = (errors: FieldErrors) => {
  Object.entries(errors).forEach(([fieldName, error]) => {
    if (error?.message) {
      toast.error(`${fieldName}: ${error.message}`);
    }
  });
};