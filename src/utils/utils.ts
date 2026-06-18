import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HTTP_METHODS, HTTP_STATUS_NAMES } from "../constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getHttpMethodColor = (method: string) => {
  return HTTP_METHODS[method] || "bg-gray-500";
};

export const getHttpStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return "text-green-600";
  if (status >= 300 && status < 400) return "text-blue-600";
  if (status >= 400 && status < 500) return "text-orange-600";
  if (status >= 500) return "text-red-600";
  return "text-gray-600";
};

export const getHttpStatusName = (status: number, statusText?: string) => {
  return HTTP_STATUS_NAMES[status] || statusText || "Unknown";
};

/**
 * Format a JSON string or object with proper indentation
 * @param json The JSON string or object to format
 * @param indent The number of spaces to use for indentation (default: 2)
 * @returns A formatted JSON string
 */
export const formatJson = (json: string | object, indent: number = 2): string => {
  try {
    // If input is a string, parse it to an object first
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    // Convert back to string with proper indentation
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    // Return the original input if it's not valid JSON
    console.error('Invalid JSON:', error);
    return typeof json === 'string' ? json : JSON.stringify(json);
  }
};
