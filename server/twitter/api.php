<?php
/**
 * Twitter Application Only Authentication
 * https://dev.twitter.com/oauth/application-only
 *
 * Simple Twitter API wrapper to pass back JSON data of a user's tweets.
 *
 * To keep this program simple, I already manually generated my bearer
 * token using my Consumer Key and Consumer Secret. So this program skips
 * the oAuth Authentication steps to generate the token and just uses the
 * one I provided to access the Twitter API.
 *
 * @author  m-coding
 * @link    https://github.com/m-coding/fe-05-1-hotels-map
 *
 */

header('content-type:application/json');
$bearer_token = 'AAAAAAAAAAAAAAAAAAAAAAtztwAAAAAA9%2FOHDhbNOhQ7xiWXPxiOdejku7Y%3D5FzZwG9BYY6iwrwGaaiEDPJEDOBhDjASrJ4bEqNGKWIAPGb43t';
$screen_name = $_GET['screen_name'];
$count = $_GET['count'];
$params = array(
    'screen_name' => $screen_name,
    'count' => $count,
    'exclude_replies' => true
);
$query = http_build_query($params);
$url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?' . $query;

// Get Tweets
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER,array('Authorization: Bearer ' . $bearer_token));
// CURLOPT_RETURNTRANSFER- TRUE to return the transfer as a string of the return value of curl_exec().
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// CURLOPT_SSL_VERIFYPEER- Set FALSE to stop cURL from verifying the peer's certificate.
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execute the  Curl session
$json = curl_exec($ch);

// Get the Error Code returned by Curl
$curlErrno = curl_errno($ch);
if($curlErrno){
    $curlError = curl_error($ch);
    throw new Exception($curlError);
}

// Close the Curl Session
curl_close($ch);

echo $json;
?>