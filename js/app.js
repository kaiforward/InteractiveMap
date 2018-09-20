var map;
var previousMarker;

var currentLat;
var currentLng;

var locationOffset;
var timezone;

var sunrise;
var sunset;

function initMap() {
	// create map
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -0, lng: 0},
		zoom: 2
	});
	// use mousedown as it works on both desktop and mobile for clicks and taps respectively.
	map.addListener('mousedown', function(e){ 
		placeMarkerAndPanTo(e.latLng, map);	
		currentLat = e.latLng.lat();
		currentLng = e.latLng.lng();
		getSunriseSunset(currentLat, currentLng);	
	});
}

function placeMarkerAndPanTo(latLng, map) {
	// if previous marker exists remove it
	if (previousMarker != null) {
		previousMarker.setMap(null);
	}
	// create new marker
	var marker = new google.maps.Marker({
		position: latLng,
		map: map
	});
	previousMarker = marker;
	// pan to new marker location
	map.panTo(latLng);
}

function getSunriseSunset(lat, lng) {
	// create url for ajax call
	var url = 'https://api.sunrise-sunset.org/json?'+'lat='+lat+'&lng='+lng+'&formatted=0';
	// make ajax call to sunrise/sunset api
	$.getJSON(url, function(result) {
		sunrise = result.results.sunrise;
		sunset = result.results.sunset;
		// get timezone only once we have sucessfully returned ajax call
		getTimezone(lat, lng);
	});
	return sunrise, sunset;
}

function getTimezone(lat, lng) {
	// get current date as UnixTimestamp
	var dateUnix = Math.round((new Date()).getTime() / 1000);
	// create url for ajax call
	var url = 'https://maps.googleapis.com/maps/api/timezone/json?location='+lat+','+lng+'&timestamp='+dateUnix+'&key=AIzaSyAzQ_yuy7s3rE0TtwT_mDADKUcrgs--9eA'
	// make ajax call to google timezone api.
	$.getJSON(url, function(result) {
		locationOffset = result.rawOffset;
		timezone = result.timeZoneName;
		// calculate if day or night only after timezone ajax call has been sucessfully returned.
		isItDayOrNight();
	});
}

function isItDayOrNight() {
	// Get current Unix timestamps with location offset for the sunrise, sunset and current time.
	var dateUnix = Math.round((new Date()).getTime() / 1000) + locationOffset;
	var newSunrise = Math.round((new Date(sunrise)).getTime() / 1000) + locationOffset;
	var newSunset = Math.round((new Date(sunset)).getTime() / 1000) + locationOffset;
	// get element to return result in.
	var resultDiv = document.getElementById('time-result');
	// if current time is above sunrise, but below sunset, it should be daytime.
	if (dateUnix >= newSunrise && dateUnix <= newSunset) {
		resultDiv.innerHTML = "It is currently daytime <br>" + timezone;
	} else {
		resultDiv.innerHTML = "It is currently nighttime <br>" + timezone;
	}
}