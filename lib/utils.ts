import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// converty prisma object intp a regular js Object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatErrors(error: any) {
  if (error.name === 'ZodError') {
    // handle zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message,
    );
    return fieldErrors.join('. ');
  } else if (
    // handle prisma error
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    const field = error.meta?.target ? error.meta.target[0] : 'field';
    return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`;
  } else {
    // handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

// round number to 2 decimal places
export function roundNumber(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('Invalid input');
  }
}
