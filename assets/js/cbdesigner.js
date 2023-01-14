
var cbApp = angular.module('cbApp', ['ui.bootstrap']);
cbApp.controller('CBController', CBController);

function CBController($scope, $http, $route, $routeParams) {
	var spec = $routeParams.spec;
	if (angular.isUndefined($routeParams.spec)) {
		spec = {
			'lumberLength': 27,
			'lumberThickness': 0.75,
			'boardThickness': 1,
			'bladeKerf': 0.125,
			'strips': new Array(),
		};
	} else {
		spec = JSON.parse($routeParams.spec);
	}
	var longGrain = document.getElementById("longGrain");
	var endGrain = document.getElementById("endGrain");
	var board = new Board($scope, longGrain, endGrain, spec);
	if ($routeParams.boardId) {
		board.id = $routeParams.boardId;
	}
	board.redraw();

	$scope.saveSpec = function () {
		var entry = {};
		if (board.id) {
			entry.id = board.id;
		}
		entry.spec = board.getSpec();
		$http({
			method: 'POST',
			url: '/saveSpec',
			data: entry
		}).success(
			function (data, status, headers, config) {
				$scope.boardModified = false;
				console.log(data);
				if (!board.id) {
					board.id = data;
				}
			}
			).error(
			function (data, status, headers, config) {
				console.log('error');
			}
			);
	}

	function updateBoard() {
		board.lumberLength = parseFloat($scope.lumberLength);
		board.lumberThickness = parseFloat($scope.lumberThickness);
		board.bladeKerf = parseFloat($scope.bladeKerf);

		board.boardThickness = parseFloat($scope.boardThickness);

		board.redraw();

		$scope.boardLength = board.boardLength;
		$scope.boardWidth = board.boardWidth;
		$scope.boardModified = true;
	}

	$scope.lumberChange = function () {
		updateBoard();
	}

	$scope.boardChange = function () {
		updateBoard();
	}

	$scope.stripWidthChange = function (wood) {
		board.setSelectedStripWidth(parseFloat($scope.stripWidth));
		updateBoard();
	}

	$scope.addStrip = function () {
		board.addStrip(parseFloat($scope.stripWidth) || 1,
			parseFloat($scope.lumberLength),
			$scope.selectedWood);
		updateBoard();
	}

	$scope.deleteSelectedStrips = function (strip) {
		board.deleteSelectedStrips();
		updateBoard();
	}

	$scope.$watch('selectedWood', function (newValue, oldValue) {
		board.selectWood(newValue);
	});
}
