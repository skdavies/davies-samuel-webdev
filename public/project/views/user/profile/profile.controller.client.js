(function () {
  angular
    .module('ItineraryPlanner')
    .controller('ProfileController', profileController);

  function profileController($location, $routeParams, UserService, loggedIn, $mdDialog, ItineraryService) {
    var vm = this;
    vm.followingYn = followingYn;
    vm.toggleFollow = toggleFollow;
    vm.viewItinerary = viewItinerary;
    vm.deleteItinerary = deleteItinerary;
    vm.saveProfile = saveProfile;

    function init() {
      var userId = $routeParams['userId'];
      vm.user = loggedIn;
      vm.userCopy = angular.copy(vm.user);
      vm.viewing = {};
      vm.isEditing = false;

      UserService.findUserById(userId).then(function (response) {
        vm.viewing = response.data;
      }, function () {
        vm.viewing = null;
      });

      ItineraryService.findItinerariesForUser(userId).then(function (response) {
        vm.itineraries = response.data;
      });
    }

    init();

    function viewItinerary(itinId) {
      $location.url('/itineraries/' + itinId);
    }

    function deleteItinerary(itinId, index, event) {
      event.stopPropagation();
      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .textContent('Deleting an itinerary cannot be undone.')
        .ok('Yes, I\'m sure')
        .cancel('Never Mind');

      $mdDialog.show(confirm).then(function (response) {
        ItineraryService.deleteItinerary(itinId).then(function () {
          vm.itineraries.splice(index, 1);
        });
      });
    }

    function saveProfile() {
      UserService.updateUser(vm.userCopy._id, vm.userCopy).then(function (response) {
        vm.user = response.data;
        vm.isEditing = false;
      });
    }

    function followingYn(followId) {
      if (!vm.user || (vm.user && followId === vm.user._id) || !vm.viewing) {
        return false;
      } else {
        return vm.user.following.users.length && vm.user.following.users.filter(function (u) {
            return u.followers.users.includes(followId)
          }).length === 0;
      }
    }
    
    function toggleFollow(followId) {
      if (followingYn(followId)) {
        UserService.unfollowUser(vm.user._id, followId).then(function (response) {
          vm.user = response.data;
        });
      } else {
        UserService.followUser(vm.user._id, followId).then(function (response) {
          vm.user = response.data;
        });
      }
    }

  }
})();