<?php 
	/**
	* Fetches and caches json file from query URL to 
	* Local storage
	**/


	/* gets the contents of a file if it exists, otherwise grabs and caches */
	function get_content($arr, $getURL) {
		$saveTo = "route.json";
		//decisions, decisions
		if(file_exists($saveTo) && $getURL==false) {
			return file_get_contents($saveTo);
		}
		else {

			$HTMLString = '';
			for($i=0;$i<sizeof($arr);$i++){
				$HTMLString .= $arr[$i] . '&';
			}
			$HTML = urlencode(($HTMLString));
			$file = file_get_contents(urldecode($HTML));
			file_put_contents($saveTo,file_get_contents(urldecode($HTML)));
			return $file;
		}
	}

	//get link array
	$HTMLArr = $_GET["link"];
	$getFromURL = true;
	
	if(sizeof($HTMLArr) == 1){
		$getFromURL = false;
	}
	
	echo get_content($HTMLArr, $getFromURL);
	
?>