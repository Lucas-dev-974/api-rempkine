/**
 * Fichier d'index pour enregistrer tous les gestionnaires de données de test
 * 
 * Pour ajouter un nouveau gestionnaire :
 * 1. Créez votre fichier (ex: ApiTestDataXXX.js)
 * 2. Exportez une instance singleton (ex: apiTestDataXXX)
 * 3. Importez et ajoutez-le dans le tableau dataManagers ci-dessous
 */

const { apiTestDataUser } = require('./APITestDataUser.js');
const { apiTestDataContract } = require('./ApiTestDataContract.js');

/**
 * Tableau de tous les gestionnaires de données de test
 * Chaque gestionnaire doit avoir :
 * - Une propriété `data` avec les catégories et endpoints
 * - Les méthodes : getEndpointData(category, endpoint), getTestCase(category, endpoint, testCase)
 * - La méthode getFullURL(category, endpoint, params) optionnelle
 */
const dataManagers = [
  apiTestDataUser,
  apiTestDataContract
  // Ajoutez ici vos nouveaux gestionnaires
  // apiTestDataXXX,
];

/**
 * Récupère le gestionnaire de données pour une catégorie donnée
 * @param {string} category - La catégorie (ex: 'auth', 'contract')
 * @returns {object|null} Le gestionnaire de données ou null si non trouvé
 */
function getDataManagerForCategory(category) {
  for (const manager of dataManagers) {
    if (manager.data && manager.data[category]) {
      return manager;
    }
  }
  return null;
}

/**
 * Récupère toutes les catégories disponibles depuis tous les gestionnaires
 * @returns {string[]} Tableau des noms de catégories
 */
function getAllCategories() {
  const categories = new Set();
  for (const manager of dataManagers) {
    if (manager.data) {
      Object.keys(manager.data).forEach(cat => {
        // Exclure 'baseURL' qui n'est pas une catégorie
        if (cat !== 'baseURL') {
          categories.add(cat);
        }
      });
    }
  }
  return Array.from(categories);
}

/**
 * Récupère tous les endpoints d'une catégorie
 * @param {string} category - La catégorie
 * @returns {string[]} Tableau des noms d'endpoints
 */
function getEndpointsForCategory(category) {
  const manager = getDataManagerForCategory(category);
  if (manager && manager.data && manager.data[category]) {
    return Object.keys(manager.data[category]);
  }
  return [];
}

/**
 * Récupère l'URL de base depuis n'importe quel gestionnaire
 * (tous les gestionnaires doivent avoir la même baseURL)
 * @returns {string} L'URL de base
 */
function getBaseURL() {
  for (const manager of dataManagers) {
    if (manager.data && manager.data.baseURL) {
      return manager.data.baseURL;
    }
  }
  return 'http://localhost:3001'; // Valeur par défaut
}

module.exports = {
  dataManagers,
  getDataManagerForCategory,
  getAllCategories,
  getEndpointsForCategory,
  getBaseURL
};

