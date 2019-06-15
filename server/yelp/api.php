<?php

/**
 * Based on the Yelp Fusion API code sample.
 * https://github.com/Yelp/yelp-fusion/blob/master/fusion/php/sample.php
 *
 * This will return JSON yelp data for a hotel.
 *
 * @author  m-coding
 * @link    https://github.com/m-coding/fe-05-1-hotels-map
 *
 */

// API key placeholders that must be filled in by users.
// You can find it on
// https://www.yelp.com/developers/v3/manage_app
$API_KEY = "0gWEoOOt2tcdpS9-yIF98ApNVu220EKi_i3uiMuB-zlT6egWkkBO0wviVwGZpkTSqHk6PQtWzL_E-f9FK8n7pU4VqP-rcm3cUs2dU0AeKBd5tnz6kbinH2D5JCMAXXYx";


// API constants, you shouldn't have to change these.
$API_HOST = "https://api.yelp.com";
$BUSINESS_PATH = "/v3/businesses/";  // Business ID will come after slash.


/**
 * Makes a request to the Yelp API and returns the response
 *
 * @param    $host    The domain host of the API
 * @param    $path    The path of the API after the domain.
 * @param    $url_params    Array of query-string parameters.
 * @return   The JSON response from the request
 */
function request($host, $path, $url_params = array()) {
    // Send Yelp API Call
    try {
        $curl = curl_init();
        if (FALSE === $curl)
            throw new Exception('Failed to initialize');

        $url = $host . $path . "?" . http_build_query($url_params);
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,  // Capture response.
            CURLOPT_ENCODING => "",  // Accept gzip/deflate/whatever.
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "authorization: Bearer " . $GLOBALS['API_KEY'],
                "cache-control: no-cache",
            ),
        ));

        $response = curl_exec($curl);

        if (FALSE === $response)
            throw new Exception(curl_error($curl), curl_errno($curl));
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($response, $http_status);

        curl_close($curl);
    } catch(Exception $e) {
        trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
    }

    return $response;
}


/**
 * Query the Business API by business_id
 *
 * @param    $business_id    The ID of the business to query
 * @return   The JSON response from the request
 */
function get_business($business_id) {
    $business_path = $GLOBALS['BUSINESS_PATH'] . urlencode($business_id);

    return request($GLOBALS['API_HOST'], $business_path);
}

/**
 * Queries the API by the input values from the user
 *
 * @param    $location    The location of the business to query
 */
function query_api($location) {

    $response = get_business($location);

    $pretty_response = json_encode(json_decode($response), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    print "$pretty_response\n";
}

/**
 * User input is handled here
 */
header('content-type:application/json');

$hotel = $_GET['hotel'];

query_api($hotel);

?>
