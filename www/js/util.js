Array.prototype.groupBy = function (prop) {
	return this.reduce(function (groups, item) {
		const val = item[prop]
		groups[val] = groups[val] || []
		groups[val].push(item)
		return groups
	}, {})
}

String.prototype.toCamelCase = function (cap1st) {
	return ((cap1st ? "-" : "") + this).replace(/-+([^-])/g, function (a, b) {
		return b.toUpperCase();
	});
};

JSON.clone = function (jsonObj) {
	return this.parse(this.stringify(jsonObj));
};

function scrollTo(element, to, duration) {
	if (duration < 0) return;
	var difference = to - element.scrollTop;
	var perTick = difference / duration * 2;

	setTimeout(function () {
		element.scrollTop = element.scrollTop + perTick;
		scrollTo(element, to, duration - 2);
	}, 10);
}

function scrolLeft(element, to, duration) {
	if (duration < 0) return;
	var difference = to - element.scrollLeft;
	var perTick = difference / duration * 2;

	setTimeout(function () {
		element.scrollLeft = element.scrollLeft + perTick;
		scrollLeft(element, to, duration - 2);
	}, 10);
}

function isValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function swapDate(date) {
	var arr = date.split('/');
	return arr[2] + '-' + arr[1] + '-' + arr[0];
}

function isEmpty(obj) {
	var result = true;
	if (obj != null) {
		switch (obj.constructor) {
			case Array:
				result = obj.length == 0;
				break;
			case Object:
				result = Object.keys(obj).length === 0 && obj.constructor === Object;
				break;
			case String:
				result = obj.length == 0;
				break;
			default:
				result = false;

		}
	}
	return result;
}

function compareStrings(a, b) {
	a = a.toLowerCase();
	b = b.toLowerCase();
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function sortArrayByKey(array, key) {
	array.sort(function (a, b) {
		return compareStrings(a[key], b[key]);
	});
	return array;
}

function sortArrayByTwoKeys(array, key1, key2) {
	array.sort(function (a, b) {
		return compareStrings(a[key1][key2], b[key1][key2]);
	});
	return array;
}

function numberFormat(number) {
	return numeral(number).format('0,0').replace(/,/g, ".");
}

function sortByKey(array, key) {
	return array.sort(function (a, b) {
		var x = a[key];
		var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

function strip(html) {
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return (tmp.textContent || tmp.innerText || "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/ /g, '');
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}

var getDistanceFromGoogleMapsPoints = function (p1, p2) {
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = deg2rad(p2.lat() - p1.lat());
	var dLong = deg2rad(p2.lng() - p1.lng());
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(p1.lat())) * Math.cos(deg2rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
};

function scrollToActiveElement() {
	if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
		document.activeElement.scrollIntoViewIfNeeded();
	}
}

function shorten(text, maxLength) {
	return text.substring(0, maxLength) + '...';
}

function randomInt(a, b) {
	return Math.floor((Math.random() * b) + a);
}

function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	}
	return number + "";
}