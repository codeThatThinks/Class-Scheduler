var localStorageSupported = false;
if(typeof(Storage) !== "undefined")
	localStorageSupported = true;

var classes = new Array();
if(localStorageSupported && window.localStorage.getItem("classSchedulerClassList") !== null)
{
	classes = JSON.parse(window.localStorage.getItem("classSchedulerClassList"));
	for(var i = 0; i < classes.length; i++)
	{
		if(classes[i].sections.length != 1)
		{
			classes[i].currentSection = null;
		}
	}
}
var possibleSchedules = new Array();

var dayOfWeek = ["M", "Tu", "W", "Th", "F"];

/*
var residenceHalls = {
	"Bulger": [41.077116, -81.512418],
	"Exchange": [41.073867, -81.516074],
	"Honors": [41.077693, -81.511555],
	"Orr": [41.077565, -81.511867],
	"Quaker": [41.080597, -81.515649],
	"Ritchie": [41.076867, -81.512022],
	"Sisler-McFawn": [41.077166, -81.513225],
	"South": [41.073113, -81.515492],
	"Spanton": [41.077400, -81.512855],
	"University Edge": [41.072367, -81.513894]
};
*/

var campusBuildings = {
	'ASEC': [41.075990, -81.513830],
	'Ayer Hall': [41.076276, -81.513030],
	'Bierce Library': [41.076821, -81.510646],
	'Buchtel Hall': [41.075888, -81.511140],
	'Business Admin.': [41.077634, -81.517607],
	'Coleman Common': [41.075356, -81.511132],
	'College of Arts and Sci.': [41.077595, -81.510625],
	'Crouse Hall': [41.076320, -81.512385],
	'EJ Thomas': [41.078401, -81.514735],
	'Folk Hall': [41.073623, -81.517736],
	'Goodyear Polymer Center': [41.076778, -81.514534],
	'Guzzetta Hall': [41.077660, -81.514040],
	'InfoCision Stadium': [41.073119, -81.509375],
	'JAR': [41.076210, -81.508739],
	'Knight Chemical Lab': [41.076119, -81.515013],
	'Kolbe Hall': [41.076299, -81.510011],
	'Leigh Hall': [41.076260, -81.510730],
	'Mary Gladwin Hall': [41.075636, -81.514956],
	'Ocasek Natatorium': [41.074717, -81.507493],
	'Olin Hall': [41.076925, -81.508817],
	'Polsky': [41.078634, -81.519461],
	'Rec': [41.074833, -81.508812],
	'Schrank North': [41.075001, -81.513765],
	'Schrank South': [41.074476, -81.513773],
	'Simmons Hall': [41.078459, -81.511747],
	'Student Union': [41.075663, -81.512458],
	'West Hall': [41.076933, -81.515892],
	'Whitby Hall': [41.076256, -81.514560],
	'Zook Hall': [41.076252, -81.511564]
};

/*
var map;
var mapObjects;
*/

function Class(department, course, name)
{
	this.department = department;
	this.course = course;
	this.name = name;
	this.sections = new Array();

	this.currentSection = null;

	this.addSection = function(section)
	{
		this.sections.push(section);
	}
}

function Section(location, days, startTime, endTime)
{
	this.location = location;
	this.days = days;
	this.startTime = startTime;
	this.endTime = endTime;
}

