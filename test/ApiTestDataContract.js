const axios = require('axios');

/**
 * Gestionnaire de données pour les tests d'API des contrats
 * Structure extensible pour gérer les données de test pour les routes contract
 */
class ApiTestDataContract {
  constructor() {
    // ============================================
    // VARIABLES RÉUTILISABLES - Contrats de test
    // ============================================
    
    // Contrat complet pour la création
    const completeContract = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      percentReturnToSubstitute: 50,
      percentReturnToSubstituteBeforeDate: '2024-06-01',
      nonInstallationRadius: 10,
      conciliationCDOMK: 'CDOMK-12345',
      doneAtLocation: 'Paris',
      doneAt: '2024-01-15',
      // Replaced kinesitherapist
      replacedGender: 'male',
      replacedEmail: 'replaced@example.com',
      replacedName: 'Jean Dupont',
      replacedBirthday: '1980-05-15',
      replacedBirthdayLocation: 'Lyon',
      replacedOrderDepartement: 'Rhône',
      replacedOrderDepartmentNumber: '69',
      replacedProfessionnalAddress: '123 Rue Replaced, 69000 Lyon',
      // Substitute kinesitherapist
      substituteGender: 'female',
      substituteEmail: 'substitute@example.com',
      substituteName: 'Marie Martin',
      substituteBirthday: '1985-08-20',
      substituteBirthdayLocation: 'Marseille',
      substituteOrderDepartement: 'Bouches-du-Rhône',
      substituteOrderDepartmentNumber: '13',
      substituteAdress: '456 Rue Substitute, 13000 Marseille',
      replacedSignatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      substituteSignatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    // Contrat partiel (champs minimaux)
    const partialContract = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      replacedName: 'Jean Dupont',
      substituteName: 'Marie Martin'
    };

    // Contrat avec données invalides
    const invalidContract = {
      ...completeContract,
      replacedEmail: 'invalid-email', // Email invalide
      percentReturnToSubstitute: -10 // Pourcentage négatif invalide
    };

    // Contrat pour la mise à jour
    const updateContract = {
      id: '<contractId>', // Sera remplacé dynamiquement
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      percentReturnToSubstitute: 60,
      replacedName: 'Jean Dupont Modifié',
      substituteName: 'Marie Martin Modifiée'
    };

    // Contrat avec genre invalide
    const invalidGenderContract = {
      ...completeContract,
      replacedGender: 'invalid-gender',
      substituteGender: 'invalid-gender'
    };

    // Contrat pour la recherche
    const searchContract = {
      replacedName: 'Jean',
      substituteName: 'Marie'
    };

    // Contrat local (avec ID temporaire pour la synchronisation)
    const localContract = {
      ...completeContract,
      id: 'contract_123' // ID local temporaire
    };

    // Contrat local avec updatedAt pour tester la mise à jour
    const localContractWithUpdate = {
      ...completeContract,
      id: '<contractId>', // ID existant en BDD
      updatedAt: new Date().toISOString(), // Date de mise à jour
      startDate: '2024-03-01' // Modification
    };

    // Contrat local à supprimer
    const localContractToDelete = {
      ...completeContract,
      id: '<contractId>', // ID existant en BDD
      deleted: true // Marqué pour suppression
    };

