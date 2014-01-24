The Traveling Slurpyman

A Javascript application by Brent Mello


Summary
Given a starting and optional ending point, the application will calculate and display the optimal route for reaching your destination and intersecting up to eight 7-Elevens along the way.


Files
index.html- A minimalistic page for hosting the application.
travSlurpyMan.js- Initializes the application and acts as controller for index.html.
calculateRoute.js- Calculates and displays the slurpy route.


Algorithm
1: A rectangle is drawn around the origin and destination (if it was included). This acts as the search area.
2: A placeService is used to gather the locations of all 7-Elevens in the area into an array.
3: A directionsService prioritizes these waypoints by way of the tabu algorithm.
4: Waypoints are then eliminated if they are no closer to the next point than the previous point.

Algorithm notes
1: The origin and destination will never sit on the corners of the search area. There will always be extra room, based on the total distance from origin to destination. This allows for a 7-Eleven which is only a block away in the opposite direction to be included.
2: A slight problem here covered in the "Issues" section.
3: This is conjecture. Google may use the simulated annealing method instead, though it's less likely. A description of both algorithms is available here: http://www.ida.liu.se/~zebpe/heuristic/papers/parallel_alg.pdf
4: Like step 1, there is a level of wiggle room here, again based on the total distance between the origin and the destination.


Issues
The nearbySearch for 7-Elevens is conducted by keyword. Around five percent of the results are not 7-Elevens, but simply mention 7-Eleven in the description or by customer review. Furthermore, when the openNow field is set to true, none of the 7-Elevens are found.
The search area for an origin with no destination needs a special case to function better.

Solutions
Compile a text file of all 7-Elevens in Chicago. Pro: Geocoding would no longer be necesarry for computing coordinates. Con: This benefit will only apply to Chicago.


To do
Have calculateRoute present user with a choice of multiple routes with different numbers of 7-Eleven waypoints and appropriate travel times. The user will select which one will be displayed by clickable button.
Modify the search area and algorithm for an origin with no destination.
Include original algorithm for when more than eight 7-Elevens are in the search area.
Test cross browser compatibility.
Test smart phone/tablet compatibility.


Original algorithm
My original solution used the nearest neighbor algorithm modified by optmizeRoute. If the nearest neighbor was deemed a skipPoint, the next nearest neighbor was chosen, and so on.
This was abandoned in favor of Google Map's prioritize waypoints algorithm modified by optmizeRoute. It is much faster, but does not provide as many waypoints (on average).
The original algorithm may be included and used when more than eight 7-Elevens are found in the search area. Then we are talking about ninety plus fl oz of slurpy, which while possible, is not advisable.

Alternative algorithm
If all 7-Eleven locations in Chicago are included via a text file, then the distances between all those points (separated by region) could be included in a look up table.
Then skipPoint could be modified (and renamed) to provide which stores in what order constitutes the optimal route.
The only question being will accessing a look up table with so many entries bog the effeciency down.
