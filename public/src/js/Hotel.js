var app = app || {};

/**
 * Hotel
 * @name app.Hotel
 * @class Hotel
 * @memberof app
 */
app.Hotel = function() {
    'use strict';

    var self = this;

    self.hotels = ko.observableArray();
    self.yelp = {};

    /**
     * @typedef Hotels
     * @type Object
     * @property {string} name - Name of hotel
     * @property {string} id - Yelp business ID
     * @property {string} twitter - Twitter screen name
     * @property {object} location - Hotel coordinates
     * @property {number} location._lat - Latitude
     * @property {number} location._long - Longitude
     * @property {number} diamonds - Diamond rating of hotel
     */

    /**
     * Retrieves the hotels json from Firebase server.
     *
     * @function app.Hotel.init
     * @memberof app.Hotel
     * @see {@link https://firebase.google.com/docs/web/setup}
     * @see {@link https://firebase.google.com/docs/firestore/quickstart}
     * @see {@link https://firebase.google.com/docs/firestore/query-data/get-data#get_all_documents_in_a_collection}
     * @returns {Hotels} - Hotel data in json notation
     */
    self.init = function() {
        var hotelsRef;
        var yelpRef;
        var hotel = [];
        var db;
        var firebaseConfig = {
            apiKey: "AIzaSyDAkU7fnDw-cOpyrXsRhMWCFeKbrNgvZGs",
            authDomain: "zeta-time-122004.firebaseapp.com",
            projectId: "zeta-time-122004",
        };

        // Start the 10 second timer
        self.reqTimeout();

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Cloud Firestore Database
        db = firebase.firestore();

        // Get all the hotel documents from the hotels collection
        hotelsRef = db.collection('hotels');

        hotelsRef.get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                // console.log( doc.id, " => ", doc.data() );

                // Helpfuf info: https://stackoverflow.com/questions/52462129
                hotel = doc.data();
                hotel.id = doc.id;
                hotel.content = null;
                hotel.tweets = null;

                // Save each hotel into a Knockout Observable Array
                self.hotels.push(hotel);

            }); //querySnashot

            // Initialize the map with the hotels.
            app.vm.init();

        })
        .catch(function(error) {
            var errMsg = "Error getting hotel data from Firebase: " + error;
            app.vm.dispMsg(errMsg);
        });

        // Save yelp credentials
        yelpRef = db.collection('yelp').doc("authentication");

        yelpRef.get()
        .then(function(doc) {
            if(doc.exists) {
                self.yelp = doc.data();
            }
        })
        .catch(function(error) {
            var errMsg = "Error getting yelp authentication from Firebase: " + error;
            app.vm.dispMsg(errMsg);
        });

    }; // init

    /**
     * Timer that displays an error message if map has not loaded.
     *
     * @function app.Hotel.reqTimeout
     * @memberof app.Hotel
     */
    self.reqTimeout = function () {
        // This will display if client cannot connect to Firebase after 10 seconds
        var errMsg = 'Firebase server request timed out. <br> Check your connection and refresh the page.';
        setTimeout( function() {
            // Check to see if the hotel data is loaded and display error message if no hotels
            if(self.hotels().length === 0) {
                app.vm.timeout(true);
                app.vm.dispMsg(errMsg);
            }
        }, 10000);
    }; // reqTimeout

}; // Hotel
