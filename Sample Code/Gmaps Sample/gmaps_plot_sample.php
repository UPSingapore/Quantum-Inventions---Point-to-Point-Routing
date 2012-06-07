<html>
  <head>
      <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key={YOUR_API_KEY}&sensor=true">
      </script>

</head>

<body>
	<div id="geocoding_label">
		<form method="post" id="geocoding_form">
	        <label for="address">Address:</label>
	        <div class="input">
	        	<input type="checkbox" class="route_type" value="cheapest" />Cheapest
				<input type="checkbox" class="route_type" value="traffic" />Traffic
				<input type="checkbox" class="route_type" value="shortest" />Shortest
				<input type="checkbox" class="route_type" value="fastest" />Fastest
	            <input type="text" id="address" name="address" />
	            <input type="submit" class="btn" value="Search" />
	        </div>
        </form>
    </div>

	<div id="title" style="padding-top:1em; padding-bottom: 1em;"></div>
	<div id="options">
		<div class="cheapest" style="display:none"><input type="button" value="Cheapest" /></div>
		<div class="traffic" style="display:none"><input type="button" value="Traffic" /></div>
		<div class="shortest" style="display:none"><input type="button" value="Shortest" /></div>
		<div class="fastest" style="display:none"><input type="button" value="Fastest" /></div>
	</div>
	<div id="mapbody">
		<div id="map_canvas" style="width:70%; height:90%; float: left;"></div>
		<div id="waypoints"></div>
		<div id="directions" style="width:25%; height:90%; float:right;"></div>
	</div>

</body>

<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="gmaps.js"></script>
<script type="text/javascript" src="SVY21toLLConverter.js"></script>
<script type="text/javascript" src="nav_gmaps_sample.js"></script>

</html>