function calculateDistance(lat1, lon1, lat2, lon2)
{
	var R = 6371000; // metres
	var radlat1 = lat1 * (Math.PI / 180);
	var radlat2 = lat2 * (Math.PI / 180);
	var radlat = (lat2-lat1) * (Math.PI / 180);
	var radlon = (lon2-lon1) * (Math.PI / 180);
	var a = Math.sin(radlat/2) * Math.sin(radlat/2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.sin(radlon/2) * Math.sin(radlon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return Math.round(R * c);
}

function updateClassList()
{
	// save class list in localStorage
	if(localStorageSupported)
		window.localStorage.setItem("classSchedulerClassList", JSON.stringify(classes));

	$('#classList tr').not("[id='classListHeader']").not("[id='classListPlaceholder']").remove();

	if(classes.length != 0)
	{
		for(var i = 0; i < classes.length; i++)
		{
			if(classes[i].currentSection == null)
			{
				var classSection = '<td colspan="3">No section selected.</td>';
			}
			else
			{
				var classSection = '<td>' + classes[i].sections[classes[i].currentSection].location + '</td>' +
					 	'<td>' + classes[i].sections[classes[i].currentSection].days.join(", ") + '</td>' +
					 	'<td>' + classes[i].sections[classes[i].currentSection].startTime + ' - ' + classes[i].sections[classes[i].currentSection].endTime + '</td>';
			}

			$('#classList').append('<tr id="' + i + '">' +
				'<td>' + classes[i].department + '</td>' +
				'<td>' + classes[i].course + '</td>' +
				'<td>' + classes[i].name + '</td>' +
				classSection +
				'<td><button class="btn btn-danger" id="btnDeleteClass">Delete</button></td>' +
				'</tr>');
		}

		$('#classList tr#classListPlaceholder').hide();
		$('#btnCreateSchedule').removeAttr("disabled");

		$('#classList #btnDeleteClass').click(function()
		{
			classes.splice($(this).parents('#classList tr').attr('id'), 1);
			updateClassList();
		});
	}
	else
	{
		$('#classList tr#classListPlaceholder').show();
		$('#btnCreateSchedule').attr("disabled", "disabled");
	}

}

/*
	formattedTime = "12:00am"
*/
function formattedTimeToMinutes(formattedTime)
{
	if(formattedTime == "12:00am")
		return 0;

	// get hours
	var hours = parseInt(formattedTime.substring(0, formattedTime.indexOf(":")));

	// get minutes
	var minutes = parseInt(formattedTime.substring(formattedTime.indexOf(":") + 1, formattedTime.length - 2));

	// compensate for pm
	if(formattedTime.indexOf("pm") != -1 && hours != 12)
	{
		hours += 12;
	}
	
	return hours * 60 + minutes;
}

function minutesToFormattedTime(minutes)
{
	if(minutes == 0 || minutes == 1440)
		return "12:00am";

	var hours = Math.floor(minutes / 60).toString();
	var minutes = Math.round(minutes - hours * 60).toString();

	if(minutes == "0")
		minutes += "0";

	if(hours > 12)
	{
		hours -= 12;
		return hours + ":" + minutes + "pm";
	}
	else
	{
		return hours + ":" + minutes + "am";
	}
}

/*
	return value:
	[
		[	// each day
			[class, 540, 590],	// each class, time is minutes since start of day (12:00am)
			...
		],
		...
	]
	schedule = Array
		index -> class
		value -> section
	days = ["M", "Tu", "W"]
*/
function getScheduleIntervals(schedule, days)
{
	if(days == null) days = dayOfWeek;

	// initialize array
	var intervals = new Array();
	for(var i = 0; i < days.length; i++)
	{
		intervals[i] = new Array();
	}

	// loop through each class and get intervals
	for(var i = 0; i < schedule.length; i++)
	{
		// convert h:mma to minutes since 12:00am
		var startTime = formattedTimeToMinutes(classes[i].sections[schedule[i]].startTime);
		var endTime = formattedTimeToMinutes(classes[i].sections[schedule[i]].endTime);
		if(endTime == 0 && startTime != 0)
		{
			// when class goes from some time to 12:00am, then 12:00am is actually on the next day
			endTime = 1440;
		}

		// add intervals to their respective days in the intervals array
		// loop through each day for the class
		for(var j = 0; j < classes[i].sections[schedule[i]].days.length; j++)
		{
			var dayIndex = days.indexOf(classes[i].sections[schedule[i]].days[j]);
			if(dayIndex != -1)
			{
				intervals[dayIndex].push([i, startTime, endTime]);
			}
		}
	}

	// for each day, sort intervals by starting value ascending
	for(var i = 0; i < intervals.length; i++)
	{
		intervals[i].sort(function(a,b)
		{
			return a[1] - b[1];
		});
	}

	return intervals;
}

/*
	schedule = Array
		index -> class
		value -> section
	day = "M"
*/
function getSchedulePoints(schedule, day)
{
	var intervalsForDay  = getScheduleIntervals(schedule, [day])[0];
	var points = new Array();

	// loop through each class
	for(var i = 0; i < intervalsForDay.length; i++)
	{
		// get point and add it to points array
		var location = classes[intervalsForDay[i][0]].sections[schedule[intervalsForDay[i][0]]].location;
		points.push(campusBuildings[location]);
	}

	return points;
}

/*
	schedule = Array
		index -> class
		value -> section
	day = "M"
*/
function getScheduleWalkingDistance(schedule, day)
{
	var distance = 0;
	var points = getSchedulePoints(schedule, day);

	// loop through each point
	for(var i = 0; i < points.length - 1; i++)
	{
		distance += calculateDistance(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
	}

	return distance;
}

/*
	schedule = Array
		index -> class
		value -> section
	day = "M"
*/
function getScheduleNumClassesForDay(schedule, day)
{
	return getScheduleIntervals(schedule, day)[0].length;
}

function getScheduleFirstClassTimeForDay(schedule, day)
{
	return getScheduleIntervals(schedule, day)[0][0][1];
}

// recursively create schedules for each combination of sections from each class
/*
	schedule = Array
		index -> class
		value -> section
*/
function createSchedules(currentClass, schedule)
{
	// loop through sections of current class
	for(var i = 0; i < classes[currentClass].sections.length; i++)
	{
		// copy schedule array so that it can be appended
		var newSchedule = schedule.slice();

		// add current section to schedule
		newSchedule.push(i);

		// if last class, then schedule is complete
		if(currentClass == classes.length - 1)
		{
			// validate schedule and run statistics so that schedules can be compared
			analyzeSchedule(newSchedule);

			// update progress dialog box
			var currentNum = parseInt($('#progressBox #currentNum').text()) + 1;
			$('#progressBox #currentNum').text(currentNum);
			$('#progressBox #bar').css("width", (currentNum / parseFloat($('#progressBox #totalNum').text()) * 100 + "%"));
		}
		else
		{
			// otherwise, continue adding sections of other classes
			createSchedules(currentClass + 1, newSchedule);
		}
	}
}

/*
	schedule = Array
		index -> class
		value -> section
*/
function analyzeSchedule(schedule)
{
	// check for conflicts
	if(!doesScheduleConflict(schedule))
	{
		// calculate average walking distance
		var averageWalkingDistance = Math.floor(((getScheduleWalkingDistance(schedule, "M") + getScheduleWalkingDistance(schedule, "Tu") + getScheduleWalkingDistance(schedule, "W") + getScheduleWalkingDistance(schedule, "Th") + getScheduleWalkingDistance(schedule, "F")) / 5) * 100) / 100;
		
		// calculate max walking distance
		var maxWalkingDistance = Math.floor(((getScheduleWalkingDistance(schedule, "M") + getScheduleWalkingDistance(schedule, "Tu") + getScheduleWalkingDistance(schedule, "W") + getScheduleWalkingDistance(schedule, "Th") + getScheduleWalkingDistance(schedule, "F")) * 100) / 100);

		// calculate average number of classes per day
		var averageClassesPerDay = Math.floor(((getScheduleNumClassesForDay(schedule, "M") + getScheduleNumClassesForDay(schedule, "Tu") + getScheduleNumClassesForDay(schedule, "W") + getScheduleNumClassesForDay(schedule, "Th") + getScheduleNumClassesForDay(schedule, "F")) / 5) * 100) / 100;

		// calculate max number of classes per day
		var maxClassesPerDay = Math.max(getScheduleNumClassesForDay(schedule, "M"), getScheduleNumClassesForDay(schedule, "Tu"), getScheduleNumClassesForDay(schedule, "W"), getScheduleNumClassesForDay(schedule, "Th"), getScheduleNumClassesForDay(schedule, "F"));

		// calculate average first class time
		var averageFirstClassTime = minutesToFormattedTime((getScheduleFirstClassTimeForDay(schedule, "M") + getScheduleFirstClassTimeForDay(schedule, "Tu") + getScheduleFirstClassTimeForDay(schedule, "W") + getScheduleFirstClassTimeForDay(schedule, "Th") + getScheduleFirstClassTimeForDay(schedule, "F")) / 5);
		
		// calculate earliest class
		var earliestClass = minutesToFormattedTime(Math.min(getScheduleFirstClassTimeForDay(schedule, "M"), getScheduleFirstClassTimeForDay(schedule, "Tu"), getScheduleFirstClassTimeForDay(schedule, "W"), getScheduleFirstClassTimeForDay(schedule, "Th"), getScheduleFirstClassTimeForDay(schedule, "F")));

		possibleSchedules.push({"schedule": schedule, "avgWalkingDistance": averageWalkingDistance, "maxWalkingDistance": maxWalkingDistance, "avgClassesPerDay": averageClassesPerDay, "maxClassesPerDay": maxClassesPerDay, "avgFirstClassTime": averageFirstClassTime, "earliestClass": earliestClass});
	}
}

/*
	returns:
		true: conflicts detected
		false: no conflicts
	schedule = Array
		index -> class
		value -> section
*/
function doesScheduleConflict(schedule)
{
	// get class time intervals
	var intervals = getScheduleIntervals(schedule);

	// check for overlap between intervals
	// loop through each day
	for(var i = 0; i < intervals.length; i++)
	{
		// loop through each class except last
		for(var j = 0; j < intervals[i].length - 1; j++)
		{
			// next classes must start after first class ends
			// check next classes
			for(var k = j + 1; k < intervals[i].length; k++)
			{
				// if start time of next class < end time of current class
				if(intervals[i][k][1] < intervals[i][j][2])
				{
					// overlapping classes
					return true;
				}
			}
		}
	}

	return false;
}

function rankSchedules()
{
	// clear possible schedules table
	$('#possibleSchedules tr').not("[id='possibleSchedulesHeader']").remove();

	if(possibleSchedules.length != 0)
	{
		// populate table with possibleSchedules array
		for(var i = 0; i < possibleSchedules.length; i++)
		{
			$('#possibleSchedules').append('<tr id="' + i + '">' +
				'<td><a class="star btn btn-default" href="#" role="button"><span class="glyphicon glyphicon-star" aria-hidden="true"></span></a></td>' +
				'<td>' + possibleSchedules[i]["avgWalkingDistance"] + ' m</td>' +
				'<td>' + possibleSchedules[i]["maxWalkingDistance"] + ' m</td>' +
				'<td>' + possibleSchedules[i]["avgClassesPerDay"] + '</td>' +
				'<td>' + possibleSchedules[i]["maxClassesPerDay"] + '</td>' +
				'<td>' + possibleSchedules[i]["avgFirstClassTime"] + '</td>' +
				'<td>' + possibleSchedules[i]["earliestClass"] + '</td>' +
				'<td><button id="btnSelectSchedule" class="btn btn-default">Select</button></td>' +
				'</tr>');
		}
	}
	else
	{
		$('#noSchedulesError').show();
	}

	// handle select schedule button clicks
	$('#possibleSchedules #btnSelectSchedule').click(function()
	{
		$('#possibleSchedules tr').removeClass("active");

		$('#scheduleStats').show();
		$(this).parents('#possibleSchedules tr').addClass("active");

		var schedule = possibleSchedules[$(this).parents('#possibleSchedules tr').attr("id")]["schedule"];

		displaySchedule(schedule);

		// disable button for currently selected schedule
		$('#possibleSchedules #btnSelectSchedule').removeAttr("disabled");
		$(this).attr("disabled", "disabled");
	});

	$('.star').click(function(e)
	{
		if($(this).hasClass("btn-default"))
		{
			$(this).removeClass('btn-default');
			$(this).addClass('btn-warning');
		}
		else if($(this).hasClass('btn-warning'))
		{
			$(this).addClass('btn-default');
			$(this).removeClass('btn-warning');
		}

		e.preventDefault();
	});
}

/*
	schedule = Array
		index -> class
		value -> section
*/
function displaySchedule(schedule)
{
	// select sections for each class
	for(var i = 0; i < schedule.length; i++)
	{
		classes[i].currentSection = schedule[i];
	}
	updateClassList();

	// map points
	// tbd

	// graph walking distance and classes per day
	var distances = new Array();
	var numClasses = new Array();
	var firstClassTime = new Array();
	
	for(var i = 0; i < dayOfWeek.length; i++)
	{
		distances.push({"day": dayOfWeek[i], "distance": getScheduleWalkingDistance(schedule, dayOfWeek[i])});
		numClasses.push({"day": dayOfWeek[i], "numClasses": getScheduleNumClassesForDay(schedule, dayOfWeek[i])});
		firstClassTime.push({"day": dayOfWeek[i], "firstClassTime": getScheduleFirstClassTimeForDay(schedule, dayOfWeek[i]) / 60});
	}

	$('#graphWalkingTimes').html("");
	new Morris.Bar({
		element: 'graphWalkingTimes',
		data: distances,
		xkey: 'day',
		ykeys: ['distance'],
		labels: ['Walking Distance (m)']
	});
	$('#graphClassesPerDay').html("");
	new Morris.Bar({
		element: 'graphClassesPerDay',
		data: numClasses,
		xkey: 'day',
		ykeys: ['numClasses'],
		labels: ['# of Classes']
	});
	$('#graphFirstClassTimes').html("");
	new Morris.Bar({
		element: 'graphFirstClassTimes',
		data: firstClassTime,
		xkey: 'day',
		ykeys: ['firstClassTime'],
		labels: ['Time'],
		hoverCallback: function(index, options, content, row) {
			return minutesToFormattedTime(row.firstClassTime * 60);
		}
	});

	// display schedule
	$('#graphSchedule .day .section').remove();
	// loop through each day
	for(var i = 0; i < dayOfWeek.length; i++)
	{
		var intervalsForDay = getScheduleIntervals(schedule, [dayOfWeek[i]])[0];

		// loop through each class
		for(var j = 0; j < intervalsForDay.length; j++)
		{
			var startTime = intervalsForDay[j][1] / 60;		// convert to hours
			var endTime = intervalsForDay[j][2] / 60;
			var offset = (startTime - 6) * 60;
			var height = (endTime - startTime) * 60;
			$('#graphSchedule #' + dayOfWeek[i]).append('<div class="section" style="top: ' + offset + 'px; height: ' + height + 'px">' + classes[intervalsForDay[j][0]].name + '</div>');
		}
	}
}

$(document).ready(function()
{
	/*
	// residence hall dropdown
	for(var key in residenceHalls)
	{
		$('#residenceHall').append('<option value="' + key + '">' + key + '</option>');
	}
	$('#residenceHall').attr("selectedIndex", "0");
	*/

	// location typeahead
	$('#sectionForm #sectionLocation').typeahead({source: $.map(campusBuildings, function(element, key){return key;})});

	/*
	// set up map
	map = L.map('map').setView([41.076, -81.513], 16);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    minZoom: 15,
	    maxZoom: 19,
	    id: 'codethatthinks.o6gj3257',
	    accessToken: 'pk.eyJ1IjoiY29kZXRoYXR0aGlua3MiLCJhIjoiY2loM2xuNnFsMHh5ZXZrbTU2bHI0eXVqdCJ9.0M-qoRPk2XpkyOTsPsOQ8Q'
	}).addTo(map);
	*/

	// populate table with class list
	updateClassList();

	$('#sectionStartTime, #sectionEndTime').focusout(function()
	{
		if($(this).val() != "")
		{
			$(this).val((moment($(this).val(), "h:mma").format("h:mma")));
		}
	});

	$('#btnAddSection').click(function(e)
	{
		var sectionLocation = $('#sectionLocation').val();
		var sectionStartTime = $('#sectionStartTime').val();
		var sectionEndTime = $('#sectionEndTime').val();

		var sectionDays = new Array();

		$('#sectionForm input:checked').each(function()
		{
			sectionDays.push(this.value);
		});

		var passedValidation = true;

		$('#alertBlankInput').hide();
		$('#alertInvalidLocation').hide();
		$('#alertInvalidTime').hide();
		$('#alertInvalidTimeInterval').hide();
		$('#alertBlankDays').hide();
		$('#alertNoSections').hide();

		if(sectionLocation == "" || sectionStartTime == "" || sectionEndTime == "")
		{
			$('#alertBlankInput').show();
			passedValidation = false;
		}
		
		if(sectionLocation != "" && !(sectionLocation in campusBuildings))
		{
			$('#alertInvalidLocation').show();
			passedValidation = false;
		}

		if((sectionStartTime != "" && !(moment(sectionStartTime, "h:mma").isValid())) || (sectionEndTime != "" && !(moment(sectionEndTime, "h:mma").isValid())))
		{
			$('#alertInvalidTime').show();
			passedValidation = false;
		}

		if(moment("1 1 2015 " + sectionEndTime, "M D YYYY h:mma").unix() < moment("1 1 2015 " + sectionStartTime, "M D YYYY h:mma").unix())
		{
			$('#alertInvalidTimeInterval').show();
			passedValidation = false;
		}

		if(sectionDays.length == 0)
		{
			$('#alertBlankDays').show();
			passedValidation = false;
		}

		if(!passedValidation)
		{
			return false;
		}

		$('#sectionList tr#sectionListPlaceholder').hide();
		
		$('#sectionList').append('<tr>' +
			'<td>' + sectionLocation + '</td>' +
			'<td>' + sectionStartTime + '</td>' +
			'<td>' + sectionEndTime + '</td>' +
			'<td>' + sectionDays.join(", ") + '</td>' +
			'<td><button class="btn btn-danger" id="btnDeleteSection">Delete</button></td>' +
			'</tr>');

		$('#sectionList #btnDeleteSection').click(function()
		{
			$(this).parents('tr').remove();
			if($('#sectionList tr').length == 1)
			{
				$('#sectionList #sectionListPlaceholder').show();
			}
		});

		$('#sectionLocation').val("");
		$('#sectionStartTime').val("");
		$('#sectionEndTime').val("");
		$('#sectionForm input:checked').attr('checked', false);

		e.preventDefault();
	});

	$('#btnAddClass').click(function(e)
	{
		var classDepartment = $('#classDept').val();
		var classCourse = $('#classCourse').val();
		var className = $('#className').val();

		var passedValidation = true;

		$('#alertBlankInput').hide();
		$('#alertInvalidLocation').hide();
		$('#alertInvalidTime').hide();
		$('#alertInvalidTimeInterval').hide();
		$('#alertBlankDays').hide();
		$('#alertNoSections').hide();

		if(classDepartment == "" || classCourse == "" || className == "")
		{
			$('#alertBlankInput').show();
			passedValidation = false;
		}

		if($('#sectionList tr').not("[id='sectionListPlaceholder']").length == 0)
		{
			$('#alertNoSections').show();
			passedValidation = false;
		}

		if(!passedValidation)
		{
			return false;
		}

		var theClass = new Class(classDepartment, classCourse, className);

		$('#sectionList tr').not("[id='sectionListPlaceholder']").each(function(){
			var sectionLocation = $(this).children('td:nth-of-type(1)').text();
			var sectionStartTime = $(this).children('td:nth-of-type(2)').text();
			var sectionEndTime = $(this).children('td:nth-of-type(3)').text();
			var sectionDays = $(this).children('td:nth-of-type(4)').text().split(", ");

			theClass.addSection(new Section(sectionLocation, sectionDays, sectionStartTime, sectionEndTime));
		});

		if($('#sectionList tr').not("[id='sectionListPlaceholder']").length == 1)
		{
			theClass.currentSection = 0;
		}

		$('#classDept').val("");
		$('#classCourse').val("");
		$('#className').val("");
		$('#sectionList tr').not("[id='sectionListPlaceholder']").remove();
		$('#sectionLocation').val("");
		$('#sectionStartTime').val("");
		$('#sectionEndTime').val("");
		$('#sectionForm input:checked').attr('checked', false);

		classes.push(theClass);
		updateClassList();

		e.preventDefault();
	});

	$('#btnCreateSchedule').click(function(e)
	{
		// determine max possible schedules, which is all possible combinations of sections from each class (including conflicting)
		var scheduleCount = 1;
		for(var i = 0; i < classes.length; i++)
			scheduleCount *= classes[i].sections.length;

		// hide error alerts
		$('#noSchedulesError').hide();

		$('#scheduleStats').hide();

		// hide add class
		$('#collapseOne').collapse('hide');

		// create progress dialog box
		$('#progressBox #currentNum').text("0");
		$('#progressBox #totalNum').text(scheduleCount);
		$('#progressBox #bar').css("width", "0%");
		$('#progressBox').show();

		// clear possibleSchedules
		possibleSchedules = new Array();

		// generate schedules
		createSchedules(0, new Array());
		rankSchedules();

		// hide possible schedules placeholder
		$('#possibleSchedulesPlaceholder').hide();

		// hide progress dialog
		$('#progressBox').hide();

		e.preventDefault();
	});
});