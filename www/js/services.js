angular.module('your_app_name.services', [])
	.factory('GeoService', function ($http, GN7_API_URL, $cordovaNativeStorage) {
		var lastUpdateTime,
			minFrequency = 60 * 1000;
		var options = {
			enableHighAccuracy: true,
			timeout: 120000,
			maxAge: 0
		};

		return {
			start: function () {
				function success(pos) {
					$cordovaNativeStorage.getItem('user').then(function (user) {
						var now = new Date();
						if (lastUpdateTime && now.getTime() - lastUpdateTime.getTime() < minFrequency) {
							console.log("Ignoring position update");
							return;
						}
						lastUpdateTime = now;
						var crd = pos.coords;

						/*console.log('Your current position is:');
						console.log('Latitude : ' + crd.latitude);
						console.log('Longitude: ' + crd.longitude);
						console.log('More or less ' + crd.accuracy + ' meters.');*/
						var lat = window.localStorage.getItem("latitud");
						var long = window.localStorage.getItem("longitud");
						var idenvio = window.localStorage.getItem("bgenvio");
						var idconductor = user.usuario.idconductor;
						if (lat != crd.latitude || long != crd.longitude) {
							var datos = {
								idenvio: idenvio,
								latitud: crd.latitude,
								longitud: crd.longitude
							}
							var request = $http({
								method: "post",
								url: GN7_API_URL + 'conductor/actualizarposicion/' + idconductor,
								data: datos
							});
							/*request.success(function(data) {								
							}).error(function (err) {
								console.log(err);
							});  */
							request.then(function (data) {
								window.localStorage.setItem("latitud", datos.latitud);
								window.localStorage.setItem("longitud", datos.longitud);
								console.log(datos);
								console.log(data);
							}).catch(function (e) {
								console.log(JSON.stringify(e));
							});
						} else {
							console.log('same position');
						}
					}, function (error) {
					});
				};

				function error(err) {
					console.log('ERROR(' + err.code + '): ' + err.message);
				};
				var watchID1 = window.localStorage.getItem("watchID");
				if (watchID1) {
					window.localStorage.removeItem("watchID");
					navigator.geolocation.clearWatch(watchID1);
				}
				var watchID = navigator.geolocation.watchPosition(success, error, options);
				window.localStorage.setItem("watchID", watchID);
			},
			single: function (idconductor) {
				function success(pos) {

					var crd = pos.coords;
					var datos = {
						latitud: crd.latitude,
						longitud: crd.longitude
					}
					var request = $http({
						method: "post",
						url: GN7_API_URL + 'conductor/actualizarposicion/' + idconductor,
						data: datos
					});
					request.then(function (data) {
						console.log(datos);
						console.log(data);
					}).catch(function (e) {
						console.log(JSON.stringify(e));
					});
				};

				function error(err) {
					console.log('ERROR(' + err.code + '): ' + err.message);
				};
				navigator.geolocation.getCurrentPosition(success, error, options);
			},
			stop: function () {
				var watchID = window.localStorage.getItem("watchID");
				window.localStorage.removeItem("watchID");
				navigator.geolocation.clearWatch(watchID);
			}
		};

	})
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

	.service('FeedList', function ($rootScope, FeedLoader, $q) {
		this.get = function (feedSourceUrl) {
			var response = $q.defer();
			//num is the number of results to pull form the source
			FeedLoader.fetch({ q: feedSourceUrl, num: 20 }, {}, function (data) {
				response.resolve(data.responseData);
			});
			return response.promise;
		};
	})

	.factory('$localstorage', ['$window', function ($window) {
		return {
			set: function (key, value) {
				$window.localStorage[key] = value;
			},
			get: function (key, defaultValue) {
				return $window.localStorage[key] || defaultValue;
			},
			setObject: function (key, value) {
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function (key) {
				return JSON.parse($window.localStorage[key] || '{}');
			},
			removeItem: function (key) {
				$window.localStorage.removeItem(key);
			},
			removeByIndex: function (index) {
				$window.localStorage.removeItem($window.localStorage.key(index));
			}
		}
	}])

	// PUSH NOTIFICATIONS
	.service('PushNotificationsService', function ($rootScope, $cordovaPush, NodePushServer, GCM_SENDER_ID) {
		/* Apple recommends you register your application for push notifications on the device every time it’s run since tokens can change. The documentation says: ‘By requesting the device token and passing it to the provider every time your application launches, you help to ensure that the provider has the current token for the device. If a user restores a backup to a device other than the one that the backup was created for (for example, the user migrates data to a new device), he or she must launch the application at least once for it to receive notifications again. If the user restores backup data to a new device or reinstalls the operating system, the device token changes. Moreover, never cache a device token and give that to your provider; always get the token from the system whenever you need it.’ */
		this.register = function () {
			var config = {};

			// ANDROID PUSH NOTIFICATIONS
			if (ionic.Platform.isAndroid()) {
				config = {
					"senderID": GCM_SENDER_ID
				};

				$cordovaPush.register(config).then(function (result) {
					// Success
					console.log("$cordovaPush.register Success");
					console.log(result);
				}, function (err) {
					// Error
					console.log("$cordovaPush.register Error");
					console.log(err);
				});

				$rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
					console.log(JSON.stringify([notification]));
					switch (notification.event) {
						case 'registered':
							if (notification.regid.length > 0) {
								console.log('registration ID = ' + notification.regid);
								NodePushServer.storeDeviceToken("android", notification.regid);
							}
							break;

						case 'message':
							if (notification.foreground == "1") {
								console.log("Notification received when app was opened (foreground = true)");
							}
							else {
								if (notification.coldstart == "1") {
									console.log("Notification received when app was closed (not even in background, foreground = false, coldstart = true)");
								}
								else {
									console.log("Notification received when app was in background (started but not focused, foreground = false, coldstart = false)");
								}
							}

							// this is the actual push notification. its format depends on the data model from the push server
							console.log('message = ' + notification.message);
							break;

						case 'error':
							console.log('GCM error = ' + notification.msg);
							break;

						default:
							console.log('An unknown GCM event has occurred');
							break;
					}
				});

				// WARNING: dangerous to unregister (results in loss of tokenID)
				// $cordovaPush.unregister(options).then(function(result) {
				//   // Success!
				// }, function(err) {
				//   // Error
				// });
			}

			if (ionic.Platform.isIOS()) {
				config = {
					"badge": true,
					"sound": true,
					"alert": true
				};

				$cordovaPush.register(config).then(function (result) {
					// Success -- send deviceToken to server, and store for future use
					console.log("result: " + result);
					NodePushServer.storeDeviceToken("ios", result);
				}, function (err) {
					console.log("Registration error: " + err);
				});

				$rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
					console.log(notification.alert, "Push Notification Received");
				});
			}
		};
	})


	// BOOKMARKS FUNCTIONS
	.service('BookMarkService', function (_, $rootScope) {

		this.bookmarkFeedPost = function (bookmark_post) {

			var user_bookmarks = !_.isUndefined(window.localStorage.ionFullApp_feed_bookmarks) ?
				JSON.parse(window.localStorage.ionFullApp_feed_bookmarks) : [];

			//check if this post is already saved

			var existing_post = _.find(user_bookmarks, function (post) { return post.link == bookmark_post.link; });

			if (!existing_post) {
				user_bookmarks.push({
					link: bookmark_post.link,
					title: bookmark_post.title,
					date: bookmark_post.publishedDate,
					excerpt: bookmark_post.contentSnippet
				});
			}

			window.localStorage.ionFullApp_feed_bookmarks = JSON.stringify(user_bookmarks);
			$rootScope.$broadcast("new-bookmark");
		};

		this.bookmarkWordpressPost = function (bookmark_post) {

			var user_bookmarks = !_.isUndefined(window.localStorage.ionFullApp_wordpress_bookmarks) ?
				JSON.parse(window.localStorage.ionFullApp_wordpress_bookmarks) : [];

			//check if this post is already saved

			var existing_post = _.find(user_bookmarks, function (post) { return post.id == bookmark_post.id; });

			if (!existing_post) {
				user_bookmarks.push({
					id: bookmark_post.id,
					title: bookmark_post.title,
					date: bookmark_post.date,
					excerpt: bookmark_post.excerpt
				});
			}

			window.localStorage.ionFullApp_wordpress_bookmarks = JSON.stringify(user_bookmarks);
			$rootScope.$broadcast("new-bookmark");
		};

		this.getBookmarks = function () {
			return {
				feeds: JSON.parse(window.localStorage.ionFullApp_feed_bookmarks || '[]'),
				wordpress: JSON.parse(window.localStorage.ionFullApp_wordpress_bookmarks || '[]')
			};
		};
	})


	// WP POSTS RELATED FUNCTIONS
	.service('PostService', function ($rootScope, $http, $q, WORDPRESS_API_URL) {

		this.getRecentPosts = function (page) {
			var deferred = $q.defer();

			$http.jsonp(WORDPRESS_API_URL + 'get_recent_posts/' +
				'?page=' + page +
				'&callback=JSON_CALLBACK')
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (data) {
					deferred.reject(data);
				});

			return deferred.promise;
		};


		this.getPost = function (postId) {
			var deferred = $q.defer();

			$http.jsonp(WORDPRESS_API_URL + 'get_post/' +
				'?post_id=' + postId +
				'&callback=JSON_CALLBACK')
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (data) {
					deferred.reject(data);
				});

			return deferred.promise;
		};

		this.shortenPosts = function (posts) {
			//we will shorten the post
			//define the max length (characters) of your post content
			var maxLength = 500;
			return _.map(posts, function (post) {
				if (post.content.length > maxLength) {
					//trim the string to the maximum length
					var trimmedString = post.content.substr(0, maxLength);
					//re-trim if we are in the middle of a word
					trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf("</p>")));
					post.content = trimmedString;
				}
				return post;
			});
		};

		this.sharePost = function (link) {
			window.plugins.socialsharing.share('Check this post here: ', null, null, link);
		};

	})
	.service('$cordovaLaunchNavigator', ['$q', function ($q) {
		"use strict";

		var $cordovaLaunchNavigator = {};
		$cordovaLaunchNavigator.navigate = function (destination, options) {
			var q = $q.defer(),
				isRealDevice = ionic.Platform.isWebView();

			if (!isRealDevice) {
				q.reject("launchnavigator will only work on a real mobile device! It is a NATIVE app launcher.");
			} else {
				try {

					var successFn = options.successCallBack || function () {
					},
						errorFn = options.errorCallback || function () {
						},
						_successFn = function () {
							successFn();
							q.resolve();
						},
						_errorFn = function (err) {
							errorFn(err);
							q.reject(err);
						};

					options.successCallBack = _successFn;
					options.errorCallback = _errorFn;

					launchnavigator.navigate(destination, options);
				} catch (e) {
					q.reject("Exception: " + e.message);
				}
			}
			return q.promise;
		};

		return $cordovaLaunchNavigator;
	}])


	.service('OneSignalService', function () {
		this.app_id = "68a5be17-6a78-4339-967e-826350a47298";

		this.startInit = function () {
			console.log('Registering at OneSignal...', this.app_id);

			window.plugins.OneSignal
				.startInit(this.app_id)
				.endInit();
		};

		this.getPermissionSubscriptionState = function (callback) {
			window.plugins.OneSignal.getPermissionSubscriptionState(callback);
		};

		this.handleNotificationCatcher = function (callback) {
			// if the app is not in focus
			window.plugins.OneSignal
				.startInit(this.app_id)
				.handleNotificationOpened(callback)
				.endInit();

			// if the app is in focus
			window.plugins.OneSignal
				.startInit(this.app_id)
				.inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
				.handleNotificationReceived(callback)
				.endInit();
		};

	});