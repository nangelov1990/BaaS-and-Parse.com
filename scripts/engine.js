var appUrl = 'https://api.parse.com/1/classes/',
	appHeaders = {
			'X-Parse-Application-Id':'6nr6tlDfWLHRn8xqS9Fp1E9JTMAO0GrCanGqoNMW',
			'X-Parse-REST-API-Key':'y5Di6YJG6y4RRC8AMCSLC75ooRtVVA7DL8ZtpUel'
	},
	countryContainer = $('<div>')
		.attr('id', 'countryContainer')
		.appendTo('body'),
	townContainer = $('<div>')
		.attr('id', 'townContainer')
		.appendTo('body');

function loadCountries () {
	var loadUrl = appUrl + 'Country',
		countries;

	$(countryContainer).html('');
	$(townContainer).html('');
	countryContainer.html('<h3>COUNTRIES</h3>');
	countryContainer.append($('<p>').append($('<button>').addClass('addButton').text('Add')));

	$.ajax({
		method: 'get',
		headers: appHeaders,
		url: loadUrl
	}).success(function (data) {
		countries = data.results;
		countries.forEach(function (country) {
			$('<div>')
				.attr('id', country.name)
				.addClass('country')
				.append($('<p>')
					.text(country.name))
				.append($('<p>').append($('<button>').addClass('editButton').text('Edit'))
					.append($('<button>').addClass('deleteButton').text('Delete')))
				.appendTo(countryContainer);

			sessionStorage[country.name] = country.objectId;
		});
	}).error(function(err) {
		throw new Error(err.statusText);
	});
};

function loadTowns (countryName) {
	var countryId = sessionStorage[countryName],
		townsUrl = appUrl + 'Town?&where={"$relatedTo":{"object":{"__type":"Pointer","className":"Country","objectId":"' + countryId + '"}, "key":"towns"}}}&key=name',
		towns;

	townContainer.innerHRML = '';
	townContainer.html('<h3>Towns in ' + countryName + '</h3>');
	townContainer.append($('<p>').append($('<button>').addClass('addButton').text('Add')));

	$.ajax({
		method: 'get',
		headers: appHeaders,
		url: townsUrl
	}).success(function (data) {
		towns = data.results;
		towns.forEach(function (town) {
			$('<div>')
				.attr('id', town.name)
				.addClass('town')
				.text(town.name)
				.append($('<p>').append($('<button>').addClass('editButton').text('Edit'))
					.append($('<button>').addClass('deleteButton').text('Delete')))
				.appendTo(townContainer);

			sessionStorage[town.name] = town.objectId;
		});
		// console.log(data) // testing
	}).error(function(err) {
		throw new Error(err.statusText);
	});
}

function addObject (objectClass) {
	var addUrl = appUrl + objectClass,
		name = prompt(objectClass + ' name:'),
		objectData = {
			'name':name
		},
		newObjectId;

	if (name) {
		$.ajax({
			method: 'post',
			headers: appHeaders,
			url: addUrl,
			data: JSON.stringify(objectData)
		}).success(function (data) {
			console.log(data); // testing
			newObjectId = data.objectId;
			(objectClass == 'Country') ? loadCountries() : undefined;
			isTown();
		}).error(function(err) {
			throw new Error(err.statusText);
		});
	};

	function isTown () {
		if (objectClass == 'Town') {
			var curCountryName = sessionStorage['currentCountry'],
				curCountryId = sessionStorage[curCountryName];

			$.ajax({
				method: 'put',
				headers: appHeaders,
				url: appUrl + '/Country/' + curCountryId,
				data: JSON.stringify({
					"towns":{"__op": "AddRelation","objects": [{ "__type": "Pointer", "className":"Town", "objectId": newObjectId }]}
				})
			}).success(function (data) {
				console.log(data); // testing
				loadTowns(sessionStorage['currentCountry']);
			}).error(function(err) {
				throw new Error(err.statusText);
			});
		};
	};

	alert('Added successfully')
};

function editObject (objectName, objectClass) {
	var objectId = sessionStorage[objectName],
		editUrl = appUrl + objectClass + '/' + objectId,
		name = prompt('New country name:', objectName),
		notSame = (objectName !== name);

	if (name && notSame) {
		$.ajax({
			method: 'put',
			headers: appHeaders,
			url: editUrl,
			data: JSON.stringify({
				'name':name
			})
		}).success(function (data) {
			(objectClass == 'Country') ? loadCountries() : loadTowns(sessionStorage['currentCountry']);
			alert('Edited successfully');
		}).error(function(err) {
			throw new Error(err.statusText);
		});
	};
};

// Not specified if towns should be deleted if country is.
function deleteObject (objectName, objectClass) {
	if (objectClass == 'Country') {
		$(townContainer).html('');
		deleteChildTowns(objectName);
		del(objectName, objectClass);
	} else {		
		del(objectName, objectClass);
	};

	function del (curObjName, curObjClass) {
		var objectId = sessionStorage[curObjName],
		deleteUrl = appUrl + curObjClass + '/' + objectId;

		$.ajax({
			method: 'delete',
			headers: appHeaders,
			url: deleteUrl
		}).success(function () {
			// loadCountries(); // Dom deleting the element for performance.
			$('#' + curObjName).remove();
			delete sessionStorage[curObjName];
			// alert('Deleted successfully');
		}).error(function(err) {
			throw new Error(err.statusText);
		});
	};

	function deleteChildTowns (countryName) {
		var countryId = sessionStorage[countryName],
			townsUrl = appUrl + 'Town?&where={"$relatedTo":{"object":{"__type":"Pointer","className":"Country","objectId":"' + countryId + '"}, "key":"towns"}}}&key=name',
			towns = [];

		$.ajax({
			method: 'get',
			headers: appHeaders,
			url: townsUrl
		}).success(function (data) {
			data.results.forEach(function (town) {
				del(town.name, 'Town');
			});
		}).error(function(err) {
			throw new Error(err.statusText);
		});

		// return towns;
	};

	alert('Deleted successfully');
};