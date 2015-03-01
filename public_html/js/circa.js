
var arrPaths = [];
var count = 0;
var mapWidth 


var isPointOnYou = (function( point ){
	var coordParts = point.split(',');
	var x = parseFloat(coordParts[0]);
	var y = parseFloat(coordParts[1]);
	if( x < 0 || y < 0 || x > this.width || y > this.height ){
		return false;
	}
	return true;
});


var Map = (function(){
	this.width = 1200;
	this.height = 800;

	this.isPointOnYou = isPointOnYou;
});

var map = new Map();


/* Returns 4 points that represent a polygon adjascent to one of the vertex */
/* @sideNum *Optional* which vertex it should be adjascent to 				*/
var spawnOffsetSide = (function( sideNum ){
	if(typeof sideNum === 'undefined'){
		sideNum = 1;
	}

	var arrCoords = [];
	var pos = sideNum - 2;
	for (i = 0; i < 4; i++){
		if( pos < 0 ){
			pos = pos + this.arrAbsolutePoints.length;
		} else if ( pos > this.arrAbsolutePoints.length - 1 ){
			pos = 0;
		}
		arrCoords[i] = pos++;
	}

	var firstRoot = this.arrAbsolutePoints[arrCoords[0]]
	var firstPoint = this.arrAbsolutePoints[arrCoords[1]];
	var secondPoint = this.arrAbsolutePoints[arrCoords[2]];
	var secondRoot = this.arrAbsolutePoints[arrCoords[3]];
	
	// Put simply, this says if looking at side 4 the second point is actually the first point
	if( sideNum > this.arrAbsolutePoints.length - 1 ){
		secondPoint = this.arrAbsolutePoints[0];
	}

	var arrAbsolutePoint = [];
	arrAbsolutePoint[0] = projectPath( secondRoot, secondPoint );
	arrAbsolutePoint[1] = ninetyDeg( projectPath( firstRoot, firstPoint) , projectPath( secondRoot, secondPoint ), false );
	arrAbsolutePoint[2] = ninetyDeg( projectPath( secondRoot, secondPoint ),  projectPath( firstRoot, firstPoint), true )
	arrAbsolutePoint[3] = projectPath( firstRoot, firstPoint );

	var arrReturn = [];

	for(var i in arrAbsolutePoint){
		var coordParts = arrAbsolutePoint[i].split(',');
		if( i == 0 ){
			diffX 	= coordParts[0];
			diffY 	= coordParts[1];
		} else {
			var prevCoordParts = arrAbsolutePoint[i-1].split(',');
			diffX = prevCoordParts[0] - coordParts[0];
			diffY = prevCoordParts[1] - coordParts[1];
		}
		arrReturn[i] = parseFloat(diffX).toFixed(3) + ',' + parseFloat(diffY).toFixed(3);
	}

	//console.log(arrAbsolutePoint);
	//console.log(arrReturn);

	return arrReturn;
	
});




/* Randomly varies points 2 and 3 slightly to create organic variation */
var varyMiddleTwo = (function(){
	this.arrOriginalPoints = [];
	this.arrOriginalPoints[1] = this.arrAbsolutePoints[1];
	this.arrOriginalPoints[2] = this.arrAbsolutePoints[2];
	this.arrAbsolutePoints[1] = varyPoint(this.arrAbsolutePoints[1]);
	this.arrAbsolutePoints[2] = varyPoint(this.arrAbsolutePoints[2]);
});




// PORTED TO PHP
// function varyPoint( point ){
// 	coordParts = point.trim().split(',');
// 	var x = parseFloat(coordParts[0]);
// 	var y = parseFloat(coordParts[1]);
// 	for( i = 0; i <= 1; i++){
// 		coordParts[i] = parseFloat(coordParts[i]) + ( Math.random() * 10 ) - 5;
// 	}
// 	return coordParts[0].toFixed(3) + ',' + coordParts[1].toFixed(3);
// }




