angular
	.module('your_app_name.services')
	.factory('BackgroundGeolocationService', ['$localstorage', 'GN7_API_URL', '$cordovaNativeStorage', '$ionicPopup', '$http', function ($localstorage, GN7_API_URL, $cordovaNativeStorage, $ionicPopup, $http) {

		var runConfig = function () {
			$cordovaNativeStorage.getItem('user').then(function (user) {
				BackgroundGeolocation.configure({
					locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
					desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
					stationaryRadius: 25,
					distanceFilter: 10,
					debug: true,
					interval: 10000,
					fastestInterval: 5000,
					activitiesInterval: 10000,
					stopOnTerminate: false,
					url: GN7_API_URL + 'conductor/actualizarposicion/' + user.usuario.idconductor,
					httpHeaders: {
						'Content-Type': 'application/json',
						'Authorization': user.token,
					},
					postTemplate: {
						latitud: '@latitude',
						longitud: '@longitude'
					}
				}, callbackFn, failureFn);
			});
		};

		var start = function () {
			runConfig();
			BackgroundGeolocation.start();

			setTimeout(() => {
				BackgroundGeolocation.checkStatus(function (status) {
					console.log(`[INFO] BackgroundGeolocation service is running: `, status.isRunning);
					console.log(`[INFO] BackgroundGeolocation services enabled: `, status.locationServicesEnabled);
					console.log(`[INFO] BackgroundGeolocation auth status: `, status.authorization);
				});
			}, 1000);
		};

		var stop = function () {
			BackgroundGeolocation.stop();
		};

		var setIdEnvioForTracking = function (idEnvio) {
			BackgroundGeolocation.configure({
				postTemplate: {
					latitud: '@latitude',
					longitud: '@longitude',
					idenvio: idEnvio
				}
			});
		};

		var deleteIdEnvioForTracking = function () {
			BackgroundGeolocation.configure({
				postTemplate: {
					latitud: '@latitude',
					longitud: '@longitude'
				}
			});
		};

		var callbackFn = function (location) {
			console.log('[INFO] BackgroundGeolocation configure has been successful', location);
		};

		var failureFn = function (error) {
			$ionicPopup.alert({
				template: '[js] BackgroundGeoLocation error ' + JSON.stringify(error)
			});
		};

		var listenEvents = function() {
			BackgroundGeolocation.on('location', function (location) {
				console.log(`[INFO] BackgroundGeolocation location: `, location);
			});

			BackgroundGeolocation.on('stationary', function (stationaryLocation) {
				console.log('[INFO] handle stationary locations here: ', stationaryLocation);
			});

			BackgroundGeolocation.on('error', function (error) {
				console.log(`[ERROR] BackgroundGeolocation error: ${error.code, error.message}`);
			});

			BackgroundGeolocation.on('start', function () {
				console.log('[INFO] BackgroundGeolocation service has been started');
			});

			BackgroundGeolocation.on('stop', function () {
				console.log('[INFO] BackgroundGeolocation service has been stopped');
			});
		}

		return {
			start: start,
			stop: stop,
			listenEvents: listenEvents,
			setIdEnvioForTracking: setIdEnvioForTracking,
			deleteIdEnvioForTracking: deleteIdEnvioForTracking
		}
	}])