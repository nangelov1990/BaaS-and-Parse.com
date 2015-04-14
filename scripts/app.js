$(function () {
	loadCountries();

	$('body').on('click', 'button', function (ev) {
		var curObjName = this.parentElement.parentElement.getAttribute('id'),
			curObjClass = this.parentElement.parentElement.className.charAt(0).toUpperCase() +
				this.parentElement.parentElement.className.slice(1),
			button = ev.target.className;
		
		switch (button) {
			case 'editButton':
				editObject(curObjName, curObjClass);
				break;
			case 'deleteButton':
				deleteObject(curObjName, curObjClass);	
				
				break;
			default:
				break;
		}	
	});

	$('body').on('click', '.addButton', function (ev) {
		var containerName = this.parentElement.parentElement.getAttribute('id'),
			isCountry = (containerName == 'countryContainer');

		isCountry ? addObject('Country') : addObject('Town');
	});

	$('body').on('click', '.country p:first-child', function (ev) {
		var curObjName = this.parentElement.getAttribute('id');
		sessionStorage['currentCountry'] = curObjName;

		loadTowns(curObjName)
	});

	$('body').on('mouseover', '.country, .town', function () {
		$(this).css({
			background: 'lightgreen'
		});
	});

	$('body').on('mouseleave', '.country, .town', function () {
		$(this).css({
			background: 'none'
		});
	});
});