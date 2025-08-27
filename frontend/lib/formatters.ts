/**
 * Utility formatters for TexPro AI
 * Common formatting functions for consistent display
 */

import { MALI_CONFIG, DATE_FORMATS } from './constants';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format currency for Mali (XOF)
 */
export function formatCurrency(amount: number): string {
  return MALI_CONFIG.currency_format(amount);
}

/**
 * Format phone number for Mali
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Mali format: +223 XX XX XX XX
  if (digits.startsWith('223') && digits.length === 11) {
    return `+223 ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Format employee ID
 */
export function formatEmployeeId(id: string): string {
  if (!id) return '';
  return id.toUpperCase();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | null, includeTime = false): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const formatStr = includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return '';
  }
}

/**
 * Format relative time (e.g., "il y a 2 heures")
 */
export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;
    
    return formatDate(dateObj);
  } catch {
    return '';
  }
}

/**
 * Format duration (minutes to human readable)
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['octets', 'Ko', 'Mo', 'Go'];
  if (bytes === 0) return '0 octets';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)} ${sizes[i]}`;
}

/**
 * Format status with proper capitalization
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',
    in_progress: 'En cours',
    cancelled: 'Annulé',
    error: 'Erreur',
    maintenance: 'Maintenance',
    operational: 'Opérationnel',
    offline: 'Hors ligne'
  };
  
  return statusMap[status] || status;
}

/**
 * Format priority level
 */
export function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    critical: 'Critique'
  };
  
  return priorityMap[priority] || priority;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format machine code/serial number
 */
export function formatMachineCode(code: string): string {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Format batch number
 */
export function formatBatchNumber(batchNumber: string): string {
  if (!batchNumber) return '';
  return batchNumber.toUpperCase();
}

/**
 * Parse and format API date
 */
export function parseApiDate(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Format number with Mali locale
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('fr-ML', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Validate and format Mali phone number
 */
export function isValidMaliPhone(phone: string): boolean {
  return MALI_CONFIG.phone_regex.test(phone);
}

/**
 * Validate employee ID format
 */
export function isValidEmployeeId(id: string): boolean {
  return MALI_CONFIG.employee_id_regex.test(id);
}

/**
 * Format time for Mali timezone
 */
export function formatTimeForMali(date: Date): string {
  return new Intl.DateTimeFormat('fr-ML', {
    timeZone: 'Africa/Bamako',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
