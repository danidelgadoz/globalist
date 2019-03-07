angular
    .module('your_app_name.controllers')
    .controller('TestsCtrl', function ($localstorage, $ionicPopup, GeoService, BackgroundGeolocationService, $cordovaGeolocation, $ionicLoading, GN7_API_URL, $http, $state, $cordovaNativeStorage, $scope, OneSignalService) {
		console.log('TestsCtrl...');
		cordova.plugins.diagnostic.isLocationAvailable(function (available) {
			console.log("Location is " + (available ? "available" : "not available"));
			if (!available) {
				$ionicPopup.alert({
					template: "Debe activar la geolocalizacion"
				});
			} else {
				$cordovaNativeStorage.getItem('aceptado').then(function (aceptado) {
					$state.go('app.envios');
				}, function (error) {
				});
			}
		}, function (error) {
			console.error("The following error occurred: " + error);
		});

		$cordovaNativeStorage.getItem('user').then(function (user) {
			$scope.user = user;
			$http.get(GN7_API_URL + 'conductor/' + $scope.user.usuario.idconductor).then(function (data) {
				console.log(data);
				$scope.conductor = data.data.data;
				$http.get(GN7_API_URL + 'conductor/envioasignado/' + $scope.user.usuario.idconductor).then(function (datos) {
					if (datos.data.data !== null) {
						$state.go('app.envios');
					}
				}).catch(function (e) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: JSON.stringify(e)
					});
				});
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
		}, function (error) {
			$cordovaNativeStorage.getItem('terminos').then(function (user) {
				$state.go('auth.login');
			}, function (error) {
				$state.go('auth.walkthrough');
			});
		});

		OneSignalService.handleNotificationCatcher(function (jsonData) {
			console.log('Notification', jsonData);
			if (jsonData.notification) {
				$state.go('app.solicitud');
				return;
			}
			var notification = jsonData.notification ? jsonData.notification.payload : jsonData.payload;

			var alertPopup = $ionicPopup.alert({
				title: notification.title,
				template: notification.body
			});
			alertPopup.then(function (res) {
				$state.go('app.solicitud');
			});
		});

		$scope.disponible = function () {
			$ionicLoading.show({
				template: 'Registrando device...',
			});
			BackgroundGeolocationService.start();

			var request = $http({
				method: "put",
				url: GN7_API_URL + 'conductor/' + $scope.user.usuario.idconductor,
				data: { estado: 'DISPONIBLE' }
			});
			request.then(function (data) {
				if (data.data.status) {
					$http.get(GN7_API_URL + 'vehiculo/conductor/' + $scope.user.usuario.idconductor).then(function (data) {
						if (data.data.status && data.data.data != null) {
							var idvehiculo = data.data.data.idvehiculo;
							var request = $http({
								method: "put",
								url: GN7_API_URL + 'vehiculo/' + idvehiculo,
								data: { estado: 'DISPONIBLE' }
							});
							request.then(function (data) {
								if (data.data.status) {
									$http.get(GN7_API_URL + 'conductor/' + $scope.user.usuario.idconductor).then(function (data) {
										$scope.conductor = data.data.data;
									}).catch(function (e) {
										$ionicLoading.hide();
										$ionicPopup.alert({
											template: JSON.stringify(e)
										});
									});
								} else {
									$ionicPopup.alert({
										template: 'No se pudo cambiar el estado del vehiculo a disponible'
									});
								}
								$ionicLoading.hide();
							}).catch(function (e) {
								$ionicLoading.hide();
								$ionicPopup.alert({
									template: JSON.stringify(e)
								});
							});
						} else {
							$ionicPopup.alert({
								template: 'No se pudo obtener el vehiculo'
							});
						}						
					}).catch(function (e) {
						$ionicLoading.hide();
						$ionicPopup.alert({
							template: JSON.stringify(e)
						});
					});
				} else {
					$ionicPopup.alert({
						template: 'No se pudo cambiar el estado del conductor a disponible'
					});
				}
				$ionicLoading.hide();
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
		}
		$scope.ofertas = function () {
			$state.go('app.solicitud');
		}
		$scope.nodisponible = function () {
			var request = $http({
				method: "put",
				url: GN7_API_URL + 'conductor/' + $scope.user.usuario.idconductor,
				data: { estado: 'NO DISPONIBLE' }
			});
			request.then(function (data) {
				if (data.data.status) {
					$http.get(GN7_API_URL + 'vehiculo/conductor/' + $scope.user.usuario.idconductor).then(function (data) {
						if (data.data.status && data.data.data != null) {
							var idvehiculo = data.data.data.idvehiculo;
							var request = $http({
								method: "put",
								url: GN7_API_URL + 'vehiculo/' + idvehiculo,
								data: { estado: 'NO DISPONIBLE' }
							});
							console.log(data);
							console.log(idvehiculo);
							request.then(function (data) {
								if (data.data.status) {
									BackgroundGeolocationService.stop();
									$http.get(GN7_API_URL + 'conductor/' + $scope.user.usuario.idconductor).then(function (data) {
										$scope.conductor = data.data.data;
										/*$ionicPopup.alert({
											template: 'Estado cambiado a no disponible'
										  });*/
									}).catch(function (e) {
										$ionicLoading.hide();
										$ionicPopup.alert({
											template: JSON.stringify(e)
										});
									});
								} else {
									$ionicPopup.alert({
										template: 'No se pudo cambiar el estado del vehiculo a no disponible'
									});
								}
								$ionicLoading.hide();
							}).catch(function (e) {
								$ionicLoading.hide();
								$ionicPopup.alert({
									template: JSON.stringify(e)
								});
							});
						} else {
							$ionicPopup.alert({
								template: 'No se pudo obtener el vehiculo'
							});
						}
					}).catch(function (e) {
						$ionicLoading.hide();
						$ionicPopup.alert({
							template: JSON.stringify(e)
						});
					});
				} else {
					$ionicPopup.alert({
						template: 'No se pudo cambiar el estado del conductor a no disponible'
					});
				}
				$ionicLoading.hide();
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
			//GeoService.stop();
			console.log('no disponible');
		}
	})