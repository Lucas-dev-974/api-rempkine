const { 
  getDataManagerForCategory, 
  getAllCategories, 
  getEndpointsForCategory, 
  getBaseURL 
} = require('./dataManagers.js');
const axios = require('axios');

/**
 * Classe pour exécuter les tests en direct sur l'API
 * Complètement générique - ne nécessite aucune modification lors de l'ajout de nouveaux endpoints
 */
class LiveTestRunner {
  constructor() {
    this.baseURL = getBaseURL();
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      ignored: 0
    };
    // Objet dynamique pour stocker toutes les variables sauvegardées
    // Les clés sont définies dans les test cases via la propriété saveVariables
    this.savedVariables = {};
  }

  /**
   * Affiche un message avec un style
   */
  log(message, type = 'info') {
    const colors = {
      success: '\x1b[32m', // Vert
      error: '\x1b[31m',   // Rouge
      warning: '\x1b[33m', // Jaune
      info: '\x1b[36m',    // Cyan
      reset: '\x1b[0m'
    };
    
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };

    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  /**
   * Récupère le gestionnaire de données approprié selon la catégorie
   * Générique - découvre automatiquement le gestionnaire depuis dataManagers.js
   */
  getDataManager(category) {
    const manager = getDataManagerForCategory(category);
    if (!manager) {
      this.log(`Gestionnaire de données non trouvé pour la catégorie: ${category}`, 'error');
    }
    return manager;
  }

  /**
   * Sauvegarde les variables définies dans saveVariables depuis la réponse
   * Complètement générique - aucune référence hardcodée aux noms de variables
   * @param {object} testCase - Le cas de test avec la propriété saveVariables
   * @param {object} responseData - Les données de la réponse (response.data)
   */
  saveVariablesFromResponse(testCase, responseData) {
    if (!testCase.saveVariables || !responseData) {
      return;
    }

    for (const [variableName, dataPath] of Object.entries(testCase.saveVariables)) {
      // Extraire la valeur depuis responseData en suivant le chemin
      // Exemple: 'token' -> responseData.token, 'id' -> responseData.id
      const value = this.getNestedValue(responseData, dataPath);
      
      if (value !== undefined && value !== null) {
        // Sauvegarde générique - aucune logique spéciale
        this.savedVariables[variableName] = value;
        this.log(`  ✓ Variable '${variableName}' sauvegardée: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`, 'success');
      }
    }
  }

  /**
   * Récupère une valeur imbriquée depuis un objet en utilisant un chemin
   * @param {object} obj - L'objet source
   * @param {string} path - Le chemin (ex: 'token', 'user.id')
   * @returns {any} La valeur trouvée ou undefined
   */
  getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }
    return value;
  }

  /**
   * Remplace les placeholders dans une chaîne par les valeurs sauvegardées
   * Découvre automatiquement tous les placeholders au format <nom-variable>
   * et les remplace par les valeurs de savedVariables
   * @param {string} str - La chaîne contenant les placeholders
   * @returns {string|null} La chaîne avec les placeholders remplacés, ou null si un placeholder requis est manquant
   */
  replacePlaceholders(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // Détecter tous les placeholders au format <nom-variable>
    const placeholderRegex = /<([a-zA-Z0-9_-]+)>/g;
    let result = str;
    const matches = [...str.matchAll(placeholderRegex)];
    
    for (const match of matches) {
      const placeholder = match[0]; // Ex: '<token>'
      const variableName = match[1]; // Ex: 'token'
      
      // Chercher la variable dans savedVariables
      const value = this.savedVariables[variableName];
      
      if (value === undefined || value === null) {
        // Placeholder requis mais non disponible
        return null;
      }
      
      // Remplacer toutes les occurrences du placeholder
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    return result;
  }

  /**
   * Remplace les placeholders dans un objet (récursif pour les objets et tableaux)
   * @param {any} obj - L'objet, tableau ou valeur à traiter
   * @returns {any|null} L'objet avec les placeholders remplacés, ou null si un placeholder requis est manquant
   */
  replacePlaceholdersInObject(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Si c'est une chaîne, utiliser replacePlaceholders
    if (typeof obj === 'string') {
      return this.replacePlaceholders(obj);
    }

    // Si c'est un tableau, traiter chaque élément
    if (Array.isArray(obj)) {
      const result = [];
      for (const item of obj) {
        const replaced = this.replacePlaceholdersInObject(item);
        // Si le remplacement a retourné null et que l'item original était une chaîne avec des placeholders
        if (replaced === null && typeof item === 'string' && item.includes('<') && item.includes('>')) {
          // Un placeholder requis est manquant
          return null;
        }
        result.push(replaced);
      }
      return result;
    }

    // Si c'est un objet, traiter chaque propriété
    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const replaced = this.replacePlaceholdersInObject(value);
        // Si le remplacement a retourné null et que la valeur originale était une chaîne avec des placeholders
        if (replaced === null && typeof value === 'string' && value.includes('<') && value.includes('>')) {
          // Un placeholder requis est manquant
          return null;
        }
        result[key] = replaced;
      }
      return result;
    }

    // Autres types (number, boolean, etc.) - retourner tel quel
    return obj;
  }

  /**
   * Teste un endpoint avec un cas de test spécifique
   */
  async testEndpoint(category, endpoint, testCaseName) {
    const dataManager = this.getDataManager(category);
    const testCase = dataManager.getTestCase(category, endpoint, testCaseName);
    const endpointData = dataManager.getEndpointData(category, endpoint);
    
    if (!testCase || !endpointData) {
      this.log(`Cas de test non trouvé: ${category}/${endpoint}/${testCaseName}`, 'error');
      return false;
    }

    // Afficher le test dès le début pour qu'il soit visible même s'il est ignoré
    this.log(`Test: ${endpointData.description} - ${testCaseName}`, 'info');

    // Préparer les paramètres pour l'URL (path params et query params)
    // Remplacer automatiquement tous les placeholders de manière générique
    const params = {};
    if (testCase.pathParams) {
      const replacedPathParams = this.replacePlaceholdersInObject(testCase.pathParams);
      if (replacedPathParams === null) {
        this.log(`  ⚠ Placeholder requis mais non disponible dans pathParams, test ignoré`, 'warning');
        return null;
      }
      params.pathParams = replacedPathParams;
    }
    if (testCase.query) {
      const replacedQuery = this.replacePlaceholdersInObject(testCase.query);
      if (replacedQuery === null) {
        this.log(`  ⚠ Placeholder requis mais non disponible dans query, test ignoré`, 'warning');
        return null;
      }
      params.query = replacedQuery;
    }

    const url = dataManager.getFullURL(category, endpoint, params);
    const method = endpointData.method.toLowerCase();
    
    this.log(`  ${method.toUpperCase()} ${url}`, 'info');

    try {
      // Préparer les headers
      const headers = { ...testCase.headers };
      
      // Remplacer les placeholders dans les headers de manière générique
      if (headers.Authorization) {
        const replacedAuth = this.replacePlaceholders(headers.Authorization);
        if (replacedAuth === null) {
          // Extraire le nom de la variable manquante depuis le placeholder
          const placeholderMatch = headers.Authorization.match(/<([a-zA-Z0-9_-]+)>/);
          const missingVar = placeholderMatch ? `Variable '${placeholderMatch[1]}'` : 'Variable';
          this.log(`  ⚠ ${missingVar} requis mais non disponible, test ignoré`, 'warning');
          return null;
        }
        headers.Authorization = replacedAuth;
      }

      // Préparer la requête
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 10000 // 10 secondes
      };

      // Ajouter les données si nécessaire
      if (method !== 'get' && testCase.input && Object.keys(testCase.input).length > 0) {
        // Remplacer les placeholders dans les données
        let inputData = this.replacePlaceholdersInObject(testCase.input);
        if (inputData === null) {
          this.log(`  ⚠ Placeholder requis mais non disponible dans les données d'entrée, test ignoré`, 'warning');
          return null;
        }
        config.data = inputData;
      }

      // Ajouter les query params pour les requêtes GET
      if (method === 'get' && params.query && Object.keys(params.query).length > 0) {
        const queryString = new URLSearchParams(params.query).toString();
        config.url += `?${queryString}`;
      }

      // Exécuter la requête
      const response = await axios(config);

      // Vérifier le statut
      const statusMatch = response.status === testCase.expectedStatus;
      
      if (statusMatch) {
        this.log(`  ✓ Status: ${response.status} (attendu: ${testCase.expectedStatus})`, 'success');
        
        // Sauvegarder les variables définies dans saveVariables
        this.saveVariablesFromResponse(testCase, response.data);
        
        this.results.passed++;
        return true;
      } else {
        this.log(`  ✗ Status: ${response.status} (attendu: ${testCase.expectedStatus})`, 'error');
        this.log(`  Réponse: ${JSON.stringify(response.data).substring(0, 200)}`, 'error');
        this.results.failed++;
        return false;
      }

    } catch (error) {
      // Gérer les erreurs de réponse HTTP
      if (error.response) {
        const status = error.response.status;
        const statusMatch = status === testCase.expectedStatus;
        
        if (statusMatch) {
          this.log(`  ✓ Status: ${status} (attendu: ${testCase.expectedStatus})`, 'success');
          
          // Sauvegarder les variables définies dans saveVariables (même en cas d'erreur HTTP attendue)
          if (error.response && error.response.data) {
            this.saveVariablesFromResponse(testCase, error.response.data);
          }
          
          this.results.passed++;
          return true;
        } else {
          this.log(`  ✗ Status: ${status} (attendu: ${testCase.expectedStatus})`, 'error');
          this.log(`  Réponse: ${JSON.stringify(error.response.data).substring(0, 200)}`, 'error');
          this.results.failed++;
          return false;
        }
      } else if (error.request) {
        this.log(`  ✗ Erreur de connexion: Impossible de joindre le serveur`, 'error');
        this.log(`  Vérifiez que le serveur est démarré sur ${this.baseURL}`, 'warning');
        this.results.failed++;
        return false;
      } else {
        this.log(`  ✗ Erreur: ${error.message}`, 'error');
        this.results.failed++;
        return false;
      }
    }
  }

  /**
   * Teste tous les cas de test pour un endpoint
   */
  async testEndpointAllCases(category, endpoint) {
    const dataManager = this.getDataManager(category);
    const endpointData = dataManager.getEndpointData(category, endpoint);
    
    if (!endpointData) {
      this.log(`Endpoint non trouvé: ${category}/${endpoint}`, 'error');
      return;
    }

    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`Test de l'endpoint: ${endpointData.description}`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');

    const testCases = Object.keys(endpointData.testCases);
    
    for (const testCaseName of testCases) {
      this.results.total++;
      const result = await this.testEndpoint(category, endpoint, testCaseName);
      
      // Si le test a été ignoré (null), on le compte
      if (result === null) {
        this.results.ignored++;
        // Le log a déjà été affiché dans testEndpoint avec le message d'ignoré
      }
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Teste tous les endpoints d'une catégorie spécifique
   * Générique - découvre automatiquement tous les endpoints de la catégorie
   * @param {string} category - La catégorie à tester
   */
  async testAllCategoryEndpoints(category) {
    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`DÉMARRAGE DES TESTS: ${category.toUpperCase()}`, 'info');
    this.log(`Base URL: ${this.baseURL}`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');

    // Découvrir tous les endpoints de cette catégorie
    const endpoints = getEndpointsForCategory(category);
    
    if (endpoints.length === 0) {
      this.log(`Aucun endpoint trouvé pour la catégorie: ${category}`, 'warning');
      return;
    }

    this.log(`Endpoints trouvés: ${endpoints.join(', ')}`, 'info');

    // Exécuter tous les endpoints dans l'ordre découvert
    for (const endpoint of endpoints) {
      await this.testEndpointAllCases(category, endpoint);
    }

    // Afficher le résumé
    this.printSummary();
  }

  /**
   * Teste tous les endpoints de toutes les catégories
   * Complètement générique - découvre automatiquement toutes les catégories
   */
  async testAllEndpoints() {
    // Réinitialiser les résultats
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      ignored: 0
    };

    // Découvrir toutes les catégories disponibles
    const categories = getAllCategories();
    
    if (categories.length === 0) {
      this.log(`Aucune catégorie de test trouvée. Vérifiez que les gestionnaires de données sont bien enregistrés dans dataManagers.js`, 'error');
      return;
    }

    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`DÉMARRAGE DE TOUS LES TESTS`, 'info');
    this.log(`Catégories trouvées: ${categories.join(', ')}`, 'info');
    this.log(`Base URL: ${this.baseURL}`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');

    // Tester chaque catégorie
    for (const category of categories) {
      await this.testAllCategoryEndpoints(category);
    }
  }

  /**
   * Affiche le résumé des tests
   */
  printSummary() {
    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`RÉSUMÉ DES TESTS`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');
    this.log(`Total: ${this.results.total}`, 'info');
    this.log(`Réussis: ${this.results.passed}`, 'success');
    this.log(`Échoués: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    
    // S'assurer que ignored est défini (peut être undefined si pas initialisé)
    const ignoredCount = (this.results.ignored !== undefined && this.results.ignored !== null) ? this.results.ignored : 0;
    this.log(`Ignorés: ${ignoredCount}`, ignoredCount > 0 ? 'warning' : 'info');
    
    // Calculer le taux de réussite sur les tests réellement exécutés
    const testsExecuted = this.results.total - ignoredCount;
    const successRate = testsExecuted > 0 && !isNaN(testsExecuted) ? ((this.results.passed / testsExecuted) * 100).toFixed(1) : '0.0';
    this.log(`Taux de réussite: ${successRate}%`, 
      successRate >= 80 ? 'success' : successRate >= 50 ? 'warning' : 'error');
    this.log(`${'='.repeat(60)}\n`, 'info');
  }

  /**
   * Teste un endpoint spécifique avec un cas de test spécifique
   */
  async testSpecific(category, endpoint, testCaseName) {
    this.log(`\nTest spécifique: ${category}/${endpoint}/${testCaseName}`, 'info');
    this.results.total++;
    const result = await this.testEndpoint(category, endpoint, testCaseName);
    this.printSummary();
    return result;
  }
}

// Exécution des tests si le fichier est exécuté directement
if (require.main === module) {
  const runner = new LiveTestRunner();
  
  // Récupérer les arguments de la ligne de commande
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Exécuter tous les tests de toutes les catégories
    runner.testAllEndpoints().catch(error => {
      console.error('Erreur lors de l\'exécution des tests:', error);
      process.exit(1);
    });
  } else if (args.length === 1) {
    // Test d'une catégorie spécifique
    const category = args[0];
    const availableCategories = getAllCategories();
    
    if (availableCategories.includes(category)) {
      runner.testAllCategoryEndpoints(category).catch(error => {
        console.error('Erreur lors de l\'exécution des tests:', error);
        process.exit(1);
      });
    } else {
      console.log(`Catégorie inconnue: ${category}`);
      console.log(`Catégories disponibles: ${availableCategories.join(', ')}`);
      process.exit(1);
    }
  } else if (args.length === 3) {
    // Test spécifique: node runLiveTest.js auth login success
    const [category, endpoint, testCase] = args;
    runner.testSpecific(category, endpoint, testCase).catch(error => {
      console.error('Erreur lors de l\'exécution du test:', error);
      process.exit(1);
    });
  } else {
    const availableCategories = getAllCategories();
    console.log('Usage:');
    console.log('  node runLiveTest.js                              # Tous les tests de toutes les catégories');
    console.log(`  node runLiveTest.js <category>                    # Tous les tests d'une catégorie`);
    console.log(`  node runLiveTest.js <category> <endpoint> <case>  # Test spécifique`);
    console.log('');
    console.log(`Catégories disponibles: ${availableCategories.join(', ')}`);
    console.log('');
    console.log('Exemples:');
    console.log('  node runLiveTest.js auth');
    console.log('  node runLiveTest.js contract');
    console.log('  node runLiveTest.js auth login success');
    process.exit(1);
  }
}

module.exports = { LiveTestRunner };