    // Structure de réponse contrat
    const contractResponseStructure = {
      id: 'number',
      startDate: 'string',
      endDate: 'string',
      percentReturnToSubstitute: 'number',
      percentReturnToSubstituteBeforeDate: 'string',
      nonInstallationRadius: 'number',
      conciliationCDOMK: 'string',
      doneAtLocation: 'string',
      doneAt: 'string',
      replacedGender: 'string', // 'male' ou 'female'
      replacedEmail: 'string',
      replacedName: 'string',
      replacedBirthday: 'string', // Date au format ISO
      replacedBirthdayLocation: 'string',
      replacedOrderDepartement: 'string',
      replacedOrderDepartmentNumber: 'string',
      replacedProfessionnalAddress: 'string',
      substituteGender: 'string', // 'male' ou 'female'
      substituteEmail: 'string',
      substituteName: 'string',
      substituteBirthday: 'string', // Date au format ISO
      substituteBirthdayLocation: 'string',
      substituteOrderDepartement: 'string',
      substituteOrderDepartmentNumber: 'string',
      substituteAdress: 'string',
      replacedSignatureDataUrl: 'string',
      substituteSignatureDataUrl: 'string',
      createdAt: 'string', // Date au format ISO
      updatedAt: 'string', // Date au format ISO
      isPublic: 'boolean',
      user: 'object' // Relation User
    };

