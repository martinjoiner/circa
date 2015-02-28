<?php

class Map{

	protected $id = 0;
	var $name = ''; 
	var $width = 0;
	var $height = 0;

	var $arrRoutes = array();
	var $arrProperties = array();





	/**
	 Extracts the basic details for the map and sets the class variables
	*/
	protected function extractMapFromDB(){

		include( $_SERVER['DOCUMENT_ROOT'] . '/db_connect.inc.php' );

		$qry = $db->prepare("	SELECT 	`name`, `width`, `height` 
								FROM 	`map`
								WHERE 	`id` = :mapID 
							");
		$qry->bindValue('mapID', $this->id, PDO::PARAM_INT);
		$qry->execute();
		$rslt = $qry->fetchAll(PDO::FETCH_ASSOC);
		$qry->closeCursor();

		$thisResult = $rslt[0];

		$this->name 		= $thisResult['name'];
		$this->width 		= $thisResult['width'];
		$this->height 		= $thisResult['height'];

	}



	/** 
	 Takes a db query result and loops through creating the route objects in the arrRoutes array
	*/
	protected function processDBResult( $rslt, $pathType = 'ROUTE' ){
		$curID = 0;
		foreach( $rslt as $thisResult ){

			if( $curID != $thisResult['id'] ){

				if( $curID != 0 ){
					$this->makePathType( $curID, $arrPoints, $pathType );
				}

				// Reset the variables
				$arrPoints = array();
				$curID = $thisResult['id'];
			}

			$arrPoints[] = array( 'x'=>$thisResult['x'], 'y'=>$thisResult['y'] );
			
		}
		$this->makePathType( $curID, $arrPoints, $pathType );
	}


	private function makePathType( $id, $arrPoints, $pathType ){
		if( $pathType == 'ROUTE' ){
			$this->arrRoutes[] = new Route( $id, $arrPoints );
		} else if ( $pathType == 'PROPERTY' ){
			$this->arrProperties[] = new Property( $id, $arrPoints );
		}
	}




	/**
	 IN DEV
	*/
	public function placeRandPath(){
		// Know the minimum area of footprint you want to build on
		$desArea = 80 * 80; // Desired area of property

		// Walk away from AAP, until in unoccupied space, set point1.
		// Try stepping 90 deg to AAP.
		// Try stepping closer to AAP.
		// Repeat previous 2 steps until both are failing, set point2.
		// Clone these 2 points and translate them away from their roots by half the distance between them
		// If point3 is in occupied space, move it closer toward point4 and record the distance required to get in free space.
		// Attempt to move point 4 that same distance away, monitoring area, when desired area is reached. Declare the property.

	}




	/**
	 Gets the Average Area of Points on the map. In other words, the population centre
	*/
	public function getAAP(){
		$returnResult = '';
		foreach( $this->arrPaths as $thisPath ){
			$returnResult = $thisPath->getCenter();
		}
		return $returnResult;
	}




	function limitXToBoundaries( $x ){
		if( $x < 0 ){
			return 0;
		} else if( $x > $this->width ){
			return $this->width;
		}
		return $x;
	}




	function limitYToBoundaries( $y ){
		if( $y < 0 ){
			return 0;
		} else if( $y > $this->height ){
			return $this->height;
		}
		return $y;
	}




	/**
	 Takes a co-ordinate and returns true if there is a property sitting on that point or a route intersecting
	*/
	public function isOccupied( $coord ){

		$coordParts = explode(',', trim($coord) );
		$thisX = $coordParts[0];
		$thisY = $coordParts[1];
		$objMath = new Math();
		
		foreach($this->arrPaths as $thisPath ){
		
			$points_polygon = count($thisPath->arrVerticesX);  // number vertices - zero-based array

			if ( $objMath->is_in_polygon($points_polygon, $thisPath->arrVerticesX, $thisPath->arrVerticesY, $thisX, $thisY) ){
				return true;
				//echo '<p>' . $thisX . ':' . $thisY . ' is in polygon! (' . implode(',',$thisPath->arrVerticesX) . '),(' . implode(',',$thisPath->arrVerticesY) . ')' . $points_polygon . '</p>';
			}
			else{ 
				//echo '<p>' . $thisX . ':' . $thisY . ' is not in polygon (' . implode(',',$thisPath->arrVerticesX) . '),(' . implode(',',$thisPath->arrVerticesY) . ')' . $points_polygon . '</p>';
			}

		}
		return false;

	}

}

