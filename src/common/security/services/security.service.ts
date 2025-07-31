import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class SecurityService {
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const dangerousChars = /[;&|`$<>(){}[\]\\'"]/g;

    return input
      .replace(dangerousChars, '') // Remove dangerous characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 1000); // Limit length
  }

  containsOSCommands(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const osCommands = [
      'rm',
      'del',
      'delete',
      'mkdir',
      'rmdir',
      'mv',
      'cp',
      'cat',
      'ls',
      'dir',
      'chmod',
      'chown',
      'sudo',
      'su',
      'passwd',
      'kill',
      'killall',
      'ps',
      'wget',
      'curl',
      'nc',
      'netcat',
      'ssh',
      'scp',
      'ftp',
      'telnet',
      'ping',
      'nslookup',
      'dig',
      'whoami',
      'id',
      'uname',
      'which',
      'locate',
      'find',
      'grep',
      'awk',
      'sed',
      'sort',
      'head',
      'tail',
      'tar',
      'zip',
      'unzip',
      'gzip',
      'gunzip',
      'python',
      'node',
      'npm',
      'pip',
      'bash',
      'sh',
      'zsh',
      'csh',
      'tcsh',
      'fish',
      'powershell',
      'cmd',
      'net',
      'tasklist',
      'taskkill',
      'systemctl',
      'service',
      'crontab',
      'at',
    ];

    const lowerInput = input.toLowerCase();

    return osCommands.some((command) => {
      const patterns = [
        new RegExp(`^${command}\\s`),
        new RegExp(`\\s${command}\\s`),
        new RegExp(`[;&|]${command}\\s`),
        new RegExp(`^${command}$`),
        new RegExp(`\\s${command}$`),
      ];

      return patterns.some((pattern) => pattern.test(lowerInput));
    });
  }

  generateSecureHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  isValidPath(path: string): boolean {
    if (!path || typeof path !== 'string') {
      return false;
    }

    const dangerousPatterns = [
      '../',
      '..\\',
      '..\\/',
      '../\\',
      '%2e%2e%2f',
      '%2e%2e%5c',
      '%2e%2e/',
      '..%2f',
      '..%5c',
      '%252e%252e%252f',
    ];

    const lowerPath = path.toLowerCase();
    return !dangerousPatterns.some((pattern) => lowerPath.includes(pattern));
  }
}
