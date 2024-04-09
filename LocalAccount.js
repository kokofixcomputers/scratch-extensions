(function(ext) {
  // Variables pour stocker les informations de compte de chaque utilisateur
  var users = [];

  // Bloc pour créer un compte avec nom d'utilisateur et mot de passe ainsi qu'un string
  ext.createAccount = function(username, password, string) {
    var userExists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        userExists = true;
        break;
      }
    }
    if (!userExists) {
      var user = {
        username: username,
        password: password,
        string: string
      };
      users.push(user);
      return true;
    } else {
      return false;
    }
  };

  // Bloc pour se connecter avec nom d'utilisateur et mot de passe
  ext.login = function(username, password) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username && users[i].password === password) {
        return true;
      }
    }
    return false;
  };

  // Bloc pour supprimer un utilisateur
  ext.deleteUser = function(username) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        users.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  // Bloc pour changer le string d'un utilisateur
  ext.changeString = function(username, newString) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        users[i].string = newString;
        return true;
      }
    }
    return false;
  };

  // Bloc pour renvoyer le string d'un utilisateur
  ext.getString = function(username) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        return users[i].string;
      }
    }
    return "";
  };

  // Bloc pour vérifier si un utilisateur existe
  ext.userExists = function(username) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        return true;
      }
    }
    return false;
  };

  // Bloc pour exporter les données des comptes
  ext.exportData = function() {
    var data = JSON.stringify(users);
    return data;
  };

  // Bloc pour importer les données des comptes
  ext.importData = function(data) {
    try {
      var parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        users = parsedData;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  // Blocs de définition pour les blocs personnalisés
  var descriptor = {
    blocks: [
      ['b', 'create account with username %s and password %s and string %s', 'createAccount', '', '', ''],
      ['b', 'login with username %s and password %s', 'login', '', ''],
      ['b', 'delete user with username %s', 'deleteUser', ''],
      ['b', 'change string for user with username %s to %s', 'changeString', '', ''],
      ['r', 'get string for user with username %s', 'getString', ''],
      ['b', 'user with username %s exists', 'userExists', ''],
      ['r', 'export account data', 'exportData'],
      ['b', 'import account data %s', 'importData', '']
    ]
  };

  // Enregistrer l'extension
  ScratchExtensions.register('Local Accounts', descriptor, ext);
})({});