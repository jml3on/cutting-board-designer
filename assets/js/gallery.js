
DEMO_BOARD = {
	"boardThickness": 1,
	"lumberLength": 27,
	"lumberThickness": 0.75,
	"strips": [{ "width": 1.5, "wood": "maple" },
	{ "width": 1.5, "wood": "cherry" },
	{ "width": 1.5, "wood": "mahogany" },
	{ "width": 1.5, "wood": "jatoba" },
	{ "width": 1.5, "wood": "walnut" },
	{ "width": 1.5, "wood": "jatoba" },
	{ "width": 1.5, "wood": "mahogany" },
	{ "width": 1.5, "wood": "cherry" },
	{ "width": 0.75, "wood": "maple" }],
	"bladeKerf": 0.125
}

function GalleryController($scope, $http, $timeout) {

	var updateList = function () {
		$http.get('/listSpecs').success(
			function (data) {
				if (data.length == 0) {
					data.push({ "spec": JSON.stringify(DEMO_BOARD), 'id': '10' });
				}
				console.log(data)
				$scope.gallery = data;
				$scope.predicate = 'date';
				$timeout(function () {
					for (var i = 0; i < data.length; i++) {
						console.log(data[i].spec);
						var id = data[i].id;
						var spec = JSON.parse(data[i].spec);
						data[i].spec = spec;
						// console.log(data[i]);
						var endGrain = document.getElementById(id);
						var board = new Board($scope, undefined,
							endGrain, spec, 10);
						data[i].label = board.boardLength + '" x ' +
							board.getWidth() + '" x ' +
							spec.boardThickness + '"';
						board.redraw();
					}
				}, 10);
			}
		);
	}

	updateList($scope, $http);


	$scope.deleteSpec = function (entry) {
		$http({
			method: 'POST',
			url: '/deleteSpec',
			data: entry
		}).success(
			function (data, status, headers, config) {
				updateList();
			}
			).error(
			function (data, status, headers, config) {
				console.log('error');
			}
			);
	}
}
