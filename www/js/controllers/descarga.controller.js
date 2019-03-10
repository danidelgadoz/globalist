angular
    .module('your_app_name.controllers')
    .controller('DescargaCtrl', function ($q, $ionicPopup, myDateServ, $localstorage, $stateParams, $ionicLoading, GN7_API_URL, $http, $state, $cordovaNativeStorage, $scope, $timeout) {
        $scope.selectedItem  = null;
		$scope.searchText    = null;
		$scope.rejectReasonSelected = null;

        $scope.querySearch = function (query) {
            var results = query ? $scope.rejectReasons.filter(createFilterFor(query)) : $scope.rejectReasons;
            var deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
		}
		
		$scope.selectedItemChange = function (item) {
			$scope.rejectReasonSelected = item.motivo;
		}

        function createFilterFor(query) {
            var lowercaseQuery = query.toLowerCase();
    
            return function filterFn(state) {
            	return (state.motivo.toLowerCase().indexOf(lowercaseQuery) === 0);
            };
		}

		var id = $stateParams.id;
		$scope.id = $stateParams.id;
		var envio = {};
        $scope.form = {};
        $scope.rejectReasons = [];

		$cordovaNativeStorage.getItem('user').then(function (user) {
			$scope.user = user;
            $ionicLoading.show();
            
			$http.get(GN7_API_URL + 'conductor/envioasignado/' + user.usuario.idconductor).then(function (response) {
                console.log('response', response);
                envio = response.data.data;
                $ionicLoading.show({
                    template: 'Cargando...',
                });

                $q.all([
                    $http.get(GN7_API_URL + 'estado_pedido_detalle/PUNTO DE DESCARGA/' + envio.pedido_detalles[id].idpedido),
                    $http.get(GN7_API_URL + 'tipologia_envio/cliente/' + envio.pedido_detalles[id].pedido.idcliente),
                ]).then(function(values) {
                    console.log('values', values)
                    $ionicLoading.hide();
                    processEstadosRequest(values[0]);
                    processRejectsRequest(values[1]);
                }, function(errors) {
                    console.log('errors', errors)
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        template: 'Ups... hemos tenido un error'
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
			$scope.form.idpedido_detalle = envio.pedido_detalles[id].idpedido_detalle;
			$scope.form.fecha = myDateServ.dateFormat(new Date(), 'yyyy-mm-dd HH:mi:ss');
			var ultimo = $scope.opciones[$scope.opciones.length - 1];
			if ($scope.form.idestado_pedido_detalle == ultimo.idestado_pedido_detalle) {
				var confirmPopup = $ionicPopup.confirm({
					template: 'Se dara por finalizado el pedido detalle',
					cancelText: 'Cancelar',
					okText: 'Aceptar'
				});
				confirmPopup.then(function (res) {
					if (res) {
						console.log('You are sure');
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
								$ionicLoading.show({});
								var request = $http({
									method: "put",
									url: GN7_API_URL + 'pedido_detalle/' + envio.pedido_detalles[id].idpedido_detalle,
									data: { estado: "FINALIZADO" }
								});
								request.then(function (data) {
									if (data.data.status) {
										$localstorage.set('idofertaenvio', 0);
										$ionicLoading.hide();
										$state.go('app.envios');
									}
									else
										$ionicPopup.alert({
											template: "No se pudo finalizar el pedido detalle"
										});
									$ionicLoading.hide();
								}).catch(function (e) {
									$ionicLoading.hide();
									$ionicPopup.alert({
										template: JSON.stringify(e)
									});
								});
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
					} else {
						console.log('You are not sure');
					}
				});
			} else {
				$ionicLoading.show({});
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
		};

		$scope.cancelar = function () {
			$state.go('app.estado', { id: id });
		};
		
		$scope.hideKeyboard = function(){
			Keyboard.hide();
		}
        
        var processEstadosRequest = function(data) {
            $scope.opciones = data.data.data;
            var idestado_pedido_detalle = 0;
            if (envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0] != undefined)
                idestado_pedido_detalle = envio.pedido_detalles[id].pedido_detalle_estado_pedido_detalles[0].estado_pedido_detalle.idestado_pedido_detalle;
            else
                idestado_pedido_detalle = $scope.opciones[0].idestado_pedido_detalle - 1;            
            $scope.form.idestado_pedido_detalle = idestado_pedido_detalle;
        };

        var processRejectsRequest = function(data) {
            $scope.rejectReasons = data.data.data.rows;
        }
	})