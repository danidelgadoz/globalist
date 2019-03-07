angular
    .module('your_app_name.services')
    .factory('BackgroundGeolocationService', ['$localstorage', 'GN7_API_URL', '$cordovaNativeStorage', '$ionicPopup', '$q', '$http', function ($localstorage, GN7_API_URL, $cordovaNativeStorage, $ionicPopup, $q, $http) {
		var callbackFn = function (location) {
			$cordovaNativeStorage.getItem('user').then(function (user) {
				console.log(user);
				var envio = $localstorage.get('bgenvio');
				var datos = {
					idenvio: envio,
					latitud: location.latitude,
					longitud: location.longitude
				}
				var request = $http({
					method: "post",
					url: GN7_API_URL + 'conductor/actualizarposicion/' + user.usuario.idconductor,
					data: datos
				});
				request.success(function (data) {
					console.log(datos);
					console.log(data);
				}).error(function (err) {
					console.log('error bg');
				});
				console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
			}, function (error) {
			});
		},

		failureFn = function (error) {
			$ionicPopup.alert({
				template: 'BackgroundGeoLocation error ' + JSON.stringify(error)
			});
		},

		//Enable background geolocation
		start = function () {
			//save settings (background tracking is enabled) in local storage
			window.localStorage.setItem('bgGPS', 1);
			BackgroundGeolocation.configure({
				desiredAccuracy: 0,//10,
				stationaryRadius: 25,//20,
				distanceFilter: 10,//20,
				locationProvider: 0,
				debug: false,
				interval: 60000,
				stopOnTerminate: false
			}, callbackFn, failureFn);
			BackgroundGeolocation.start();
		};

		return {
			start: start,

			// Initialize service and enable background geolocation by default
			init: function () {
				var bgGPS = window.localStorage.getItem('bgGPS');
				if (bgGPS == 1 || bgGPS == null) {
					start();
				}
			},

			// Stop data tracking
			stop: function () {
				window.localStorage.setItem('bgGPS', 0);
				BackgroundGeolocation.stop();
			}
		}
	}])