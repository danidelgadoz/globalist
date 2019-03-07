angular
    .module('your_app_name.controllers')
    .controller('AuthCtrl', function ($cordovaNativeStorage, $state) {
        $cordovaNativeStorage.getItem('user').then(function (user) {
            if (Object.keys(user).length === 0) {
                console.log(Object.keys(user));
                $cordovaNativeStorage.getItem('terminos').then(function (user) {
                    $state.go('auth.login');
                }, function (error) {
                    $state.go('auth.walkthrough');
                });
            } else {
                $state.go('app.tests');
            }
        }, function (error) {
            console.log(error);
            $cordovaNativeStorage.getItem('terminos').then(function (user) {
                $state.go('auth.login');
            }, function (error) {
                $state.go('auth.walkthrough');
            });
            //$state.go('auth.walkthrough');
        });
    })