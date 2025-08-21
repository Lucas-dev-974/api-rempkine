export interface ValidationRule {
    type: 'string' | 'email' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    data?: any;
}

export abstract class Controller {
    constructor() { }

    public validators(data: any, schema: ValidationSchema): ValidationResult {
        const errors: string[] = [];
        const sanitizedData: any = {};

        // Vérifier chaque champ du schéma
        for (const [fieldName, rule] of Object.entries(schema)) {
            const value = data[fieldName];

            // Vérifier si le champ est requis
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`Le champ '${fieldName}' est requis`);
                continue;
            }

            // Si le champ n'est pas requis et n'est pas présent, passer au suivant
            if (!rule.required && (value === undefined || value === null)) {
                continue;
            }

            // Valider le type
            if (!this.validateType(value, rule.type)) {
                errors.push(`Le champ '${fieldName}' doit être de type '${rule.type}'`);
                continue;
            }

            // Valider la longueur pour les chaînes
            if (rule.type === 'string' && typeof value === 'string') {
                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`Le champ '${fieldName}' doit avoir au moins ${rule.minLength} caractères`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`Le champ '${fieldName}' ne peut pas dépasser ${rule.maxLength} caractères`);
                }
            }

            // Valider le format email
            if (rule.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`Le champ '${fieldName}' doit être un email valide`);
            }

            // Valider le pattern regex
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`Le champ '${fieldName}' ne respecte pas le format attendu`);
            }

            // Validation personnalisée
            if (rule.custom && !rule.custom(value)) {
                errors.push(`Le champ '${fieldName}' ne respecte pas la validation personnalisée`);
            }

            // Si toutes les validations passent, sanitizer et stocker la valeur
            if (errors.length === 0 || !errors.some(error => error.includes(fieldName))) {
                sanitizedData[fieldName] = this.sanitizeValue(value, rule.type);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: sanitizedData
        };
    }

    private validateType(value: any, expectedType: string): boolean {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string' || typeof value === "number";
            case 'email':
                return typeof value === 'string' && this.isValidEmail(value);
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return value instanceof Date || !isNaN(Date.parse(value));
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return true;
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private sanitizeValue(value: any, type: string): any {
        switch (type) {
            case 'string':
                return this.sanitizeString(value);
            case 'email':
                return this.sanitizeEmail(value);
            case 'number':
                return this.sanitizeNumber(value);
            case 'boolean':
                return this.sanitizeBoolean(value);
            case 'date':
                return this.sanitizeDate(value);
            case 'array':
                return this.sanitizeArray(value);
            case 'object':
                return this.sanitizeObject(value);
            default:
                return value;
        }
    }

    private sanitizeString(value: string): string {
        if (typeof value !== 'string') return value;

        // Supprimer les caractères dangereux pour SQL
        return value
            .replace(/['";\\]/g, '') // Supprimer les guillemets et points-virgules
            .replace(/--/g, '') // Supprimer les commentaires SQL
            .replace(/\/\*/g, '') // Supprimer les commentaires SQL
            .replace(/\*\//g, '') // Supprimer les commentaires SQL
            .replace(/union\s+select/gi, '') // Supprimer UNION SELECT
            .replace(/drop\s+table/gi, '') // Supprimer DROP TABLE
            .replace(/delete\s+from/gi, '') // Supprimer DELETE FROM
            .replace(/insert\s+into/gi, '') // Supprimer INSERT INTO
            .replace(/update\s+set/gi, '') // Supprimer UPDATE SET
            .replace(/create\s+table/gi, '') // Supprimer CREATE TABLE
            .replace(/alter\s+table/gi, '') // Supprimer ALTER TABLE
            .trim(); // Supprimer les espaces en début et fin
    }

    private sanitizeEmail(value: string): string {
        if (typeof value !== 'string') return value;

        // Nettoyer l'email et vérifier qu'il est valide
        const sanitized = this.sanitizeString(value).toLowerCase();
        return this.isValidEmail(sanitized) ? sanitized : value;
    }

    private sanitizeNumber(value: any): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    private sanitizeBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'yes';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        return false;
    }

    private sanitizeDate(value: any): Date | string {
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        return value;
    }

    private sanitizeArray(value: any): any[] {
        if (!Array.isArray(value)) return [];
        return value.map(item => {
            if (typeof item === 'string') {
                return this.sanitizeString(item);
            }
            return item;
        });
    }

    private sanitizeObject(value: any): any {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return value;
        }

        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
            if (typeof val === 'string') {
                sanitized[key] = this.sanitizeString(val);
            } else {
                sanitized[key] = val;
            }
        }
        return sanitized;
    }

    // Méthode utilitaire pour créer un schéma de validation rapidement
    public createSchema(schemaDefinition: { [key: string]: Partial<ValidationRule> }): ValidationSchema {
        const schema: ValidationSchema = {};

        for (const [fieldName, rule] of Object.entries(schemaDefinition)) {
            schema[fieldName] = {
                type: rule.type || 'string',
                required: rule.required !== undefined ? rule.required : true,
                minLength: rule.minLength,
                maxLength: rule.maxLength,
                pattern: rule.pattern,
                custom: rule.custom
            };
        }

        return schema;
    }
}