angular
    .module('your_app_name.controllers')
	.controller('LoginCtrl', function (OneSignalService, BackgroundGeolocationService, $cordovaNativeStorage, $http, GN7_API_URL, $scope, $state, $ionicLoading, $ionicPopup/*,$firebaseAuth*/) {
		$scope.doLogIn = function () {
			console.log("doLogIn()");

			$ionicLoading.show({ template: 'Conectando...', });

			$scope.promise = null;

			$scope.promise = $http({
				method: "post",
				url: GN7_API_URL + 'usuario/auth',
				data: $scope.user
			}).success(function (data) {
				$scope.promise = false;

				if (data.auth) {
					if (data.data.usuario.tipo_usuario != "AFILIADO") {
						$ionicPopup.alert({ template: "Usuario incorrecto." });
						$ionicLoading.hide();
						return 0;
					}

					$cordovaNativeStorage.setItem('user', data.data).then(function (value) {
						$http.defaults.headers.common.Authorization = data.data.token;

						OneSignalService.getPermissionSubscriptionState(function (status) {
							$http({
								method: "put",
								url: GN7_API_URL + 'usuario/' + data.data.usuario.idusuario,
								data: {
									tipo_usuario: data.data.usuario.tipo_usuario,
									correo: data.data.usuario.correo,
									nombre: data.data.usuario.nombre,
									dispositivo: status.subscriptionStatus.userId
								}
							}).then(function (data) {
								$state.go('app.tests');
							});
						});

					}, function (error) { });
					$ionicLoading.hide();
				} else {
					$ionicPopup.alert({ template: data.data });
					$ionicLoading.hide();
				}
			}).error(function (err) {
				$scope.promise = false;
				$ionicPopup.alert({ template: err.msg });
				$ionicLoading.hide();
			});
		};

		$scope.user = {};
	})