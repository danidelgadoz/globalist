angular
    .module('your_app_name.controllers')
    .controller('CargaCtrl', function ($q, $ionicPopup, myDateServ, $localstorage, $stateParams, BackgroundGeolocationService, $cordovaGeolocation, $ionicLoading, GN7_API_URL, $http, $state, $cordovaNativeStorage, $scope) {
		var id = $stateParams.id;
		$scope.id = $stateParams.id;
		var envio = {};
		$scope.form = {};
		$scope.requestStatusUpdatePending = false;

		$cordovaNativeStorage.getItem('user').then(function (user) {
			$scope.user = user;
			$ionicLoading.show();

			$http.get(GN7_API_URL + 'conductor/envioasignado/' + user.usuario.idconductor).then(function (response) {
				envio = response.data.data;
				$ionicLoading.show({
					template: 'Cargando...',
				});

				$http.get(GN7_API_URL + 'estado_pedido_detalle/PUNTO DE CARGA/' + envio.pedido_detalles[id].idpedido)
					.then(function (data) {
						$ionicLoading.hide();
						processEstadosRequest(data);

					}).catch(function (e) {
						$ionicLoading.hide();
						$ionicPopup.alert({
							template: 'Ups... hemos tenido un error'
						});
					});

			}).catch(function () {
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
			$scope.requestStatusUpdatePending = true;

			$scope.form.idpedido_detalle = envio.pedido_detalles[id].idpedido_detalle;
			$scope.form.fecha = myDateServ.dateFormat(new Date(), 'yyyy-mm-dd HH:mi:ss');
			$ionicLoading.show({ });
			var request = $http({
				method: "post",
				url: GN7_API_URL + 'pedido_detalle_estado_pedido_detalle',
				data: $scope.form
			});
			request.then(function (data) {
				$scope.requestStatusUpdatePending = false;
				$ionicLoading.hide();
				if (data.data.status) {
					$state.go('app.envios');
				} else {
					$ionicPopup.alert({ template: "No se pudo guardar"});
				}
			}).catch(function (e) {
				$scope.requestStatusUpdatePending = false;
				$ionicLoading.hide();
				$ionicPopup.alert({ template: JSON.stringify(e)});
			});
		};
		$scope.cancelar = function () {
			$state.go('app.estado', { id: id });
		};

		var processEstadosRequest = function(data) {
            $scope.opciones = data.data.data;

            if (envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0] != undefined) {
				var current_estado_pedido_detalle = envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0].estado_pedido_detalle;
				$scope.form.idestado_pedido_detalle = current_estado_pedido_detalle.idestado_pedido_detalle;
			}
        };
	})