// Ionic Starter App

angular.module('underscore', [])
  .factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
  });

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('your_app_name', [
  'ionic', 'ionic.service.core',
  //'angularMoment',
  'your_app_name.controllers',
  'your_app_name.directives',
  'your_app_name.filters',
  'your_app_name.services',
  'your_app_name.factories',
  'your_app_name.config',
  'your_app_name.views',
  'underscore',
  //'ngMap',
  'ngResource',
  'ngMaterial',
  'ngCordova',
  'slugifier',
  //'firebase'
  //'ionic.contrib.ui.tinderCards',
  //'youtube-embed'
])

  .run(function (GeoService, GN7_API_URL, $http, $cordovaNativeStorage, $ionicPopup, $cordovaGeolocation, BackgroundGeolocationService, $ionicPlatform, PushNotificationsService, $rootScope, $ionicConfig, $timeout, $state) {
    window.onunload = function () {
      console.log('stop app');
    }
    $cordovaNativeStorage.getItem('user').then(function (user) {
			$http.defaults.headers.common.Authorization = user.token;
		});
    $cordovaNativeStorage.getItem('terminos').then(function (user) {
      $state.go('auth.login');
    }, function (error) {
      $state.go('auth.walkthrough');
    });
    $ionicPlatform.registerBackButtonAction(function (event) {
      if ($state.current.name == "app.tests" || $state.current.name == "auth.login" || $state.current.name == "auth.walkthrough") {
        navigator.app.exitApp();
      }
      else {
        navigator.app.backHistory();
      }
    }, 100);
    $ionicPlatform.on("deviceready", function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (Keyboard) {
        Keyboard.hideFormAccessoryBar(true);

        window.addEventListener('keyboardWillShow', function () {
          document.body.classList.add('keyboard-open');
        });
      }
      if (window.StatusBar) {
        // StatusBar.styleDefault(); // gives statusBar grey color
      }
      if (window.plugins.insomnia) {
        window.plugins.insomnia.keepAwake();
      }
    });

    $ionicPlatform.ready(function () {
      $cordovaNativeStorage.getItem('user').then(function (user) {
        console.log('user already subscribed at onesignal...', user);
        
      }, function (error) {
        console.log('subscribing user at onesignal...');
        window.plugins.OneSignal
          .startInit("68a5be17-6a78-4339-967e-826350a47298")
          .endInit();
      });

      BackgroundGeolocationService.listenEvents();
      
    });

    // This fixes transitions for transparent background views
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
      if (toState.name.indexOf('auth.walkthrough') > -1) {
        // set transitions to android to avoid weird visual effect in the walkthrough transitions
        $timeout(function () {
          $ionicConfig.views.transition('android');
          $ionicConfig.views.swipeBackEnabled(false);
          console.log("setting transition to android and disabling swipe back");
        }, 0);
      }
    });
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      if (toState.name.indexOf('app.feeds-categories') > -1) {
        // Restore platform default transition. We are just hardcoding android transitions to auth views.
        $ionicConfig.views.transition('platform');
        // If it's ios, then enable swipe back again
        if (ionic.Platform.isIOS()) {
          $ionicConfig.views.swipeBackEnabled(true);
        }
        console.log("enabling swipe back and restoring transition to platform default", $ionicConfig.views.transition());
      }
    });

    $ionicPlatform.on("resume", function () {
      //PushNotificationsService.register();
    });
    $ionicPlatform.on("pause", function () {
      console.log('pause app');
    });

  })


  .config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('green', {
        'default': '600', // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': '900' // use shade A100 for the <code>md-hue-3</code> class
      })
      .accentPalette('red', {
        'hue-3': '800'
      })
      .warnPalette('red', {
        'hue-3': '700'
      });

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyAP2XqsQ3zgtZsH6jrBHK2cg-eavZCp4fA",
      authDomain: "gn7app.firebaseapp.com",
      databaseURL: "https://gn7app.firebaseio.com",
      storageBucket: "gn7app.appspot.com",
    };
    //firebase.initializeApp(config);  
    $stateProvider

      //INTRO
      .state('auth', {
        url: "/auth",
        templateUrl: "views/auth/auth.html",
        abstract: true,
        cache: false,
        controller: 'AuthCtrl'
      })

      .state('auth.walkthrough', {
        url: '/walkthrough',
        cache: false,
        templateUrl: "views/auth/walkthrough.html",
        controller: 'WalkCtrl'
      })

      .state('auth.login', {
        url: '/login',
        cache: false,
        templateUrl: "views/auth/login.html",
        controller: 'LoginCtrl'
      })

      .state('app', {
        url: "/app",
        abstract: true,
        cache: false,
        templateUrl: "views/app/side-menu.html",
        controller: 'AppCtrl'
      })

      .state('app.tests', {
        url: "/tests",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/tests.html",
            controller: 'TestsCtrl'
          }
        }
      })

      .state('app.test', {
        url: "/test/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/test.html",
            controller: 'TestCtrl'
          }
        }
      })

      .state('app.envios', {
        url: "/envios",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/envios.html",
            controller: 'EnviosCtrl'
          }
        }
      })

      .state('app.solicitud', {
        url: "/solicitud",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/solicitud.html",
            controller: 'SolicitudCtrl'
          }
        }
      })

      .state('app.vacio', {
        url: "/vacio",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/vacio.html",
            controller: 'VacioCtrl'
          }
        }
      })

      .state('app.estado', {
        url: "/estado/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/estado.html",
            controller: 'EstadoCtrl'
          }
        }
      })

      .state('app.carga', {
        url: "/carga/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/carga.html",
            controller: 'CargaCtrl'
          }
        }
      })

      .state('app.descarga', {
        url: "/descarga/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/descarga.html",
            controller: 'DescargaCtrl'
          }
        }
      })

      .state('app.productos', {
        url: "/productos/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/productos.html",
            controller: 'ProductosCtrl'
          }
        }
      })

      .state('app.incidente', {
        url: "/incidente",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/incidente.html",
            controller: 'IncidenteCtrl'
          }
        }
      })

      .state('app.guias', {
        url: "/guias",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/guias.html",
            controller: 'GuiasCtrl'
          }
        }
      })

      .state('app.viaje', {
        url: "/viaje",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/viaje.html",
            controller: 'ViajeCtrl'
          }
        }
      })

      .state('app.faltantes', {
        url: "/faltantes/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/faltantes.html",
            controller: 'FaltantesCtrl'
          }
        }
      })

      .state('app.rechazados', {
        url: "/rechazados/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/rechazados.html",
            controller: 'RechazadosCtrl'
          }
        }
      })

      .state('app.firma', {
        url: "/firma/:idpedido/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/firma.html",
            controller: 'FirmaCtrl'
          }
        }
      })

      .state('app.map', {
        url: "/map/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/map.html",
            controller: 'MapCtrl'
          }
        }
      })

      .state('app.producto', {
        url: "/producto/:id",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "views/app/producto.html",
            controller: 'ProductoCtrl'
          }
        }
      })
      ;

    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/auth/walkthrough');
  });
