# Guide : Système de Sauvegarde de Variables

## Vue d'ensemble

Le système de sauvegarde de variables a été refactorisé pour être **déclaratif** et **dynamique**. Au lieu de définir la logique de sauvegarde dans `runLiveTest.js`, vous pouvez maintenant déclarer directement dans les test cases quelles variables doivent être sauvegardées.

## Comment ça fonctionne

### 1. Déclaration dans les test cases

Ajoutez la propriété `saveVariables` dans vos test cases pour indiquer quelles variables doivent être sauvegardées :

```javascript
success: {
  input: loginUser,
  expectedStatus: 200,
  expectedResponseType: 'object',
  expectedResponseStructure: authResponseStructure,
  saveVariables: {
    'authToken': 'token' // Sauvegarde response.data.token dans savedVariables.authToken
  }
}
```

### 2. Structure de `saveVariables`

`saveVariables` est un objet où :
- **Clé** : Le nom de la variable à sauvegarder dans `savedVariables`
- **Valeur** : Le chemin vers la valeur dans `response.data`

Exemples :
- `'token'` → `response.data.token`
- `'id'` → `response.data.id`
- `'user.id'` → `response.data.user.id` (chemins imbriqués supportés)

### 3. Stockage dynamique

Toutes les variables sont stockées dans `this.savedVariables` (objet dynamique) au lieu de propriétés individuelles :

```javascript
// Avant (propriétés individuelles)
this.authToken = '...';
this.secondAuthToken = '...';
this.createdContractId = 123;

// Maintenant (objet dynamique)
this.savedVariables = {
  authToken: '...',
  secondAuthToken: '...',
  createdContractId: 123,
  syncContractId: 456
};
```

## Cas d'usage

### Exemple 1 : Sauvegarder un token JWT

```javascript
// Dans APITestDataUser.js
login: {
  testCases: {
    success: {
      input: loginUser,
      expectedStatus: 200,
      saveVariables: {
        'authToken': 'token' // Sauvegarde automatiquement response.data.token
      }
    }
  }
}
```

### Exemple 2 : Sauvegarder l'ID d'un contrat créé

```javascript
// Dans ApiTestDataContract.js
create: {
  testCases: {
    success: {
      input: completeContract,
      expectedStatus: 201,
      saveVariables: {
        'contractId': 'id' // Sauvegarde response.data.id
        // Note: La logique pour createdContractId vs syncContractId est gérée automatiquement
      }
    }
  }
}
```

### Exemple 3 : Sauvegarder plusieurs variables

```javascript
success: {
  input: someData,
  expectedStatus: 200,
  saveVariables: {
    'authToken': 'token',
    'userId': 'user.id',
    'sessionId': 'session.id'
  }
}
```

## Cas spéciaux

### `contractId` - Gestion automatique

Pour `contractId`, le système gère automatiquement la distinction entre `createdContractId` et `syncContractId` :

- Si `createdContractId` n'existe pas → sauvegarde dans `createdContractId`
- Si `createdContractId` existe déjà → sauvegarde dans `syncContractId`

Cette logique est gérée dans `saveVariablesFromResponse()`.

## Utilisation des variables sauvegardées

### Dans les placeholders

Les variables sauvegardées peuvent être utilisées dans les placeholders au format `<nom-variable>` :

**Système dynamique** : Tous les placeholders au format `<nom-variable>` sont automatiquement détectés et remplacés. Vous n'avez plus besoin de modifier `runLiveTest.js` pour ajouter de nouveaux placeholders.

**Exemples :**
- Si vous sauvegardez `authToken`, vous pouvez utiliser `<authToken>`
- Si vous sauvegardez `contractId`, vous pouvez utiliser `<contractId>`
- Si vous sauvegardez `productId`, vous pouvez utiliser `<productId>`

Le nom du placeholder doit correspondre exactement au nom de la variable dans `saveVariables`.

### Exemple d'utilisation

```javascript
// Dans un test case
update: {
  testCases: {
    success: {
      input: {
        id: '<contract-id>', // Sera remplacé par savedVariables.createdContractId
        name: 'Updated Name'
      },
      headers: {
        Authorization: 'Bearer <token>' // Sera remplacé par savedVariables.authToken
      },
      expectedStatus: 200
    }
  }
}
```

## Méthodes disponibles

### `saveVariablesFromResponse(testCase, responseData)`

Sauvegarde automatiquement les variables définies dans `testCase.saveVariables` depuis `responseData`.

**Paramètres :**
- `testCase` : Le cas de test avec la propriété `saveVariables`
- `responseData` : Les données de la réponse (`response.data`)

**Utilisation :** Appelée automatiquement après chaque requête réussie.

### `replacePlaceholders(str)`

Remplace les placeholders dans une chaîne par les valeurs sauvegardées.

**Retourne :** La chaîne avec les placeholders remplacés, ou `null` si un placeholder requis est manquant.

### `replacePlaceholdersInObject(obj)`

Remplace les placeholders dans un objet (récursif pour les objets et tableaux).

**Retourne :** L'objet avec les placeholders remplacés, ou `null` si un placeholder requis est manquant.

## Avantages du nouveau système

1. ✅ **Déclaratif** : La logique de sauvegarde est définie directement dans les test cases
2. ✅ **Flexible** : Facile d'ajouter de nouvelles variables à sauvegarder
3. ✅ **Dynamique** : Pas besoin de modifier `runLiveTest.js` pour ajouter de nouvelles variables
4. ✅ **Maintenable** : Toute la configuration est centralisée dans les fichiers de données de test
5. ✅ **Extensible** : Support des chemins imbriqués (`user.id`, `data.token`, etc.)

## Migration depuis l'ancien système

Si vous avez des test cases existants, ajoutez simplement la propriété `saveVariables` :

```javascript
// Avant
success: {
  input: loginUser,
  expectedStatus: 200
  // La sauvegarde était hardcodée dans runLiveTest.js
}

// Maintenant
success: {
  input: loginUser,
  expectedStatus: 200,
  saveVariables: {
    'authToken': 'token'
  }
}
```

## Notes importantes

- Les variables ne sont sauvegardées que si le test réussit (statut HTTP correspond à `expectedStatus`)
- Les variables sont sauvegardées même si le statut est une erreur HTTP attendue (ex: 400, 401, etc.)
- Si un placeholder est utilisé mais la variable n'est pas disponible, le test sera ignoré avec un avertissement
- Les chemins imbriqués sont supportés (ex: `'user.profile.id'`)
- **Le système de placeholders est complètement dynamique** : vous n'avez plus besoin de modifier `runLiveTest.js` pour ajouter de nouveaux placeholders. Il suffit de sauvegarder une variable et l'utiliser comme `<nom-variable>`

