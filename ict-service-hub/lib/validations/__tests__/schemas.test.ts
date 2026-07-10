import { describe, it, expect } from '@jest/globals';
import {
  createTicketSchema,
  createGuestTicketSchema,
  updateTicketSchema,
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  forgotPasswordSchema
} from '../schemas';

describe('Validation Schemas', () => {
  describe('createTicketSchema', () => {
    it('validates a standard ticket submission successfully', () => {
      const validData = {
        title: 'Network issue in main office',
        description: 'The Wi-Fi router is constantly dropping connection.',
        category: 'network_infrastructure',
        priority: 'high',
        external_archive_link: 'https://drive.google.com/file/d/123/view',
      };
      const result = createTicketSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('sanitizes HTML tags from strings', () => {
      const dataWithHtml = {
        title: 'Issue <b>urgent</b>',
        description: '<script>alert("hack")</script>Please fix the projector.',
        category: 'systems_software',
        priority: 'medium',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(dataWithHtml);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Issue urgent');
        expect(result.data.description).toBe('alert("hack")Please fix the projector.');
      }
    });

    it('fails when title is too short', () => {
      const data = {
        title: 'Bad',
        description: 'This is a description that is long enough.',
        category: 'network_infrastructure',
        priority: 'low',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be at least 5 characters.');
      }
    });

    it('fails when title is too long', () => {
      const data = {
        title: 'A'.repeat(151),
        description: 'This is a description that is long enough.',
        category: 'network_infrastructure',
        priority: 'low',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must not exceed 150 characters.');
      }
    });

    it('trims whitespace before validation', () => {
      const dataWithWhitespace = {
        title: '   Trim Me   ',
        description: '   This description has spaces   ',
        category: 'systems_software',
        priority: 'medium',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Trim Me');
        expect(result.data.description).toBe('This description has spaces');
      }
    });

    it('fails when event_date is in the past', () => {
      const data = {
        title: 'Past Event Support',
        description: 'Need help with the projector for the event.',
        category: 'systems_software',
        priority: 'medium',
        event_date: '2020-01-01',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Event date cannot be in the past.');
      }
    });

    it('fails when event_date is invalid format', () => {
      const data = {
        title: 'Invalid Date Support',
        description: 'Need help with the projector for the event.',
        category: 'systems_software',
        priority: 'medium',
        event_date: 'not-a-date',
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid date.');
      }
    });

    it('accepts future event_date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const data = {
        title: 'Future Event Support',
        description: 'Need help with the projector for the event.',
        category: 'systems_software',
        priority: 'medium',
        event_date: futureDate.toISOString(),
        external_archive_link: '',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails on invalid external_archive_link', () => {
      const data = {
        title: 'Valid title here',
        description: 'Valid description here with enough length.',
        category: 'systems_software',
        priority: 'medium',
        external_archive_link: 'https://malicious.com/file',
      };
      const result = createTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Only Google Drive, OneDrive, Dropbox, or SharePoint links are allowed.');
      }
    });
  });

  describe('createGuestTicketSchema', () => {
    it('validates a standard guest ticket successfully', () => {
      const validData = {
        title: 'Guest Network issue',
        description: 'Guest Wi-Fi is not working properly.',
        category: 'network_infrastructure',
        priority: 'medium',
        guest_name: 'Jane Smith',
        guest_email: 'jane@example.com',
        guest_phone: '1234567890',
        external_archive_link: '',
      };
      const result = createGuestTicketSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails when guest email is invalid', () => {
      const invalidData = {
        title: 'Guest Network issue',
        description: 'Guest Wi-Fi is not working properly.',
        category: 'network_infrastructure',
        priority: 'medium',
        guest_name: 'Jane Smith',
        guest_email: 'not-an-email',
        external_archive_link: '',
      };
      const result = createGuestTicketSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTicketSchema', () => {
    it('validates a status update', () => {
      const data = { status: 'resolved' };
      const result = updateTicketSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails on invalid status enum', () => {
      const data = { status: 'unknown_status' };
      const result = updateTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates correct login credentials', () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('lowercases the email automatically', () => {
      const validData = {
        email: 'USER@EXAMPLE.COM',
        password: 'ValidPassword123!',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('signupSchema', () => {
    it('validates a standard signup successfully', () => {
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirm_password: 'Password123',
      };
      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirm_password: 'Password124',
      };
      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match.');
      }
    });

    it('fails when password does not contain a number', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordNoNum',
        confirm_password: 'PasswordNoNum',
      };
      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one number.');
      }
    });

    it('fails when password does not contain an uppercase letter', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirm_password: 'password123',
      };
      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one uppercase letter.');
      }
    });

    it('accepts passwords longer than 72 characters', () => {
      const longPassword = 'A1' + 'a'.repeat(80);
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: longPassword,
        confirm_password: longPassword,
      };
      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates a correct reset password object', () => {
      const validData = {
        password: 'NewPassword123',
        confirm_password: 'NewPassword123',
      };
      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const invalidData = {
        password: 'NewPassword123',
        confirm_password: 'NewPassword124',
      };
      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match.');
      }
    });

    it('fails when password does not contain a number', () => {
      const invalidData = {
        password: 'NewPasswordNoNum',
        confirm_password: 'NewPasswordNoNum',
      };
      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one number.');
      }
    });

    it('fails when password does not contain an uppercase letter', () => {
      const invalidData = {
        password: 'newpassword123',
        confirm_password: 'newpassword123',
      };
      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one uppercase letter.');
      }
    });

    it('fails when password is too short', () => {
      const invalidData = {
        password: 'A1a',
        confirm_password: 'A1a',
      };
      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters.');
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates a correct email', () => {
      const validData = {
        email: 'test@example.com',
      };
      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('lowercases the email automatically', () => {
      const validData = {
        email: 'TEST@EXAMPLE.COM',
      };
      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('fails on invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
      };
      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address.');
      }
    });
  });
});
