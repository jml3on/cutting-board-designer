angular.module('cbApp', ['ngRoute', "ui.bootstrap"])

	.controller('MainController',
	function ($scope, $route, $routeParams, $location) {
		$scope.$route = $route;
		$scope.$location = $location;
		$scope.$routeParams = $routeParams;
	})

	.controller('CBController', CBController)
	.controller('GalleryController', GalleryController)

	.config(function ($routeProvider, $locationProvider) {
		$routeProvider
			.otherwise({
				templateUrl: '/assets/gallery.html',
				controller: 'GalleryController',
				caseInsensitiveMatch: true,
			})
			.when('/Edit/:boardId/:spec*', {
				templateUrl: '/assets/edit.html',
				controller: 'CBController',
				caseInsensitiveMatch: true,
			})
			.when('/New/', {
				templateUrl: '/assets/edit.html',
				controller: 'CBController',
				caseInsensitiveMatch: true,
			})
			.when('/Help', {
				templateUrl: '/assets/help.html',
				caseInsensitiveMatch: true,
			})
			;

		// configure html5 to get links working on jsfiddle
		$locationProvider.html5Mode(true);
	});