/* Use the mid point to calculate which point is farthest away from center 	*/
/* and define that as the radius 											*/
var calculateRadii = (function(){
	var center = this.getCenter();
	var farthestPointIndex;
	var farthestPointDistance;
	var nearestPointIndex;
	var nearestPointDistance = 9999999;
	// Loop through all points finding the furthest
	for( var i in this.arrAbsolutePoints ){
		thisDistance = distanceBetween( center, this.arrAbsolutePoints[i] );
		if(nearestPointDistance > thisDistance){
			nearestPointIndex = i;
			nearestPointDistance = thisDistance;
		}
		if(farthestPointDistance < thisDistance){
			farthestPointIndex = i;
			farthestPointDistance = thisDistance;
		}
	}
	this.nearestPointIndex 	= nearestPointIndex;
	this.nearestRadius 		= nearestPointDistance;
	this.farthestPointIndex = farthestPointIndex;
	this.farthestRadius 	= farthestPointDistance;
});



/* Return the distance between 2 points */
function distanceBetween( pointA, pointB ){

	coordParts = pointA.trim().split(',');
	var x1 = parseFloat(coordParts[0]);
	var y1 = parseFloat(coordParts[1]);

	coordParts = pointB.trim().split(',');
	var x2 = parseFloat(coordParts[0]);
	var y2 = parseFloat(coordParts[1]);

	xs = x2 - x1;
	xs = xs * xs;

	ys = y2 - y1;
	ys = ys * ys;

	return Math.sqrt( xs + ys );
}




/**
 Renders the path on the canvas  
 @skvConfig can contain 'class', 'id', 'd'
*/
function renderPath( skvPath ){

	var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	if( typeof skvPath['class'] !== 'undefined' ){
		path.setAttribute("class", skvPath['class']);
	}
	
	if( typeof skvPath['id'] !== 'undefined' ){
		path.setAttribute("id", skvPath['id'] );
	}

	if( typeof skvPath['d'] !== 'undefined' ){
		path.setAttribute("d", skvPath['d'] );
	}

	if( typeof skvPath['stroke-width'] !== 'undefined' ){
		path.setAttribute("stroke-width", skvPath['stroke-width'] );
	}

	$('svg').append(path); 
}




/* Returns boolean of whether or not all points in the */
/* polygon are within the boundaries of the map ------ */
var allPointsOnMap = (function(){
	//console.warn( "allPointsOnMap() is checking " + this.arrAbsolutePoints );
	for(var i in this.arrAbsolutePoints){
		if( !map.isPointOnYou( this.arrAbsolutePoints[i] ) ){
			return false;
		}
	}
	return true;
});



/* Path object 															*/
/* @id String A web standard id 										*/
/* @d String SVG standard path definition 								*/
var Path = (function(id, d){

	this.spawnOffsetSide = spawnOffsetSide;
	this.getCenter 		= getCenter;
	this.calculateRadii = calculateRadii;
	this.allPointsOnMap = allPointsOnMap;
	this.varyMiddleTwo 	= varyMiddleTwo;

	this.id = id;
	this.d = d;

	this.arrVerticesX = [];
	this.arrVerticesY = [];
	this.arrAbsolutePoints = [];

	var reg = /[0-9-.]*,[0-9-.]*/g;
	this.arrPoints = this.d.match(reg);

	cursorX = 0;
	cursorY = 0;
	for(var i in this.arrPoints){

		cursorX = cursorX + parseFloat( this.arrPoints[i].split(',')[0] );
		cursorY = cursorY + parseFloat( this.arrPoints[i].split(',')[1] );

		this.arrVerticesX[i] = cursorX;
		this.arrVerticesY[i] = cursorY;

		this.arrAbsolutePoints[i] = cursorX + ',' + cursorY;
	}

});



/* Returns the adjascent point based on 2 points 					*/
/* @coord1 															*/
/* @coord2 															*/
/* @clockwide *Optional* - Boolean - Defaults to true 				*/
function ninetyDeg( coord1, coord2, clockwise ){
	if(typeof clockwise === 'undefined'){
		clockwise = true;
	}
	var coordParts = coord1.trim().split(',');
	var x1 = parseFloat(coordParts[0]);
	var y1 = parseFloat(coordParts[1]);
	coordParts = coord2.trim().split(',');
	var x2 = parseFloat(coordParts[0]);
	var y2 = parseFloat(coordParts[1]);

	var x3;
	var y3;
	if( clockwise ){
		x3 = x2 + ( y2 - y1 );
		y3 = y2 - ( x2 - x1 );
	} else {
		x3 = x2 - ( y2 - y1 );
		y3 = y2 + ( x2 - x1 );
	}

	return x3.toFixed(3) + ',' + y3.toFixed(3);
}




