angular
    .module('your_app_name.controllers')
	.controller('WalkCtrl', function ($cordovaNativeStorage, $scope, $state) {
		$cordovaNativeStorage.getItem('terminos').then(function (user) {
			$state.go('auth.login');
		}, function (error) {
			console.log(error);
		});
		$scope.aceptar = function () {
			$cordovaNativeStorage.setItem('terminos', 'si').
				then(function (user) {
					$state.go('auth.login');
				}, function (error) {//cne
					$ionicLoading.hide();
				});
		};
	})