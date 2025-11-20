# Guide : Système Générique de Tests

## Vue d'ensemble

Le système de tests est maintenant **complètement générique**. Vous pouvez ajouter de nouveaux endpoints et catégories **sans modifier `runLiveTest.js`**.

## Architecture

```
myTest/
├── dataManagers.js          → Enregistre tous les gestionnaires de données
├── APITestDataUser.js       → Gestionnaire pour les tests d'authentification
├── ApiTestDataContract.js   → Gestionnaire pour les tests de contrats
├── runLiveTest.js           → Exécuteur générique (NE JAMAIS MODIFIER)
└── [VotreNouveauGestionnaire.js] → Votre nouveau gestionnaire
```

## Comment ajouter un nouveau gestionnaire de données

### Étape 1 : Créer votre fichier de gestionnaire

Créez un nouveau fichier (ex: `ApiTestDataXXX.js`) en suivant le modèle :

```javascript
const axios = require('axios');

class APITestDataXXX {
  constructor() {
    this.data = {
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      
      // Votre catégorie
      xxx: {
        // Votre endpoint
        list: {
          method: 'GET',
          path: '/api/xxx',
          description: 'Liste tous les XXX',
          requiresAuth: true,
          testCases: {
            success: {
              input: {},
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'array',
              saveVariables: {
                // Optionnel : variables à sauvegarder
                'xxxId': 'id'
              }
            }
          }
        }
      }
    };
  }

  getEndpointData(category, endpoint) {
    if (this.data[category] && this.data[category][endpoint]) {
      return this.data[category][endpoint];
    }
    return null;
  }

  getTestCase(category, endpoint, testCase) {
    const endpointData = this.getEndpointData(category, endpoint);
    if (endpointData && endpointData.testCases && endpointData.testCases[testCase]) {
      return endpointData.testCases[testCase];
    }
    return null;
  }

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
}

// Instance singleton
const apiTestDataXXX = new APITestDataXXX();

module.exports = {
  apiTestDataXXX,
  APITestDataXXX,
  axios
};
```

### Étape 2 : Enregistrer dans `dataManagers.js`

Ajoutez votre gestionnaire dans `dataManagers.js` :

```javascript
const { apiTestDataXXX } = require('./ApiTestDataXXX.js');

const dataManagers = [
  apiTestDataUser,
  apiTestDataContract,
  apiTestDataXXX  // ← Ajoutez ici
];
```

**C'est tout !** Le système découvrira automatiquement :
- ✅ Votre nouvelle catégorie
- ✅ Tous vos endpoints
- ✅ Tous vos test cases

## Structure requise d'un gestionnaire

Un gestionnaire de données doit avoir :

### 1. Propriété `data`

```javascript
this.data = {
  baseURL: 'http://localhost:3001',  // URL de base
  categoryName: {                    // Nom de votre catégorie
    endpointName: {                   // Nom de votre endpoint
      method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
      path: '/api/endpoint',
      description: 'Description de l\'endpoint',
      requiresAuth: true | false,     // Optionnel
      testCases: {
        testCaseName: {
          input: {},                   // Données d'entrée
          headers: {},                 // Headers HTTP
          query: {},                   // Query params (pour GET)
          pathParams: {},              // Path params (ex: { id: 123 })
          expectedStatus: 200,
          expectedResponseType: 'object' | 'array',
          expectedResponseStructure: {},
          saveVariables: {             // Optionnel : variables à sauvegarder
            'variableName': 'path.in.response.data'
          }
        }
      }
    }
  }
};
```

### 2. Méthodes requises

- `getEndpointData(category, endpoint)` : Retourne les données d'un endpoint
- `getTestCase(category, endpoint, testCase)` : Retourne un cas de test
- `getFullURL(category, endpoint, params)` : Construit l'URL complète (optionnel mais recommandé)

## Exemple complet

### Fichier : `ApiTestDataProduct.js`

