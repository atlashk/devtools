import { toast } from "sonner";
import { AxiosError } from "axios";

type ErrorWithMessage = {
  message: string;
  detail?: string;
};

/**
 * Extracts detail message from an Axios error response
 * @param error - The Axios error
 * @returns The detail message if found, undefined otherwise
 */
function getDetailFromAxiosError(error: AxiosError): string | undefined {
  const responseData = error.response?.data;
  
  // No response data
  if (!responseData || typeof responseData !== 'object' || responseData === null) {
    return undefined;
  }
  
  // Check for direct detail property
  if ('detail' in responseData && typeof responseData.detail === 'string') {
    return responseData.detail;
  }
  
  // Check for nested detail property
  if ('data' in responseData && 
      typeof responseData.data === 'object' && 
      responseData.data !== null && 
      'detail' in responseData.data && 
      typeof responseData.data.detail === 'string') {
    return responseData.data.detail;
  }
  
  // No detail found
  return undefined;
}

/**
 * Converts an unknown error to an error with a message and optional detail
 * @param error - The error to convert
 * @returns An error with a message and optional detail
 */
function toErrorWithMessage(error: unknown): ErrorWithMessage {
  // Already has the right format
  if (typeof error === "object" && 
      error !== null && 
      "message" in error && 
      typeof (error as Record<string, unknown>).message === "string") {
    return error as ErrorWithMessage;
  }

  try {
    // Handle Axios errors
    if (error instanceof AxiosError) {
      const detail = getDetailFromAxiosError(error);
      
      if (detail) {
        return { message: error.message, detail };
      }
      
      // If no detail in response data, use the status text if available
      if (error.response?.statusText) {
        return { 
          message: error.message, 
          detail: `${error.response.status} ${error.response.statusText}` 
        };
      }
      
      // Fallback to the error message
      return { message: error.message, detail: error.message };
    }
    
    // Check if error has a detail property
    if (typeof error === "object" && 
        error !== null && 
        "detail" in error && 
        typeof (error as Record<string, unknown>).detail === "string") {
      const detailMessage = (error as Record<string, string>).detail;
      return { message: detailMessage, detail: detailMessage };
    }
    
    // Convert string or other types to Error
    return { message: typeof error === "string" ? error : JSON.stringify(error) };
  } catch {
    // fallback in case there's an error stringifying the error
    return { message: "Unknown error" };
  }
}

/**
 * Gets the error message from an unknown error
 * @param error - The error to get the message from
 * @returns The error message
 */
export function getErrorMessage(error: unknown): string {
  const errorObj = toErrorWithMessage(error);
  return errorObj.detail || errorObj.message;
}

/**
 * Custom hook for handling errors in a consistent way
 * @returns An object with error handling functions
 */
export function useErrorHandler() {
  /**
   * Handles an error by logging it and showing a toast notification
   * @param error - The error to handle
   * @param context - The context in which the error occurred
   * @returns The error message that was displayed
   */
  const handleError = (error: unknown, context = "Operation") => {
    console.error(`${context} failed:`, error);
    
    // Special handling for Axios errors
    if (error instanceof AxiosError) {
      const detail = getDetailFromAxiosError(error);
      if (detail) {
        toast.error(detail);
        return detail;
      }
    }
    
    // Standard error handling for all error types
    const errorObj = toErrorWithMessage(error);
    const errorMessage = errorObj.message;
    const detailMessage = errorObj.detail || errorMessage;
    
    // If there's a detail message different from the error message, show only that
    if (errorObj.detail && errorObj.detail !== errorMessage) {
      toast.error(errorObj.detail);
      return errorObj.detail;
    }
    
    // Otherwise show the context and detail message
    toast.error(`${context} failed: ${detailMessage}`);
    return detailMessage;
  };


  return { handleError, getErrorMessage };
}