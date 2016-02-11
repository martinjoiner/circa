<?php

/**
 * A checker to see if 2 properties overlap/collide
 */
class PropertyCollision{


	/**
	 * Tests 2 properties to see if they are overlapping 
	 * http://content.gpwiki.org/index.php/Polygon_Collision 
	 *
	 * @param {Property} $property1
	 * @param {Property} $property2
	 *
	 * @return {boolean} Was a collision detected?
	 */
	public function isCollision( Property $property1, Property $property2 ){

		$objMath = new Math();

		$arrProperty1Data = $property1->getCenterData();
		$arrProperty2Data = $property2->getCenterData();

		$distanceBetweenCentres = $objMath->distanceBetween( $arrProperty1Data['arrCenterPoint'], $arrProperty2Data['arrCenterPoint'] );
		$sumOfFarthestRadii = $arrProperty1Data['farthestRadius'] + $arrProperty2Data['farthestRadius'];

		// Firstly: If distance between mid points is more than sum of maximum radius
		// there definitely cannot be a collision
		if( $distanceBetweenCentres > $sumOfFarthestRadii ){
			//console.warn('polyCollision(): Failed at stage 1');
			return false;
		}

		// Next, check if distance is less than either path's nearestRadius
		// If so there definitely *is* a collision! This is good for checking paths that are exactly on top of each other.
		if( $distanceBetweenCentres < $arrProperty1Data['nearestRadius'] || $distanceBetweenCentres < $arrProperty2Data['nearestRadius'] ){
			//console.warn('polyCollision(): Failed at stage 2');
			return true;
		}

		// Next check if any of $arrPoints1's points are inside $arrPoints2, If so: return true;
		foreach( $property1->arrPoints as $arrThisPoint ){
			$points_polygon = count($property2->arrPoints);  // number vertices - zero-based array
			if( $objMath->isInPolygon($points_polygon, $property2->arrVerticesX, $property2->arrVerticesY, $arrThisPoint['x'], $arrThisPoint['y'] ) ){
				return true;
			}
		}

		// Next check if any of $arrPoints1's points are inside $arrPoints2, If so: return true;
		foreach( $property2->arrPoints as $arrThisPoint ){
			$points_polygon = count($property1->arrPoints);  // number vertices - zero-based array
			if( $objMath->isInPolygon($points_polygon, $property1->arrVerticesX, $property1->arrVerticesY, $arrThisPoint['x'], $arrThisPoint['y'] ) ){
				return true;
			}
		}

		// TODO: Finally use the more expensive method of separating Axis which will account for very rare cases when mid sections overlap

		// If we've reached this far without detecting a collision, return false
		return false;
	}


}
