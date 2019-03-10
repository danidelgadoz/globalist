angular
    .module('your_app_name.controllers')
    .controller('CargaCtrl', function ($q, $ionicPopup, $localstorage, $stateParams, BackgroundGeolocationService, $cordovaGeolocation, $ionicLoading, GN7_API_URL, $http, $state, $cordovaNativeStorage, $scope) {
		var id = $stateParams.id;
		$scope.id = $stateParams.id;
		var envio = {};
		$scope.form = {};
		$cordovaNativeStorage.getItem('user').then(function (user) {
			$scope.user = user;
			function provincias() {
				return $http.get(GN7_API_URL + 'conductor/envioasignado/' + user.usuario.idconductor);
			}
			function distritos() {
				return $http.get(GN7_API_URL + 'estado_pedido_detalle/PUNTO DE CARGA');
			}
			$ionicLoading.show();

			$q.all([,
				provincias()
				//,distritos()
			]).then(function (data) {
				envio = data[1].data.data;
				//$scope.opciones = data[2].data.data;
				$ionicLoading.show({
					template: 'Cargando...',
				});
				$http.get(GN7_API_URL + 'estado_pedido_detalle/PUNTO DE CARGA/' + envio.pedido_detalles[id].idpedido).then(function (data) {
					$ionicLoading.hide();
					$scope.opciones = data.data.data;
					var idestado_pedido_detalle = 0;
					//if(envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0].estado_pedido_detalle!=null)
					if (envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0] != undefined)
						idestado_pedido_detalle = envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0].estado_pedido_detalle.idestado_pedido_detalle;
					else
						idestado_pedido_detalle = $scope.opciones[0].idestado_pedido_detalle - 1;
					$scope.form.idestado_pedido_detalle = idestado_pedido_detalle;
					$scope.form.enable = idestado_pedido_detalle + 1;
				}).catch(function (e) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: JSON.stringify(e)
					});
				});
				$ionicLoading.hide();
			}, function () {
				$ionicLoading.show({
					template: 'No se pudo cargar los datos.',
					duration: 3000
				});
			});

		}, function (error) {
			$cordovaNativeStorage.getItem('terminos').then(function (user) {
				$state.go('auth.login');
			}, function (error) {
				$state.go('auth.walkthrough');
			});
		});

		$scope.guardar = function () {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var seconds = today.getSeconds();
			var minutes = today.getMinutes();
			var hour = today.getHours();
			if (dd < 10) {
				dd = '0' + dd
			}
			if (mm < 10) {
				mm = '0' + mm
			}
			if (hour < 10) {
				hour = '0' + hour
			}
			if (minutes < 10) {
				minutes = '0' + minutes
			}
			if (seconds < 10) {
				seconds = '0' + seconds
			}
			today = yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + minutes + ':' + seconds;
			$scope.form.idpedido_detalle = envio.pedido_detalles[id].idpedido_detalle;
			$scope.form.fecha = today;
			$ionicLoading.show({
				//template: 'Cargando Envío...',
			});
			var request = $http({
				method: "post",
				url: GN7_API_URL + 'pedido_detalle_estado_pedido_detalle',
				data: $scope.form
			});
			request.then(function (data) {
				$ionicLoading.hide();
				if (data.data.status) {
					$state.go('app.envios');
				}
				else
					$ionicPopup.alert({
						template: "No se pudo guardar"
					});
			}).catch(function (e) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: JSON.stringify(e)
				});
			});
		}
		$scope.cancelar = function () {
			$state.go('app.estado', { id: id });
		}
	})