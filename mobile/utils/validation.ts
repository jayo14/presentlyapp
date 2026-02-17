export const validation = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password: string): { valid: boolean; error?: string } => {
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain a number' };
    }
    return { valid: true };
  },

  matricNumber: (matricNumber: string): boolean => {
    return matricNumber.length >= 6 && /^[A-Z0-9/]+$/i.test(matricNumber);
  },

  fullName: (name: string): boolean => {
    return name.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(name);
  },

  otp: (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  },
};