/* Returns the co-ordinates of the midpoint between 2 points 	*/
/* @pointA 														*/
/* @pointB 														*/
function midPoint( pointA, pointB ){

	var aParts = pointA.split(',');
	var bParts = pointB.split(',');

	var x1 = parseFloat(aParts[0]); 
	var x2 = parseFloat(bParts[0]); 

	var y1 = parseFloat(aParts[1]); 
	var y2 = parseFloat(bParts[1]); 

	var avX = (x1 + x2) / 2;
	var avY = (y1 + y2) / 2;

	return avX.toFixed(3) + ',' + avY.toFixed(3);
} 




/* Tests all paths on map to see if point is inside */
/* @arrPoints Array of co-ordinates of points 		*/
/* @x 												*/
/* @y 												*/
function pointIsInPath( thisPath, x, y ){
	var cntPolygonPoints = thisPath.arrVerticesX.length;  // number vertices = number of points in a self-closing polygon
	if ( is_in_polygon( cntPolygonPoints, thisPath.arrVerticesX, thisPath.arrVerticesY, x, y) ){
		return true;
	}
	return false;
}




/* Takes a polygon and the co-ordinates of a point ----------------------------------------- */
/* and checks if the point is inside the polygon   ----------------------------------------- */
// function is_in_polygon( cntPolygonPoints, vertices_x, vertices_y, longitude_x, latitude_y){

// 	var i = j = c = point = 0;
// 	for (i = 0, j = cntPolygonPoints; i <= cntPolygonPoints; j = i++) {
// 		point = i;
// 		if( point == cntPolygonPoints )
// 			point = 0;
// 		if ( ((vertices_y[point]  >  latitude_y != (vertices_y[j] > latitude_y)) &&
// 		(longitude_x < (vertices_x[j] - vertices_x[point]) * (latitude_y - vertices_y[point]) / (vertices_y[j] - vertices_y[point]) + vertices_x[point]) ) )
// 		c = !c;
// 	}
// 	return c;

// }




/* Populated in input box with mouse coordinates for debugging ------------------------ */
(function() {
    window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        event = event || window.event; // IE-ism
        document.getElementById('mouseCoord').value = event.clientX + ',' + event.clientY;
    }
})();




/* Handles click event on mask which is the 	--------------- */
/* transparent layer that floats above the SVG 	--------------- */
$('#mask').click( function(){
	var mouseMode = $('input[name=mouseMode]:checked').val();
	var mouseCoord = document.getElementById('mouseCoord').value;

	var arrCoordParts = mouseCoord.split(',');
	var x = arrCoordParts[0];
	var y = arrCoordParts[1];

	if( mouseMode === 'isOccupied' ){
		isOccupied( x, y );
	} else if( mouseMode === 'redDot' ){
		redDot( x, y );
	} else if( mouseMode === 'placeProperty' ){
		placeProperty( x, y );
	} else if( mouseMode === 'dropBomb' ){
		dropBomb( x, y );
	}
	
});




/* Tests all paths on map to see if point is inside */
/* @coord co-ordinates of point ------------------- */ 
function isOccupied( x, y ){

	$.ajax({
        type: "GET",
        url: "/isOccupied/",
        data: { 'x': x, 'y': y },
        dataType: "json"
    }).done(function(data) {
        console.log( data );
    });

}




/* Places a dot on the canvas ------------------------------------------------- */
/* For debugging purposes ----------------------------------------------------- */
/* @cord The co-ordinates of where the dot should be placed ------------------- */
/* @colour *Optional* - Defaults to 'red' ------------------------------------- */
function redDot( x, y, colour ){

	if(typeof colour === 'undefined'){
		colour = 'red';
	}

	var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	circle.setAttribute("cx", x );
	circle.setAttribute("cy", y );
	circle.setAttribute("r", "2" );
	circle.setAttribute("fill", colour );

	$('svg').append(circle); 
}




function placeProperty( x, y ){
	// Send AJAX request to place a property 
	$.ajax({
        type: "GET",
        url: "/placeProperty/",
        data: { 'x': x, 'y': y },
        dataType: "json"
    }).done(function(data) {
    	console.log( data );
        if( data.success ){
        	renderPath( data['arrPath'] );
        }
    });
}




