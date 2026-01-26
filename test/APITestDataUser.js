const axios = require('axios');

/**
 * Gestionnaire de données global pour les tests d'API
 * Structure extensible pour gérer les données de test pour différentes routes
 */
class APITestDataUser {
  constructor() {
    // ============================================
    // VARIABLES RÉUTILISABLES - Utilisateurs de test
    // ============================================
    
    // Utilisateur complet pour l'inscription (register) - Premier utilisateur
    const user = {
      email: 'lucas.lvn97439@gmail.com',
      fullname: 'John Doe',
      password: 'password123',
      birthday: '1990-01-01',
      bornLocation: 'Paris',
      department: 'Informatique',
      orderNumber: 12345,
      personalAdress: '123 Rue Example',
      officeAdress: '456 Office Street',
      phoneNumber: '+33123456789',
      gender: 'male'
    };

    // Deuxième utilisateur pour tester l'autorisation
    const secondUser = {
      email: 'seconduser@example.com',
      fullname: 'Jane Smith',
      password: 'password456',
      birthday: '1992-03-15',
      bornLocation: 'Lyon',
      department: 'Médecine',
      orderNumber: 67890,
      personalAdress: '789 Rue Second, 69000 Lyon',
      officeAdress: '321 Office Second, 69000 Lyon',
      phoneNumber: '+33987654321',
      gender: 'female'
    };

    // Utilisateur pour la connexion (login) - utilise les mêmes identifiants que user
    const loginUser = {
      email: user.email, // Même email que pour l'enregistrement
      password: user.password // Même mot de passe que pour l'enregistrement
    };

    // Utilisateur pour la connexion du deuxième utilisateur
    const secondLoginUser = {
      email: secondUser.email,
      password: secondUser.password
    };

    // Utilisateur avec email invalide
    const invalidEmailUser = {
      email: "invalid-email",
      password: 'password123'
    };

    // Utilisateur avec identifiants incorrects
    const wrongCredentialsUser = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };

    // Utilisateur avec date invalide
    const invalidDateUser = {
      ...user,
      birthday: 'invalid-date'
    };

    // Utilisateur avec genre invalide
    const invalidGenderUser = {
      ...user,
      gender: 'invalid'
    };

    // Utilisateur partiel (champs manquants)
    const partialUser = {
      email: user.email // Même email que pour l'enregistrement
      // Manque les autres champs requis
    };

    // Structure de réponse utilisateur (sans password)
    const userResponseStructure = {
      id: 'number',
      email: 'string',
      fullname: 'string',
      birthday: 'string', // Date au format ISO
      bornLocation: 'string',
      department: 'string',
      orderNumber: 'string',
      personalAdress: 'string',
      officeAdress: 'string',
      phoneNumber: 'string',
      gender: 'string', // 'male' ou 'female'
      status: 'string', // 'student' ou 'professionnal'
      isPublic: 'boolean'
      // Pas de password dans la réponse
    };

    // Structure de réponse avec token (login/register success)
    const authResponseStructure = {
      user: userResponseStructure,
      token: 'string'
    };

    this.data = {
      // Configuration de base de l'API
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      
      // Données pour les endpoints d'authentification
      auth: {

        // PATCH /api/auth - Register
        register: {
          method: 'PATCH',
          path: '/api/auth',
          description: 'Inscription d\'un nouvel utilisateur',
          testCases: {
            success: {
              input: user,
              expectedStatus: 201,
              expectedResponseType: 'object',
              expectedResponseStructure: authResponseStructure,
              saveVariables: {
                'token': 'token' // Sauvegarde response.data.token dans savedVariables.token
              }
            },
            successSecondUser: {
              input: secondUser,
              expectedStatus: 201,
              expectedResponseType: 'object',
              expectedResponseStructure: authResponseStructure,
              saveVariables: {
                'secondToken': 'token' // Sauvegarde response.data.token dans savedVariables.secondToken
              }
            },
            missingRequiredFields: {
              input: partialUser,
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                // Erreurs de validation pour chaque champ manquant
                fullname: 'array',
                password: 'array',
                birthday: 'array',
                bornLocation: 'array',
                department: 'array',
                orderNumber: 'array',
                personalAdress: 'array',
                phoneNumber: 'array',
                gender: 'array'
              }
            },
            invalidDate: {
              input: invalidDateUser,
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                birthday: 'array' // Erreurs de validation
              }
            },
            invalidGender: {
              input: invalidGenderUser,
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                gender: 'array' // Erreurs de validation
              }
            },
            existingUser: {
              input: user, // Mêmes données que success pour tester le cas utilisateur existant
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
          }
        },

