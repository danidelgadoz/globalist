angular
    .module('your_app_name.controllers')
    .controller('EnviosCtrl', function (BackgroundGeolocationService, GeoService, $cordovaLaunchNavigator, $localstorage, $rootScope, $interval, $cordovaNativeStorage, $ionicPopup, GN7_API_URL, $http, $ionicLoading, $scope, $state, $filter) {
		cordova.plugins.diagnostic.isLocationAvailable(function (available) {
			console.log("Location is " + (available ? "available" : "not available"));
			if (!available) {
				$ionicPopup.alert({
					template: "Debe activar la geolocalizacion"
				});
				$state.go('app.tests');
			}
		}, function (error) {
			console.error("The following error occurred: " + error);
		});

		var estado1 = '';
		var idvehiculo = 0;
		var envio = {};
		var idofertaenvio = $localstorage.get('idofertaenvio');

		$cordovaNativeStorage.getItem('user').then(function (user) {
			$scope.data = {};
			$scope.user = user;
			$ionicLoading.show({
				template: 'Buscando Pedido...',
			});
			var request = $http({
				method: "get",
				url: GN7_API_URL + 'conductor/envioasignado/' + user.usuario.idconductor
			});
			request.then(function (data) {
				$scope.envio = data.data.data;
				if (data.data.data !== null && data.data.data.estado !== 'CANCELADO') {
					$cordovaNativeStorage.setItem('aceptado', data.data.data.idenvio).
						then(function (value) {
							envio = data.data.data;
							if (envio.estado == 'ESPERA') {
								$scope.data.aceptado = false;
							}
							else {
								$scope.data.aceptado = true;
							}
							if (envio.guias_entregadas != null)
								$scope.entre = true;
							else
								$scope.entre = false;
							$scope.estado_viaje = '';
							if (envio.estado_viaje_retorno)
								$scope.estado_viaje = '- Retorno';
							else if (envio.estado_viaje_ida)
								$scope.estado_viaje = '- Ida';
						}, function (error) { });
				} else {
					$cordovaNativeStorage.remove('aceptado').then(function (value) {
						var request = $http({
							method: "get",
							url: GN7_API_URL + 'oferta/obtenerofertas/' + user.usuario.idconductor
						});
						request.then(function (data) {
							if (data.data.data.rows.length > 0) {
								estado1 = data.data.data.rows[idofertaenvio].estado;
								$scope.envio = data.data.data.rows[idofertaenvio].ofertaenvio;
								envio = data.data.data.rows[idofertaenvio].ofertaenvio;
								idvehiculo = data.data.data.rows[idofertaenvio].idvehiculo;
								if (estado1 == 'ESPERA') {
									$scope.data.aceptado = false;
								}
								else {
									$scope.data.aceptado = true;
								}
								if (envio.guias_entregadas != null)
									$scope.entre = true;
								else
									$scope.entre = false;
								$scope.estado_viaje = '';
								if (envio.estado_viaje_retorno)
									$scope.estado_viaje = '- Retorno';
								else if (envio.estado_viaje_ida)
									$scope.estado_viaje = '- Ida';
							}
							$ionicLoading.hide();
						}).catch(function (e) {
							$ionicLoading.hide();
							$ionicPopup.alert({
								template: JSON.stringify(e)
							});
						});
					}, function (error) { });
				}
				$ionicLoading.hide();
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

		$scope.buscar = function () {
			var user = $scope.user;
			$ionicLoading.show({
				template: 'Buscando Pedido...',
			});
			$http.get(GN7_API_URL + 'conductor/envioasignado/' + user.usuario.idconductor).then(function (data) {
				var envio = {};
				$scope.envio = data.data.data;
				if (data.data.data !== null) {
					$cordovaNativeStorage.setItem('aceptado', data.data.data.idenvio).
						then(function (value) {
							envio = data.data.data;
							if (envio.estado == 'ESPERA')
								$scope.data.aceptado = false;
							else
								$scope.data.aceptado = true;
							if (envio.guias_entregadas != null)
								$scope.entre = true;
							else
								$scope.entre = false;
							$scope.estado_viaje = '';
							if (envio.estado_viaje_retorno)
								$scope.estado_viaje = '- Retorno';
							else if (envio.estado_viaje_ida)
								$scope.estado_viaje = '- Ida';
						}, function (error) { });
				} else {
					$cordovaNativeStorage.remove('aceptado').then(function (value) {
						var request = $http({
							method: "get",
							url: GN7_API_URL + 'oferta/obtenerofertas/' + user.usuario.idconductor
						});
						request.then(function (data) {
							if (data.data.data.rows.length > 0) {
								$state.go('app.solicitud');
							}
							$ionicLoading.hide();
						}).catch(function (e) {
							$ionicLoading.hide();
							$ionicPopup.alert({
								template: JSON.stringify(e)
							});
						});
					}, function (error) { });
				}
				$ionicLoading.hide();
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
		}
		$scope.test = function (id) {
			console.log(id);
			$state.go('app.test', { id: id });
		}
		$scope.incidente = function (id) {
			$state.go('app.incidente');
		}
		$scope.guias = function (id) {
			$state.go('app.guias');
		}
		$scope.viaje = function (id) {
			$state.go('app.viaje');
		}
		$scope.estado = function (id) {
			$state.go('app.estado', { id: id });
		}
		$scope.productos = function (id) {
			$state.go('app.productos', { id: id });
		}
		$scope.mapa = function (envio) {
			var lat1 = envio.punto_latitud_carga;
			var lon1 = envio.punto_longitud_carga;
			var lat2 = envio.punto_latitud_descarga;
			var lon2 = envio.punto_longitud_descarga;

			var start;
			var dest;

			if (lat1 && lon1 && lat2 && lon2) {
				start = { start: [lat1, lon1] };
				dest = [lat2, lon2];
			} else {
				start = { start: envio.direccion_carga };
				dest = envio.direccion_descarga;
			}

			$cordovaLaunchNavigator.navigate(dest, start).then(function () {
				console.log("Navigator launched");
			}, function (err) {
				console.log(err);
			});
		}
		$scope.showPopupAceptarOferta = function (_idenvio) {
			$scope.llegada = { date: new Date() };
			$scope.llegada.date.setSeconds(0);
			$scope.llegada.date.setMilliseconds(0);

			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<input type="date" ng-model="llegada.date">' +
					'<input type="time" ng-model="llegada.date" style="margin-top: 8px;">',
				title: 'Ingresar hora de llegada al lugar de recojo',
				subTitle: 'Trate de ser exacto',
				scope: $scope,
				buttons: [
					{ text: 'Cancelar' },
					{
						text: 'Aceptar',
						type: 'button-positive',
						onTap: function (e) {
							if (!$scope.llegada.date) {
								//don't allow the user to close unless he enters a valid date
								e.preventDefault();
							} else {
								return $scope.llegada.date;
							}
						}
					},
				]
			}).then(function (response) {
				if (response) {
					console.log('Pop response:', response);
					$scope.aceptar(_idenvio, $filter('date')(response, 'yyyy-MM-dd HH:mm:ss'));
				} else
					console.log("Cancelo aceptar oferta...");
			});
		};
		$scope.aceptar = function (idenvio, _fechaDemora) {
			$cordovaNativeStorage.setItem('aceptado', idenvio).then(function (value) {
				$ionicLoading.show({
					template: 'Aceptando...',
				});
				var datos = {
					idconductor: $scope.user.usuario.idconductor,
					idvehiculo: idvehiculo,
					idofertaenvio: idenvio,
					tiempo_demora: _fechaDemora
				};

				var request = $http({
					method: "post",
					url: GN7_API_URL + 'oferta/aceptar',
					data: datos
				});
				request.then(function (data) {
					console.log(data);
					$ionicLoading.hide();
					if (data.data.status) {
						var request = $http({
							method: "get",
							url: GN7_API_URL + 'conductor/envioasignado/' + $scope.user.usuario.idconductor
						});
						request.then(function (data) {
							$scope.envio = data.data.data;
							if (data.data.data !== null) {
								envio = data.data.data;
								$localstorage.set('bgenvio', envio.idenvio);
								BackgroundGeolocationService.setIdEnvioForTracking(envio.idenvio);
								//GeoService.start($scope.user.usuario.idconductor,envio.idenvio);
								if (envio.estado == 'ESPERA')
									$scope.data.aceptado = false;
								else
									$scope.data.aceptado = true;
								if (envio.guias_entregadas != null)
									$scope.entre = true;
								else
									$scope.entre = false;
								$scope.estado_viaje = '';
								if (envio.estado_viaje_retorno)
									$scope.estado_viaje = '- Retorno';
								else if (envio.estado_viaje_ida)
									$scope.estado_viaje = '- Ida';
							}
							$ionicLoading.hide();
						}).catch(function (e) {
							$ionicLoading.hide();
							$ionicPopup.alert({
								template: JSON.stringify(e)
							});
						});
					}
				}).catch(function (e) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: JSON.stringify(e)
					});
				});
			}, function (error) {

			});
		};
		$scope.rechazar = function (idenvio) {
			$ionicLoading.show({
				template: 'Aceptando...',
			});
			var datos = {
				idconductor: $scope.user.usuario.idconductor,
				idofertaenvio: idenvio
			}
			var request = $http({
				method: "post",
				url: GN7_API_URL + 'oferta/rechazar',
				data: datos
			});
			request.then(function (data) {
				console.log(datos);
				console.log(data);
				$ionicLoading.hide();
				if (data.data.status) {
					$state.go('app.solicitud');
				}
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
		};
		$scope.cancelarEnvio = function () {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Confirmar cancelacíon',
				template: '¿Desea cancelar el envío?',
				cancelText: 'Cancelar',
				okText: 'Aceptar'
			});
			confirmPopup.then(function (res) {
				if (res) {
					$ionicLoading.show();

					var request = $http({
						method: "get",
						url: GN7_API_URL + 'cancelar/picker/' + envio.idenvio
					}).success(function (data) {
						if (data.status) {
							$cordovaNativeStorage.remove('aceptado').then(function (value) {
								$localstorage.removeItem('bgenvio');
								$state.go('app.tests');
							}, function (error) { });
						} else {
							$ionicPopup.alert({ template: "No se pudo cancelar el envío" });
						}
						$ionicLoading.hide();
					}).error(function (err) {
						$ionicPopup.alert({ template: err.msg });
						$ionicLoading.hide();
					});
				}
			});
		};
	})