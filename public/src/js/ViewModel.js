var app = app || {};

/**
 * ViewModel
 * @name app.ViewModel
 * @class ViewModel
 * @memberof app
 */
app.ViewModel = function() {
    'use strict';

    var self = this;

    self.showTicker = ko.observable(false);
    self.hotelTweets = ko.observable('');
    self.timeout = ko.observable(false);
    self.dispMsg = ko.observable('');
    self.hotelList = ko.observableArray();
    self.filterList = ko.observableArray();
    self.filterText = ko.observable('');
    self.ratingsChecked = ko.observableArray();
    self.ratings = ko.observableArray([
        {ratingValue: 5, icon: 'aaaaa', color: 'red'},
        {ratingValue: 4, icon: 'aaaa', color: 'yellow'},
        {ratingValue: 3, icon: 'aaa', color: 'green'},
        {ratingValue: 2, icon: 'aa', color: 'purple'},
    ]);
    self.slideClass = ko.observable('hidden overlay');
    self.showDef = ko.observable(false);
    self.showName = ko.observable(true);
    self.showRating = ko.observable(false);
    self.showList = ko.observable(true);

    /**
     * @function app.ViewModel.getRatings
     * @memberof app.ViewModel
     * @returns {array} - List of diamond rating value, icon, and color
     */
    self.getRatings = function() {
        return self.ratings();
    };

    /**
     * @function app.ViewModel.nameSort
     * @memberof app.ViewModel
     * @returns {array} - Alphabetically sorted list of hotel names
     */
    self.nameSort = function(left, right) {
        return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1);
    };

    /**
     * @function app.ViewModel.getHotels
     * @memberof app.ViewModel
     * @returns {array} - An array of objects for each hotel
     */
    self.getHotels = ko.computed(function() {
        // Unwrap the observable to return an array
        var hotelArray = app.model.hotels();

        // Sort the array by hotel name
        hotelArray.sort(self.nameSort);

        return hotelArray;
    });

    /**
     * @function app.ViewModel.getHotelsLength
     * @memberof app.ViewModel
     * @returns {number} - The length of the hotels array
     */
    self.getHotelsLength = ko.computed(function() {
        return app.model.hotels().length;
    });

    /**
     * @function app.ViewModel.getKeys
     * @memberof app.ViewModel
     * @returns {object} - Yelp API keys
     */
    self.getKeys = function() {
        return app.model.yelp;
    };

    /**
     * Saves the list of hotels and initializes the map.
     *
     * @function app.ViewModel.init
     * @memberof app.ViewModel
     */
    self.init = function() {
        self.hotelList(self.getHotels());
        app.mv.initMap();
    };

    /**
     * Slides in the filter menu and resizes the map.
     *
     * @function app.ViewModel.slideIn
     * @memberof app.ViewModel
     */
    self.slideIn = function() {
        self.slideClass('animated slideInLeft no-overlay');
        google.maps.event.trigger(app.mv.map,'resize');
    };

    /**
     * Slides out the filter menu, resizes the map, and centers the map on the marker.
     * If the screen height is greater than 400px, it will pan the map down 120px to make room for the infoWindow.
     *
     * @function app.ViewModel.slideOut
     * @memberof app.ViewModel
     */
    self.slideOut = function() {
        self.slideClass('animated fadeOutLeft overlay');
        google.maps.event.trigger(app.mv.map,'resize');
        app.mv.map.setCenter(app.mv.currentLocation);
        if(window.screen.height > 400) app.mv.map.panBy(0, -120);
    };

    /**
     * Prevents the page from refreshing when the <ENTER> key is pressed.
     *
     * @function app.ViewModel.noEnter
     * @memberof app.ViewModel
     * @returns {boolean} - False
     */
    self.noEnter = function(data, event) {
        // Prevent form submission
        return false;
    };

    /**
     * Runs when a hotel is selected in the list view.
     *
     * @function app.ViewModel.gotoHotel
     * @memberof app.ViewModel
     */
    self.gotoHotel = function(hotel) {
        // Re-center the map on the marker that was clicked
        app.mv.map.setCenter(hotel.location);

        // Pan down 120px (keeps tall infoWindow from getting cutoff)
        // Do not pan if in landscape mode
        if(window.screen.height > 400) app.mv.map.panBy(0, -120);

        app.mv.infoWindow.close();

        // Manually trigger the click event for the marker
        google.maps.event.trigger(hotel.marker, 'click');
    };

    /**
     * Toggles diamond rating checkbox, and filters hotels displayed by rating.
     *
     * @function app.ViewModel.filterRatings
     * @memberof app.ViewModel
     */
    self.filterRatings = function(data, event) {
        self.hotelDisplay();

        // Return true to toggle checkbox
        return true;
    };

    /**
     * Toggles display of the Hotel Name search
     *
     * @function app.ViewModel.toggleName
     * @memberof app.ViewModel
     */
    self.toggleName = function() {
        self.showName(!self.showName());
    };

    /**
     * Toggles display of the Diamond Rating filter
     *
     * @function app.ViewModel.toggleRating
     * @memberof app.ViewModel
     */
    self.toggleRating = function() {
        self.showRating(!self.showRating());
    };

    /**
     * Toggles display of the Diamond Rating Definitions.
     *
     * @function app.ViewModel.toggleList
     * @memberof app.ViewModel
     */
    self.toggleList = function() {
        self.showList(!self.showList());
    };

    /**
     * Toggles display the Diamond Rating Definitions.
     *
     * @function app.ViewModel.toggleDef
     * @memberof app.ViewModel
     */
    self.toggleDef = function() {
        self.showDef(!self.showDef());
    };

    /**
     * Real time filtering of hotels displayed in the list and map.
     *
     * @function app.ViewModel.hotelDisplay
     * @memberof app.ViewModel
     * @returns {object} - Filtered list of hotels
     */
    self.hotelDisplay = ko.computed(function() {
        var result = -1;
        var temp = [];
        var query = self.filterText().toLowerCase();
        var rlength = self.ratingsChecked().length;
        var diamond = 0;
        var match = -1;

        // Reset the twitter ticker
        self.showTicker(false);

        // Copy the original hotel list array
        self.filterList(self.hotelList());

        if (!query && rlength <= 0) {
            // Make all the hotel markers visible
            self.filterList().forEach(function(hotel, index) {
                // Prevents error if marker is not set yet
                if(hotel.marker) hotel.marker.setVisible(true);
            });

            // Return all the hotels
            return self.filterList;
        } else {
            self.filterList().forEach(function(hotel, index) {
                // Check if the query matches with the hotel name
                result = hotel.name.toLowerCase().indexOf(query);
                diamond = hotel.diamonds;

                // Ratings check
                if(rlength > 0)
                    match = self.ratingsChecked.indexOf(diamond);
                else
                    match = 0;

                if(result >= 0 && match >= 0) {
                    hotel.marker.setVisible(true);
                    temp.push(hotel);
                } else {
                    hotel.marker.setVisible(false);
                    app.mv.infoWindow.close();
                }
            }); // forEach

            // Save the filtered hotels back to the ko observable array
            self.filterList(temp);

            return self.filterList;
        } // else
    }); // hotelDisplay

}; // ViewModel
