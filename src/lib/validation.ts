import { z } from 'zod';
import { FormField } from '@/types';

export function buildZodSchema(fields: FormField[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    let zodType: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        zodType = z.string().email({ message: 'Invalid email address' });
        break;
      case 'url':
        zodType = z.string().url({ message: 'Invalid URL (include http:// or https://)' });
        break;
      case 'number':
        zodType = z.coerce.number({ 
          message: 'Must be a number'
        });
        
        if (field.validation?.min !== undefined) {
          zodType = (zodType as z.ZodNumber).min(field.validation.min, { 
            message: `Minimum value is ${field.validation.min}` 
          });
        }
        if (field.validation?.max !== undefined) {
          zodType = (zodType as z.ZodNumber).max(field.validation.max, { 
            message: `Maximum value is ${field.validation.max}` 
          });
        }
        break;
      case 'checkbox':
        // Checkbox options usually return as string array
        zodType = z.array(z.string());
        break;
      case 'date':
        zodType = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        });
        break;
      default:
        zodType = z.string();
        if (field.type === 'tel') {
          // Relaxed phone number pattern matching
          zodType = z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, { 
            message: 'Invalid phone number format' 
          });
        }
        break;
    }

    // Apply required validation rules
    if (field.required) {
      if (field.type === 'checkbox') {
        zodType = (zodType as z.ZodArray<any>).min(1, { 
          message: 'Select at least one option' 
        });
      } else if (field.type === 'number') {
        // Coerced number works, let's keep it required
      } else {
        zodType = (zodType as z.ZodString).min(1, { 
          message: `${field.label} is required` 
        });
      }
    } else {
      // Optional rules
      if (field.type === 'checkbox') {
        zodType = zodType.optional().default([]);
      } else if (field.type === 'number') {
        // Allow empty string or undefined or null for optional numbers
        zodType = z.union([z.string().length(0), z.number(), z.null(), z.undefined()])
          .transform((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)))
          .optional();
      } else {
        zodType = zodType.optional().or(z.literal(''));
      }
    }

    schemaFields[field.id] = zodType;
  });

  return z.object(schemaFields);
}
