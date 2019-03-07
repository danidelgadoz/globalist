angular
.module('your_app_name.controllers')
.controller('AppCtrl', function ($ionicPopup, GN7_API_URL, $http, $ionicLoading, BackgroundGeolocationService, $cordovaNativeStorage,/*$firebaseAuth,*/$state, $scope) {
    $cordovaNativeStorage.getItem('user').then(function (user) {
        //console.log(user);
        $scope.user = user;
        $scope.nombre = user.usuario.nombre;
    }, function (error) {
        $cordovaNativeStorage.getItem('terminos').then(function (user) {
            $state.go('auth.login');
        }, function (error) {
            $state.go('auth.walkthrough');
        });
    });

    $scope.logout = function () {
        $ionicLoading.show({
            template: 'Cerrando sesion...',
        });

        $cordovaNativeStorage.remove('user').then(function (value) {
            console.log(value);
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
                                    $state.go('auth.login');
                                }
                                else {
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
                        }
                        else {
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
                }
                else {
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
        }, function (error) {
            console.log(error);
        });
    };
})