                // POST /api/auth - Login
        login: {
          method: 'POST',
          path: '/api/auth',
          description: 'Connexion d\'un utilisateur',
          testCases: {
            success: {
              input: loginUser,
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: authResponseStructure,
              saveVariables: {
                'token': 'token' // Sauvegarde response.data.token dans savedVariables.token
              }
            },
            invalidCredentials: {
              input: wrongCredentialsUser,
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            missingEmail: {
              input: {
                password: loginUser.password
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                email: 'array' // Erreurs de validation
              }
            },
            missingPassword: {
              input: {
                email: loginUser.email
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                password: 'array' // Erreurs de validation
              }
            },
            invalidEmailFormat: {
              input: invalidEmailUser,
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                email: 'array' // Erreurs de validation
              }
            },
            successSecondUser: {
              input: secondLoginUser,
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: authResponseStructure,
              saveVariables: {
                'secondToken': 'token' // Sauvegarde response.data.token dans savedVariables.secondToken
              }
            }
          }
        },

        // GET /api/auth/me - Get current user
        me: {
          method: 'GET',
          path: '/api/auth/me',
          description: 'Récupération des informations de l\'utilisateur connecté',
          requiresAuth: true,
          testCases: {
            success: {
              input: {}, // Pas de body, nécessite un token JWT dans les headers
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: userResponseStructure
            },
            noToken: {
              input: {},
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            invalidToken: {
              input: {},
              headers: {
                Authorization: 'Bearer invalid-token'
              },
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            expiredToken: {
              input: {},
              headers: {
                Authorization: 'Bearer <expired-token>'
              },
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            }
          }
        }
      }
    };
  }

  /**
   * Récupère les données de test pour un endpoint spécifique
   * @param {string} category - Catégorie (ex: 'auth')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'login', 'register', 'me')
   * @returns {object|null} Les données de l'endpoint ou null si non trouvé
   */
  getEndpointData(category, endpoint) {
    if (this.data[category] && this.data[category][endpoint]) {
      return this.data[category][endpoint];
    }
    return null;
  }

  /**
   * Récupère un cas de test spécifique pour un endpoint
   * @param {string} category - Catégorie (ex: 'auth')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'login')
   * @param {string} testCase - Nom du cas de test (ex: 'success')
   * @returns {object|null} Les données du cas de test ou null si non trouvé
   */
  getTestCase(category, endpoint, testCase) {
    const endpointData = this.getEndpointData(category, endpoint);
    if (endpointData && endpointData.testCases && endpointData.testCases[testCase]) {
      return endpointData.testCases[testCase];
    }
    return null;
  }

  /**
   * Récupère l'URL complète pour un endpoint
   * @param {string} category - Catégorie (ex: 'auth')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'login')
   * @param {object} params - Paramètres optionnels (pathParams, query)
   * @returns {string|null} L'URL complète ou null si non trouvé
   */
  getFullURL(category, endpoint, params = {}) {
    const endpointData = this.getEndpointData(category, endpoint);
    if (endpointData) {
      let url = `${this.data.baseURL}${endpointData.path}`;
      
      // Remplacer les path params
      if (params.pathParams) {
        Object.keys(params.pathParams).forEach(key => {
          url = url.replace(`:${key}`, params.pathParams[key]);
        });
      }
      
      // Ajouter les query params
      if (params.query && Object.keys(params.query).length > 0) {
        const queryString = new URLSearchParams(params.query).toString();
        url += `?${queryString}`;
      }
      
      return url;
    }
    return null;
  }

  /**
   * Ajoute ou met à jour les données pour une nouvelle catégorie d'endpoints
   * @param {string} category - Nom de la catégorie
   * @param {object} endpoints - Objet contenant les endpoints de la catégorie
   */
  addCategory(category, endpoints) {
    this.data[category] = endpoints;
  }

  /**
   * Ajoute ou met à jour un endpoint dans une catégorie existante
   * @param {string} category - Nom de la catégorie
   * @param {string} endpoint - Nom de l'endpoint
   * @param {object} endpointData - Données de l'endpoint
   */
  addEndpoint(category, endpoint, endpointData) {
    if (!this.data[category]) {
      this.data[category] = {};
    }
    this.data[category][endpoint] = endpointData;
  }
}

// Instance singleton du gestionnaire
const apiTestDataUser = new APITestDataUser();

module.exports = {
  apiTestDataUser,
  APITestDataUser,
  axios
};