/* Handles click event to start spawning 	*/
$('#btnSpawn').click( function(){
	spawn();
});




$('#btnInitXRoads').click( function(){
	
	$.ajax({
        type: "GET",
        url: "/initCrossRoads/",
        dataType: "json"
    }).done(function(data) {

        // If a successful deletion has occured, remove the element from the DOM
        if( data.success ){
        	var i = iLimit = 0;
	        for( i = 0, iLimit = data.arrPaths.length; i < iLimit; i++ ){
	        	renderPath( data.arrPaths[i] );
	        }
        }

    });

});




$('#btnDrawFronts').click( function(){
	
	$.ajax({
        type: "GET",
        url: "/getPropertyFronts/",
        dataType: "json"
    }).done(function(data) {

        // If a successful deletion has occured, remove the element from the DOM
        var i = iLimit = 0;
        for( i = 0, iLimit = data.length; i < iLimit; i++ ){
        	renderPath( data[i] );
        }

    });

});




$('#btnDeleteFronts').click( function(){
	$('svg .Front').remove();
});




/* A function that creates buildings. Then calls itself.	*/
function spawn(){

	// Generate a pointer to a random existing path to build next to
	var pathPointer = Math.floor( Math.random() * ( arrPaths.length - 1 ) );
	console.log("Path Pointer: " + pathPointer);

	// Generate a pointer to a random side of the building to build adjascent to
	var sidePointer = Math.floor( Math.random() * 4 );
	console.log("Side Pointer: " + sidePointer);

	var arrPoints = arrPaths[pathPointer].spawnOffsetSide(sidePointer);
	var d = 'M ' + arrPoints.join(' ') + ' z';

	var id = "testPath";
	var testPath = new Path( id, d);
	testPath.varyMiddleTwo();
	testPath.calculateRadii();

	var valid = true;
	for( var i in arrPaths ){
		if( polyCollision( testPath, arrPaths[i] ) ){
			console.warn("Invalid: Collision");
			valid = false;
		}
	}

	if( !testPath.allPointsOnMap() ){
		console.warn("Invalid: Some points were not on map");
		valid = false;
	}

	window.setTimeout( spawn, 10);
}



/* Handles click event to stop spawning 	*/
$('#btnStop').click( function(){
	var id = window.setTimeout(function() {}, 0);
	while (id--) {
	    window.clearTimeout(id);
	}
});



/* Tests 2 polygons to see if they are over lapping */
/* http://content.gpwiki.org/index.php/Polygon_Collision */
function polyCollision( poly1, poly2 ){
	var collision = true;

	var distanceBetweenCentres = distanceBetween( poly1.getCenter(), poly2.getCenter() );

	// First check if distance between mid points of polygons is more than sum of maximum radius
	// If so then there definitely cannot be a collision so: return false;
	var sumOfRadii = poly1.farthestRadius + poly1.farthestRadius;
	if( distanceBetweenCentres > sumOfRadii ){
		console.warn('polyCollision(): Failed at stage 1');
		return false;
	}

	// Next check if distance is less than either path's nearestRadius
	// If so there definitely is a collision. This is good for checking paths that are exactly on top of each other.
	if( distanceBetweenCentres < poly1.nearestRadius || distanceBetweenCentres < poly2.nearestRadius ){
		console.warn('polyCollision(): Failed at stage 2');
		return true;
	}

	// Next check if any of poly1's points are inside poly2, If so: return true;
	for( var i in poly1.arrAbsolutePoints ){
		thisPointParts = poly1.arrAbsolutePoints[i].split(',');
		thisX = thisPointParts[0];
		thisY = thisPointParts[1];
		if( pointIsInPath( poly2, thisX, thisY ) ){
			return true;
		}
	}
	// Then check if any of poly2's points are inside poly1, If so: return true;
	for( var i in poly2.arrAbsolutePoints ){
		thisPointParts = poly2.arrAbsolutePoints[i].split(',');
		thisX = thisPointParts[0];
		thisY = thisPointParts[1];
		if( pointIsInPath( poly1, thisX, thisY ) ){
			return true;
		}
	}

	// Finally use the more expensive method of separating Axis which will account for rare cases when mid sections overlap
	//return collision;
}


