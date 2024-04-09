(function(ext) {
    // Dictionnaire des connexions et du temps de connexion
    var connections = {};
    var connectionTimes = {};
    
    // Fonction pour connecter une adresse IP à un nom d'utilisateur
    ext.connect = function(ip, username) {
        connections[ip] = username;
        connectionTimes[ip] = 0;
    };
    
    // Fonction pour supprimer une connexion
    ext.disconnect = function(ip) {
        delete connections[ip];
        delete connectionTimes[ip];
    };
    
    // Fonction pour renvoyer la valeur d'une connexion
    ext.getConnectionValue = function(ip) {
        if (ip in connections) {
            return connections[ip];
        } else {
            return "UNDEFINED";
        }
    };
    
    // Fonction pour compter le nombre de connexions
    ext.countConnections = function() {
        return Object.keys(connections).length;
    };
    
    // Fonction pour lire la valeur d'une connexion
    ext.readConnectionValue = function(ip) {
        if (ip in connections) {
            return connections[ip];
        } else {
            return "UNDEFINED";
        }
    };
    
    // Fonction pour lire le temps de connexion d'une adresse IP
    ext.getConnectionTime = function(ip) {
        return connectionTimes[ip];
    };
    
    // Fonction pour remettre le temps de connexion à 0
    ext.resetConnectionTime = function(ip) {
        connectionTimes[ip] = 0;
    };
    
    // Fonction pour mettre à jour le temps de connexion
    setInterval(function() {
        for (var ip in connections) {
            connectionTimes[ip]++;
        }
    }, 60000);
    
    // Blocs Scratch correspondants
    var descriptor = {
        blocks: [
            [' ', 'connecter %s avec nom d\'utilisateur %s', 'connect', '192.168.1.1', 'utilisateur'],
            [' ', 'supprimer la connexion %s', 'disconnect', '192.168.1.1'],
            ['r', 'valeur de la connexion %s', 'getConnectionValue', '192.168.1.1'],
            ['r', 'nombre de connexions', 'countConnections', , 'green'],
            ['r', 'lire la valeur de la connexion %s', 'readConnectionValue', '192.168.1.1'],
            ['r', 'temps de connexion de %s (en minutes)', 'getConnectionTime', '192.168.1.1'],
            [' ', 'remettre le temps de connexion de %s à 0', 'resetConnectionTime', '192.168.1.1']
        ],
        menus: {}
    };
    
    // Enregistrer l'extension
    ScratchExtensions.register('Connexions', descriptor, ext);
})({});