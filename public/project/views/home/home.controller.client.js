(function () {
  angular
    .module('ItineraryPlanner')
    .controller('HomeController', homeController);

  function homeController($location, ItineraryService, PlaceService, $scope, loggedIn, $mdDialog) {
    var vm = this;
    vm.saveItinerary = saveItinerary;
    vm.removePlace = removePlace;
    vm.viewPlace = viewPlace;

    function init() {
      vm.control = {};
      vm.user = loggedIn;
      if (vm.user && vm.user.role === 'ADMIN') {
        $location.url('/admin');
        return;
      } else if (vm.user && vm.user.role === 'ADVERTISER') {
        $location.url('/place');
        return;
      }
      vm.places = [];
      initMap();
      PlaceService.findMostRecentAds().then(function (response) {
        vm.placesWithAds = response.data;
      }, function () {
        vm.placesWithAds = [];
      });
      initSortable();
    }

    init();

    function initSortable() {
      var startIndex = -1;

      function onStart(event, ui) {
        startIndex = ui.item.index();
      }

      function onStop(event, ui) {
        var finalIndex = ui.item.index();
        vm.places.splice(finalIndex, 0, vm.places.splice(startIndex, 1)[0]);
      }

      $('#itinerary').sortable({
        axis: 'y',
        handle: '.sortable',
        start: onStart,
        stop: onStop
      });
    }

    function initMap() {
      var fenway = { lat: 42.346268, lng: -71.095764 };
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: fenway
      });
      var options = {
        types: ['(regions)']
      };
      var input = document.getElementById('autocomplete');
      var autocomplete = new google.maps.places.Autocomplete(input, options);
      window.google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        if (vm.places.length === 0) {
          var coordinates = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
          new google.maps.Marker({
            position: coordinates,
            map: map
          });
          map.setCenter(coordinates)
        }
        PlaceService.findPlaceByGoogleId(place.place_id).then(function (response) {
          if (response.data) { //that place already exists
            place._id = response.data._id;
            vm.places.push(place);
          } else {
            PlaceService.createPlace({
              googlePlaceId: place.place_id, name: place.name
            }).then(function (response) {
              place._id = response.data._id;
              vm.places.push(place);
            });
          }
        });
        $scope.$apply();
        input.focus();
        input.value = '';
      });
    }

    function saveItinerary() {
      var placeIds = $("#itinerary").sortable("toArray");
      ItineraryService.createItinerary(vm.user._id, { places: placeIds }).then(function (response) {
        $location.url('/itinerary/' + response.data._id);
      });
    }

    function removePlace(index) {
      vm.places.splice(index, 1);
    }

    function viewPlace(place, event) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .textContent('Any unsaved changes to your itinerary will be lost when you leave the page.')
        .targetEvent(event)
        .ok('Yes, I\'m sure')
        .cancel('Never Mind');

      $mdDialog.show(confirm).then(function () {
        $location.url('/place/' + place._id);
      });
    }

    function _formatPlacesToIds(places) {
      var placeIds = [];
      for (var i = 0; i < places.length; i++) {
        placeIds.push(places[i]._id);
      }
      return placeIds;
    }
  }
})();