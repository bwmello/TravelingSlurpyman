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
3: A directionsService prioritizes these waypoints by way of the tabu algorithm (unconfirmed).
4: Waypoints are then eliminated if they are no closer to the next point than the previous point.

Algorithm notes
1: The origin and destination will never sit on the corners of the search area. There will always be extra room, based on the total distance from origin to destination. This allows for a 7-Eleven which is only a block away in the opposite direction to be included.
2: A slight problem here covered in the "Issues" section.
3: This is conjecture. Google may use the simulated annealing method instead, though it's less likely. A description of both is available here: http://www.ida.liu.se/~zebpe/heuristic/papers/parallel_alg.pdf
4: Like step 1, there is a level of wiggle room here, again based on the total distance between the origin and the destination.


Issues
The nearbySearch for 7-Elevens is conducted by keyword. Five to ten percent of the results are not 7-Elevens, but simply mention 7-Eleven in the description or by customer review.
The search area for an origin with no destination needs a special case to function better.

Solutions
Compile a text file of all 7-Elevens in Chicago. Pro: Geocoding would no longer be necesarry for computing coordinates. Con: This benefit will only apply to Chicago.


To do
Have calculateRoute present user with a choice of multiple routes with different numbers of 7-Eleven waypoints and appropriate travel times. The user will select which one will be displayed by clickable button.
Change the search area for an origin with no destination.
Check cross browser compatibility.
Check smart phone/tablet compatibility.