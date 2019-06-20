/**
 * A Promise based XHR function to get JSON data from external APIs
 *
 * Browser compatibility: Chrome, Edge, Firefox, Opera, Safari
 * Internet Explorer does not support the Promise object natively
 *
 * Inspired by Chris Ferdinandi's atomic plugin:
 * @see https://github.com/cferdinandi/atomic
 * @see https://gomakethings.com/promise-based-xhr/
 *
 * @param {String} url - The request URL
 * @param {Object} options - A set of options for the request
 * @return {Promise} - The XHR request Promise
 */
function getJSON (url, options) {

    // Create the XHR request
    var request = new XMLHttpRequest();

    // Setup the Promise
    var xhrPromise = new Promise( (resolve, reject) => {
        // References: How to use ES6 Arrow Functions
        // https://exploringjs.com/es6/ch_arrow-functions.html
        // https://javascriptplayground.com/real-life-es6-arrow-fn/
        // https://medium.com/@philipaffulnunoo/javascript-es6-arrow-functions-2d1eedaec2b7
        // https://gist.github.com/micjamking/6e9886609d40653b3aef107845589744

        // Setup our listener to process compeleted requests
        request.onreadystatechange = () => {

            // Only run if the request is complete
            // Reference: https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (request.readyState !== 4) return;

            // Process the response
            if (request.status >= 200 && request.status < 300) {
                // If successful, resolve the promise by passing back the request response
                resolve(request.response);
            } else {
                // If it fails, reject the promise
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }

        };

        request.onerror = () => {
        // Reference: https://github.com/mdn/js-examples/tree/master/promises-test
        // Also deal with the case when the entire request fails to begin with
        // This is probably a network error, so reject the promise with an appropriate message
            reject(Error('There was a network error.'));
        };

        // Convert the API params object to a serialized query string
        var query = options.apiquery;
        if(query !== null) {
            var query = "?" + Object
                .keys(query)
                .map(function(key){
                  return key+"="+encodeURIComponent(query[key]);
                })
                .join("&");
        }

        // Setup our HTTP request
        request.open(options.method, url + query, true); // method, url, async
        request.responseType = 'json';

        // Send the request
        request.send();

    });

    // Return the request as a Promise
    return xhrPromise;

} // getJSON
