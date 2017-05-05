// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var app = angular.module('FoodTruck', ['ionic', 'ionic.cloud', 'firebase', 'ngCordova']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider, $ionicCloudProvider) {
  
  $ionicCloudProvider.init({
    "core": {
      "app_id": "62f1044f"
    }
  });

  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('registro', {
    cache: false,
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: "RegistroCtrl"
  })

  .state('cliente', {
    url: '/cliente',
    abstract: true,
    templateUrl: 'templates/cliente/home.html',
    controller: 'ClienteCtrl'
  })

  .state('cliente.localizar', {
      url: '/clienteLocalizar',
      views: {
        'menuContent': {
          templateUrl: 'templates/cliente/localizar.html',
          controller: 'LocalizarCtrl'
        }
      },
  })

  .state('cliente.perfil', {
      url: '/clientePerfil',
      views: {
        'menuContent': {
          templateUrl: 'templates/cliente/perfil.html',
          controller: 'PerfilCtrl'
        }
      }
  })

  .state('mapa', {
    url: '/mapa?:lat&:long',
    templateUrl: 'templates/cliente/mapa.html',
    controller: "MapaCtrl"
  })

  .state('truck', {
    url: '/truck',
    abstract: true,
    templateUrl: 'templates/truck/home.html',
    controller: 'TruckCtrl'
  })

  .state('truck.perfil', {
      url: '/truckPerfil',
      views: {
        'menuContent': {
          templateUrl: 'templates/truck/perfil.html',
          controller: 'PerfilTruckCtrl'
        }
      },
  })

  .state('truck.home', {
      url: '/truckHome',
      views: {
        'menuContent': {
          templateUrl: 'templates/truck/truck.html',
        }
      },
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
