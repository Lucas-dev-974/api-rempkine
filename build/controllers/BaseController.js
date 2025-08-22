"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
var Controller = /** @class */ (function () {
    function Controller() {
    }
    Controller.prototype.validators = function (data, schema) {
        var errors = [];
        var sanitizedData = {};
        var _loop_1 = function (fieldName, rule) {
            var value = data[fieldName];
            // Vérifier si le champ est requis
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push("Le champ '".concat(fieldName, "' est requis"));
                return "continue";
            }
            // Si le champ n'est pas requis et n'est pas présent, passer au suivant
            if (!rule.required && (value === undefined || value === null)) {
                return "continue";
            }
            // Valider le type
            if (!this_1.validateType(value, rule.type)) {
                errors.push("Le champ '".concat(fieldName, "' doit \u00EAtre de type '").concat(rule.type, "'"));
                return "continue";
            }
            // Valider la longueur pour les chaînes
            if (rule.type === 'string' && typeof value === 'string') {
                if (rule.minLength && value.length < rule.minLength) {
                    errors.push("Le champ '".concat(fieldName, "' doit avoir au moins ").concat(rule.minLength, " caract\u00E8res"));
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push("Le champ '".concat(fieldName, "' ne peut pas d\u00E9passer ").concat(rule.maxLength, " caract\u00E8res"));
                }
            }
            // Valider le format email
            if (rule.type === 'email' && !this_1.isValidEmail(value)) {
                errors.push("Le champ '".concat(fieldName, "' doit \u00EAtre un email valide"));
            }
            // Valider le pattern regex
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push("Le champ '".concat(fieldName, "' ne respecte pas le format attendu"));
            }
            // Validation personnalisée
            if (rule.custom && !rule.custom(value)) {
                errors.push("Le champ '".concat(fieldName, "' ne respecte pas la validation personnalis\u00E9e"));
            }
            // Si toutes les validations passent, sanitizer et stocker la valeur
            if (errors.length === 0 || !errors.some(function (error) { return error.includes(fieldName); })) {
                sanitizedData[fieldName] = this_1.sanitizeValue(value, rule.type);
            }
        };
        var this_1 = this;
        // Vérifier chaque champ du schéma
        for (var _i = 0, _a = Object.entries(schema); _i < _a.length; _i++) {
            var _b = _a[_i], fieldName = _b[0], rule = _b[1];
            _loop_1(fieldName, rule);
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            data: sanitizedData
        };
    };
    Controller.prototype.validateType = function (value, expectedType) {
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
    };
    Controller.prototype.isValidEmail = function (email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    Controller.prototype.sanitizeValue = function (value, type) {
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
    };
    Controller.prototype.sanitizeString = function (value) {
        if (typeof value !== 'string')
            return value;
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
    };
    Controller.prototype.sanitizeEmail = function (value) {
        if (typeof value !== 'string')
            return value;
        // Nettoyer l'email et vérifier qu'il est valide
        var sanitized = this.sanitizeString(value).toLowerCase();
        return this.isValidEmail(sanitized) ? sanitized : value;
    };
    Controller.prototype.sanitizeNumber = function (value) {
        if (typeof value === 'number')
            return value;
        if (typeof value === 'string') {
            var parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };
    Controller.prototype.sanitizeBoolean = function (value) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'string') {
            var lower = value.toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'yes';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        return false;
    };
    Controller.prototype.sanitizeDate = function (value) {
        if (value instanceof Date)
            return value;
        if (typeof value === 'string') {
            var date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        return value;
    };
    Controller.prototype.sanitizeArray = function (value) {
        var _this = this;
        if (!Array.isArray(value))
            return [];
        return value.map(function (item) {
            if (typeof item === 'string') {
                return _this.sanitizeString(item);
            }
            return item;
        });
    };
    Controller.prototype.sanitizeObject = function (value) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return value;
        }
        var sanitized = {};
        for (var _i = 0, _a = Object.entries(value); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            if (typeof val === 'string') {
                sanitized[key] = this.sanitizeString(val);
            }
            else {
                sanitized[key] = val;
            }
        }
        return sanitized;
    };
    // Méthode utilitaire pour créer un schéma de validation rapidement
    Controller.prototype.createSchema = function (schemaDefinition) {
        var schema = {};
        for (var _i = 0, _a = Object.entries(schemaDefinition); _i < _a.length; _i++) {
            var _b = _a[_i], fieldName = _b[0], rule = _b[1];
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
    };
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=BaseController.js.map