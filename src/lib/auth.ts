// lib/auth.ts

import { NextApiRequest } from 'next';

export function getUserIdFromRequest(req: NextApiRequest): number | null {
  // First, try to get from request body (if provided)
  if (req.body && req.body.owner && typeof req.body.owner === 'number') {
    return req.body.owner;
  }

  // Try to get from headers (if frontend sends it)
  const userIdHeader = req.headers['x-user-id'];
  if (userIdHeader && typeof userIdHeader === 'string') {
    const userId = parseInt(userIdHeader);
    if (!isNaN(userId)) {
      return userId;
    }
  }

  // For now, return null if no user ID is found
  // In a real application, you would decode JWT token from Authorization header
  // or get from session cookies
  return null;
}

export function getUserIdFromLocalStorage(): number | null {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('id');
    if (userId) {
      const parsed = parseInt(userId);
      return !isNaN(parsed) ? parsed : null;
    }
  }
  return null;
}