```javascript
const axios = require('axios');

class APITestDataProduct {
  constructor() {
    const product = {
      name: 'Produit Test',
      price: 99.99,
      category: 'Electronics'
    };

    this.data = {
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      
      product: {
        list: {
          method: 'GET',
          path: '/api/product',
          description: 'Liste tous les produits',
          requiresAuth: true,
          testCases: {
            success: {
              input: {},
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'array'
            }
          }
        },
        
        create: {
          method: 'POST',
          path: '/api/product',
          description: 'Création d\'un produit',
          requiresAuth: true,
          testCases: {
            success: {
              input: product,
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 201,
              expectedResponseType: 'object',
              saveVariables: {
                'productId': 'id'  // Sauvegarde l'ID du produit créé
              }
            }
          }
        },
        
        getOne: {
          method: 'GET',
          path: '/api/product/one',
          description: 'Récupération d\'un produit',
          requiresAuth: true,
          testCases: {
            success: {
              input: {},
              query: {
                id: '<product-id>'  // Utilise la variable sauvegardée
              },
              headers: {
                Authorization: 'Bearer <token>'
              },
              expectedStatus: 200,
              expectedResponseType: 'object'
            }
          }
        }
      }
    };
  }

  getEndpointData(category, endpoint) {
    if (this.data[category] && this.data[category][endpoint]) {
      return this.data[category][endpoint];
    }
    return null;
  }

  getTestCase(category, endpoint, testCase) {
    const endpointData = this.getEndpointData(category, endpoint);
    if (endpointData && endpointData.testCases && endpointData.testCases[testCase]) {
      return endpointData.testCases[testCase];
    }
    return null;
  }

  getFullURL(category, endpoint, params = {}) {
    const endpointData = this.getEndpointData(category, endpoint);
    if (endpointData) {
      let url = `${this.data.baseURL}${endpointData.path}`;
      
      if (params.pathParams) {
        Object.keys(params.pathParams).forEach(key => {
          url = url.replace(`:${key}`, params.pathParams[key]);
        });
      }
      
      if (params.query && Object.keys(params.query).length > 0) {
        const queryString = new URLSearchParams(params.query).toString();
        url += `?${queryString}`;
      }
      
      return url;
    }
    return null;
  }
}

const apiTestDataProduct = new APITestDataProduct();

module.exports = {
  apiTestDataProduct,
  APITestDataProduct,
  axios
};
```

### Enregistrement dans `dataManagers.js`

```javascript
const { apiTestDataProduct } = require('./ApiTestDataProduct.js');

const dataManagers = [
  apiTestDataUser,
  apiTestDataContract,
  apiTestDataProduct  // ← Nouveau gestionnaire
];
```

## Utilisation

Une fois enregistré, votre nouveau gestionnaire est automatiquement disponible :

```bash
# Tester toutes les catégories (inclut votre nouvelle catégorie)
node runLiveTest.js

# Tester uniquement votre catégorie
node runLiveTest.js product

# Tester un endpoint spécifique
node runLiveTest.js product create success

# Tester un cas de test spécifique
node runLiveTest.js product getOne success
```

## Placeholders disponibles

Le système de placeholders est **complètement dynamique**. Tous les placeholders au format `<nom-variable>` sont automatiquement détectés et remplacés par les valeurs de `savedVariables`.

**Exemples :**
- `<token>` → `savedVariables.token` (si vous avez sauvegardé `token`)
- `<authToken>` → `savedVariables.authToken` (si vous avez sauvegardé `authToken`)
- `<contractId>` → `savedVariables.contractId` (si vous avez sauvegardé `contractId`)
- `<productId>` → `savedVariables.productId` (si vous avez sauvegardé `productId`)
- `<userId>` → `savedVariables.userId` (si vous avez sauvegardé `userId`)

**Vous n'avez plus besoin de modifier `runLiveTest.js`** pour ajouter de nouveaux placeholders. Il suffit de sauvegarder une variable avec `saveVariables` et vous pouvez l'utiliser immédiatement comme placeholder.

**Format :** `<nom-de-la-variable>` (le nom doit correspondre exactement à la clé dans `saveVariables`)

## Avantages du système générique

1. ✅ **Aucune modification de `runLiveTest.js`** : Le fichier reste inchangé
2. ✅ **Découverte automatique** : Toutes les catégories et endpoints sont découverts automatiquement
3. ✅ **Extensible** : Ajoutez simplement un nouveau fichier et enregistrez-le
4. ✅ **Maintenable** : Chaque gestionnaire est indépendant
5. ✅ **Type-safe** : Structure claire et documentée

## Notes importantes

- ⚠️ **Ne modifiez jamais `runLiveTest.js`** : Il est conçu pour être générique
- ⚠️ **Tous les gestionnaires doivent avoir la même `baseURL`** : Utilisez `process.env.API_BASE_URL` ou la même valeur par défaut
- ⚠️ **Les noms de catégories doivent être uniques** : Évitez les doublons
- ✅ **Les méthodes sont optionnelles** : Si `getFullURL` n'est pas définie, le système utilisera une URL de base

## Résolution de problèmes

### Mon gestionnaire n'apparaît pas

1. Vérifiez que vous l'avez bien enregistré dans `dataManagers.js`
2. Vérifiez que votre gestionnaire exporte bien une instance singleton
3. Vérifiez que `this.data` contient bien votre catégorie

### Les endpoints ne sont pas découverts

1. Vérifiez que `getEndpointData()` retourne bien les données
2. Vérifiez que la structure de `this.data` est correcte
3. Vérifiez que les noms de catégories et endpoints sont corrects

### Les placeholders ne sont pas remplacés

1. Vérifiez que vous avez bien sauvegardé la variable avec `saveVariables`
2. Vérifiez que le nom du placeholder correspond au nom de la variable sauvegardée
3. Vérifiez que la variable a bien été sauvegardée avant son utilisation