    this.data = {
      // Configuration de base de l'API
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      
      // Données pour les endpoints de contrats
      contract: {
        // GET /api/contract - List all contracts
        list: {
          method: 'GET',
          path: '/api/contract',
          description: 'Liste tous les contrats de l\'utilisateur connecté',
          requiresAuth: true,
          testCases: {
            success: {
              input: {}, // Pas de body, nécessite un token JWT dans les headers
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
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
            }
          }
        },

        // POST /api/contract - Create contract
        create: {
          method: 'POST',
          path: '/api/contract',
          description: 'Création d\'un nouveau contrat',
          requiresAuth: true,
          testCases: {
            success: {
              input: completeContract,
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 201,
              expectedResponseType: 'object',
              expectedResponseStructure: contractResponseStructure,
              saveVariables: {
                'contractId': 'id' // Sauvegarde response.data.id dans savedVariables.contractId
                // Note: La logique pour createdContractId vs syncContractId est gérée dans runLiveTest.js
              }
            },
            missingRequiredFields: {
              input: {}, // Pas de données
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            },
            invalidEmail: {
              input: invalidContract,
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            },
            invalidGender: {
              input: invalidGenderContract,
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            },
            noToken: {
              input: completeContract,
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            }
          }
        },

        // PATCH /api/contract - Update contract
        update: {
          method: 'PATCH',
          path: '/api/contract',
          description: 'Mise à jour d\'un contrat existant',
          requiresAuth: true,
          testCases: {
            // unauthorized doit être exécuté avant success pour tester l'autorisation sur un contrat existant
            unauthorized: {
              input: updateContract,
              headers: {
                Authorization: 'Bearer <secondToken>' // Token du deuxième utilisateur
              },
              expectedStatus: 403,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            missingId: {
              input: {
                ...updateContract,
                id: undefined
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            invalidId: {
              input: {
                ...updateContract,
                id: 'invalid-id'
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            contractNotFound: {
              input: {
                ...updateContract,
                id: 999999 // ID qui n'existe pas
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 404,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            success: {
              input: updateContract,
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: contractResponseStructure
            },
            noToken: {
              input: updateContract,
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            }
          }
        },

        // GET /api/contract/search - Search contracts
        search: {
          method: 'GET',
          path: '/api/contract/search',
          description: 'Recherche de contrats',
          requiresAuth: true,
          testCases: {
            success: {
              input: {}, // Pas de body, query params dans l'URL
              query: {
                q: 'Jean' // Terme de recherche
              },
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
            },
            successEmptyQuery: {
              input: {},
              query: {}, // Pas de query, retourne tous les contrats
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
            },
            noToken: {
              input: {},
              query: { q: 'Jean' },
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            }
          }
        },

        // GET /api/contract/one - Get one contract
        getOne: {
          method: 'GET',
          path: '/api/contract/one',
          description: 'Récupération d\'un contrat spécifique',
          requiresAuth: true,
          testCases: {
            success: {
              input: {}, // Pas de body, query params dans l'URL
              query: {
                id: '<contractId>' // ID du contrat
              },
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: contractResponseStructure
            },
            missingId: {
              input: {},
              query: {}, // Pas d'ID
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'string', // Retourne une string d'erreur
              expectedResponseStructure: 'string'
            },
            invalidId: {
              input: {},
              query: {
                id: 'invalid-id'
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            contractNotFound: {
              input: {},
              query: {
                id: 999999 // ID qui n'existe pas
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 404,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            noToken: {
              input: {},
              query: { id: '<contractId>' },
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            }
          }
        },

        // // DELETE /api/contract/:id - Delete contract
        delete: {
          method: 'DELETE',
          path: '/api/contract/:id',
          description: 'Suppression d\'un contrat',
          requiresAuth: true,
          testCases: {
            // IMPORTANT: unauthorized doit être exécuté AVANT success car success supprime le contrat
            unauthorized: {
              input: {},
              pathParams: {
                id: '<contractId>' // Contrat créé par le premier utilisateur
              },
              headers: {
                Authorization: 'Bearer <secondToken>' // Token du deuxième utilisateur
              },
              expectedStatus: 403,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            missingId: {
              input: {},
              pathParams: {}, // Pas d'ID
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            invalidId: {
              input: {},
              pathParams: {
                id: 'invalid-id'
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            contractNotFound: {
              input: {},
              pathParams: {
                id: 999999 // ID qui n'existe pas
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 404,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            noToken: {
              input: {},
              pathParams: { id: '<contractId>' },
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            // success doit être en dernier car il supprime le contrat
            success: {
              input: {}, // Pas de body
              pathParams: {
                id: '<contractId>' // ID du contrat dans l'URL
              },
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                message: 'string'
              }
            }
          }
        },

        // POST /api/contract/register-local-contrats - Synchronize contracts
        synchronizeContracts: {
          method: 'POST',
          path: '/api/contract/register-local-contrats',
          description: 'Synchronisation de contrats locaux avec la base de données',
          requiresAuth: true,
          testCases: {
            success: {
              input: {
                contracts: [
                  localContract, // Contrat local à créer (id: 'contract_123')
                  localContractWithUpdate // Contrat existant à mettre à jour
                ]
              },
              headers: {
                Authorization: 'Bearer <token>' // Token JWT requis
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
            },
            successWithDeletion: {
              input: {
                contracts: [
                  {
                    ...completeContract,
                    id: '<syncContractId>', // ID d'un contrat créé spécifiquement pour ce test
                    deleted: true // Marqué pour suppression
                  }
                ]
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
            },
            successMixed: {
              input: {
                contracts: [
                  localContract, // Nouveau contrat local à créer
                  localContractWithUpdate // Contrat existant à mettre à jour
                  // Note: On ne supprime pas le contrat principal pour ne pas casser les tests suivants
                ]
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              expectedResponseStructure: [contractResponseStructure]
            },
            missingContracts: {
              input: {}, // Pas de contracts
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            },
            invalidContracts: {
              input: {
                contracts: 'not-an-array' // Pas un tableau
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            },
            noToken: {
              input: {
                contracts: [localContract]
              },
              headers: {},
              expectedStatus: 401,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'string'
              }
            },
            invalidLocalContract: {
              input: {
                contracts: [
                  {
                    ...invalidContract,
                    id: 'contract_invalid' // Contrat local avec données invalides
                  }
                ]
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 400,
              expectedResponseType: 'object',
              expectedResponseStructure: {
                error: 'array' // Erreurs de validation
              }
            }
          }
        }
      }
    };
  }

  /**
   * Récupère les données de test pour un endpoint spécifique
   * @param {string} category - Catégorie (ex: 'contract')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'list', 'create', 'update')
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
   * @param {string} category - Catégorie (ex: 'contract')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'create')
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
   * @param {string} category - Catégorie (ex: 'contract')
   * @param {string} endpoint - Nom de l'endpoint (ex: 'create')
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
const apiTestDataContract = new ApiTestDataContract();

module.exports = {
  apiTestDataContract,
  ApiTestDataContract,
  axios
};

