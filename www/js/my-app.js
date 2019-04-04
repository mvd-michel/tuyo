
moment.locale('es');

var cordovaIfDefined = typeof cordova != 'undefined';

var $$ = Dom7;

var lastBuildDateTime = 1524107056430, 
	messagesChat = null;
var id_movil = null;
var pushNotification = null;
var pictureSource;
var destinationType;
var push = false;
var imgReg = null;
var imgMyAccount = null;
var fbsiUID;
var currentLat = null, currentLng = null;
//var host = "http://server2.autotrack-gps.com/tuyo/";
//var host = "http://terappia.es/app/";
var host = "http://terappiapp.es/";
var directory = "api";
var markerCurrentPosition = null;
var professionals = null;
var fb = false;
var pushE;
var activeEvt = false;
var terminos = [];
var dateConfirm;
var codeConfirm;
var platform = "web";

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery 
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
		saveToPhotoAlbum: true,
        correctOrientation: true  //Corrects Android orientation quirks 
    }
    return options;
}

function term(index) {
    var title = "Términos y condiciones";
    if(index == 1) {
        title = "Política de privacidad";
    }
    $$("#titleTerm").html(title);
    $$(".popup-terminos .page-content").html('<p style=" margin: 20px; text-align: justify;">'+terminos[index].texto+'</p>');
}

function createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
        // JPEG file 
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
 
            // Do something with it, like write to it, upload it, etc. 
            // writeFile(fileEntry, imgUri); 
            //console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to"); 
 
        }, onErrorCreateFile);
 
    }, onErrorResolveUrl);
}

function onErrorCreateFile() {
	//console.log("error1");
}

function onErrorResolveUrl() {
	//console.log("error2");
}

function backChat() {
	if(push) {
		app.router.navigate({
			url: '/home/',
			ignoreCache: false,
			clearPreviousHistory: true
		});
	}
	else {
		app.router.back();
	}
	push = false;
}

function getVisitPending() {
	var userInfo = app.data('userInfo');
	API.loadVisits({
		i: userInfo.reg_password,
        d: moment().format('YYYY-MM-DD')
	}, function (json) {
		var html = "";
		var d1 = moment();
		var d2, deleteP = "", rating = "", motivo = "";
		json.profesionales.forEach(function(p) {
			rating = "";
			motivo = "";
			if(p.citas.length > 0) {
				p.citas.forEach(function(c) {
                    if(c.tratamiento) {
                        if(motivo.indexOf(c.tratamiento) == -1) {
                            motivo += c.tratamiento + ", ";
                        }
                    }
					d2 = moment(c.dia, "YYYY-MM-DD");
					if(d2.isBefore(d1)) {
						rating = '<div class="item-after"> <a href="/ranking-professional/?p='+p.reg_password+'" class="link" style=" margin-right: 15px;"><i class="fas fa-pencil-alt" style=" font-size: 18px;"></i></a> </div>';
					}
				});
                if(motivo.length > 0) {
                    motivo = motivo.substring(0, motivo.length-2);
                }
				html += '<div class="list media-list" style=" margin: 0;"> <ul> <li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-media"><img src="'+((p.foto != null && p.foto != "" ? (API.host + "/images/pics/" + p.foto) : 'img/avatar-default-alt.png'))+'" style=" border-radius: 50%;" width="44"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title" id=""> '+p.nombre+" "+p.apellidos+' </div> '+rating+' </div> <div class="item-subtitle" id="" style="color: gray;white-space:  normal;">'+motivo+'</div> </div> </div> </li> </ul> </div><div id="" class="list no-hairlines-md" style="margin: 0;"> <ul>';
				p.citas.forEach(function(c) {
					d2 = moment(c.dia + " " + c.hora, "YYYY-MM-DD HH:mm:ss");
					deleteP = '<a href="#" data-id="'+c.reg+'" class="link deleteVisit" style=" margin-right: 15px;"><i class="fas fa-trash" style=" font-size: 18px;"></i></a>';
					if(d2.isBefore(d1)) {
						deleteP = "";
					}
					html += '<li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-inner"> <div class="item-title" style=" margin-left: 5px;">Fecha '+d2.format("DD-MM-YYYY")+' '+moment(c.hora, "HH:mm:ss").format("HH:mm")+'</div> <div class="item-after"> '+deleteP+' </div> </div> </div> </li>';
				});
				html += '</ul></div>';
			}
		});
        
        json.centros.forEach(function(c) {
            motivo = "";
            rating = "";
            if(c.citas.length > 0) {
                c.citas.forEach(function(ci) {
                    if(ci.tratamiento) {
                        if(motivo.indexOf(ci.tratamiento) == -1) {
                            motivo += ci.tratamiento + ", ";
                        }
                    }
                    d2 = moment(ci.dia + " " + ci.hora, "YYYY-MM-DD HH:mm:ss");
					if(d2.isBefore(moment())) {
						rating = '<div class="item-after"> <a href="/ranking-professional-center/?p='+c.reg_password+'" class="link" style=" margin-right: 15px;"><i class="fas fa-pencil-alt" style=" font-size: 18px;"></i></a> </div>';
					}
                });
                if(motivo.length > 0) {
                    motivo = motivo.substring(0, motivo.length-2);
                }
                
                html += '<div class="list media-list" style=" margin: 0;"> <ul> <li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-media"><img src="img/avatar-default-alt.png" style=" border-radius: 50%;" width="44"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title" id=""> '+c.nombre+'</div> '+rating+' </div> <div class="item-subtitle" id="" style="color: gray;white-space:  normal;">'+motivo+'</div> </div> </div> </li> </ul> </div><div id="" class="list no-hairlines-md" style="margin: 0;"> <ul>';
                if(c.citas.length > 0) {
                    c.citas.forEach(function(ci) {
                        d2 = moment(ci.dia, "YYYY-MM-DD");
                        deleteP = '<a href="#" data-id="'+ci.reg+'" class="link deleteVisit" style=" margin-right: 15px;"><i class="fas fa-trash" style=" font-size: 18px;"></i></a>';
                        if(d2.isBefore(d1)) {
                            deleteP = "";
                        }
                        html += '<li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-inner"> <div class="item-title" style="font-size: 15px;">'+ci.nombre+" "+ci.apellidos+" "+d2.format("DD-MM-YYYY")+' '+moment(ci.hora, "HH:mm:ss").format("HH:mm")+'</div> <div class="item-after"> '+deleteP+' </div> </div> </div> </li>';
                    });
                }
                html += '</ul></div>';
            }
        });
        
		$$("#containerVisits").html(html);

		$$(".deleteVisit").click(function() {
            var userInfo = app.data('userInfo');
			var element = $$(this);
			app.dialog.confirm("Esta seguro que desea eliminar este registro?", function () {
				app.customFunctions.showIndicator();
				API.deleteAgenda({
					i: element.attr("data-id"),
                    u: userInfo.reg_password
				}, function(json) {
					app.customFunctions.hideIndicator();
					element.closest("li").remove();
					app.dialog.alert("Los datos se han elimando correctamente.");
				}, function(error) {
					//console.log(error);
				});
			});
		});

	}, function (error) {
		//console.log(error);
	});
}

function starsRanking(calification) {
	var stars = '<i class="far fa-star" style=" color: #f5b33b;"></i><i class="far fa-star" style=" color: #f5b33b;"></i><i class="far fa-star" style=" color: #f5b33b;"></i><i class="far fa-star" style=" color: #f5b33b;"></i><i class="far fa-star" style=" color: #f5b33b;"></i>';
	if(parseInt(calification) > 0.0) {
		if(parseInt(calification) > 5) {
			calification = 5;
		}
		stars = "";
		var cant = 5;
		for(var i = 1; i <= parseInt(calification); i++) {
			stars += '<i class="fas fa-star" style=" color: #f5b33b;"></i>';
			cant--;
		}
		if(cant > 0) {
			for(var i = 1; i <= cant; i++) {
				stars += '<i class="far fa-star" style=" color: #f5b33b;"></i>';
			}
		}
	}
	return stars;
}

function lsTest() {
	var test = 'test';
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

function saveTypeUser(type) {
	app.customFunctions.showIndicator();
	var userInfo = app.data('userInfo');
	app.methods.getJSON('fbl-op-pruebas', {
		op: 3,
		t: type,
		i: userInfo.reg_password
	}, function(response) {
		var json = response;
		//console.log(json);
		app.customFunctions.hideIndicator();
		app.data('userInfo', json.info);
		
		if(parseInt(json.info.usuario) > 0) {
			app.router.navigate({
				url: '/home/'
			});
		}
		else if(parseInt(json.info.profesional) > 0) {
            if(typeof json.info.nombre == "undefined" || (typeof json.info.dnicif == "undefined" || json.info.dnicif == "")) {
                app.router.navigate({
                    url: '/my-account/'
                });
            }
            else if(json.info.latitud == null || json.info.latitud == "") {
                app.router.navigate({
                    url: '/location/'
                }); 
            }
			else {
				app.router.navigate({
					url: '/agenda/'
				});
			}
		}
		else if(parseInt(json.info.centrodesalud) > 0) {
			app.router.navigate({
				url: '/home-center/'
			});
		}
		
		/*if(parseInt(json.info.usuario) > 0) {
			if(typeof json.info.filtro.reg_ficha != "undefined") {
				app.router.navigate({
					url: '/filtro/'
				});
			}
			else {
				if(typeof json.info.nombre == "undefined") {
					app.router.navigate({
						url: '/my-account/'
					});
				}
				else {
					app.router.navigate({
						url: '/filtro/'
					});
				}
			}
		}
		else if(parseInt(json.info.profesional) > 0) {
			if(typeof json.info.nombre == "undefined") {
				app.router.navigate({
					url: '/my-account/'
				});
			}
			else {
				app.router.navigate({
					url: '/agenda/'
				});
			}
		}
		else if(parseInt(json.info.centrodesalud) > 0) {
			app.router.navigate({
				url: '/home-center/'
			});
		}*/
	});
}

function getFingerVerification() {
	if(app.views.main.router.currentRoute.path == "/fingerprint/" || app.views.main.router.currentRoute.path == "/login/") {
		var userInfo = app.data('userInfo');
		Fingerprint.show({
		  clientId: userInfo.reg_password,
		  clientSecret: "password" //Only necessary for Android
		}, function() {
			if(app.views.main.router.currentRoute.path == "/fingerprint/") {
				app.dialog.alert("Huella registrada exitosamente");
			}

			app.customFunctions.showIndicator();

			API.auth({
				e: userInfo.email,
				p: userInfo.password,
				f: 1
			}, function (json) {
				app.customFunctions.hideIndicator();
				if (json.msg == "OK") {
					json.info.password = userInfo.password;
					app.data('userInfo', json.info);
					if(parseInt(json.info.usuario) > 0) {									
						app.router.navigate({
							url: '/home/'
						});
					}
					else if(parseInt(json.info.profesional) > 0) {
						if(typeof json.info.nombre == "undefined") {
							app.router.navigate({
								url: '/my-account/'
							});
						}
						else {
							app.router.navigate({
								url: '/agenda/'
							});
						}
					}
					else if(parseInt(json.info.centrodesalud) > 0) {
						app.router.navigate({
							url: '/home-center/'
						});
					}
				}
			}, function (error) {
				app.customFunctions.hideIndicator();
			});

		}, function(err) {
			app.dialog.alert("Error de autenticación.");
			console.log(err);
		});
	}
}

function withFacebook() {
	fbsiUID = new Date().getTime();
	
	facebookConnectPlugin.login(["public_profile", "email"],
		function (userDataLogin) {
			facebookConnectPlugin.api(userDataLogin.authResponse.userID + "/?fields=id,first_name,last_name,picture,email", ["public_profile", "email"], function (userData) {
				//console.log(userData);
				////console.log(userDataLogin);
				
				/*
				JSON.stringify({
						uid: uid,
						email: info.email,
						profile_id: info.id,
						name: info.first_name + " " + info.last_name,
						first_name: info.first_name,
						last_name: info.last_name,
						cover: ''
					}
				*/
				app.customFunctions.showIndicator();
				app.methods.getJSON('fbl-op-pruebas', {
					op: 1,
					i: fbsiUID,
					id_movil: id_movil,
					lat: currentLat,
					lng: currentLng,
                    platform: platform,
					info: JSON.stringify({
						uid: fbsiUID,
						email: userData.email,
						profile_id: userData.id,
						name: userData.first_name + " " + userData.last_name,
						first_name: userData.first_name,
						last_name: userData.last_name,
						cover: ''
					})
				}, function(response) {
					app.customFunctions.hideIndicator();
					if(response.msg == "OK") {
						if(typeof response.data.data != "undefined") {
							fb = true;
							app.data('userInfo', response.data.data);
							var info = response.data.data;
							if(parseInt(info.usuario) == 0 && parseInt(info.profesional) == 0 && parseInt(info.centrodesalud) == 0) {
								app.dialog.create({
									title: 'Seleccione que tipo de usuario será en la app.',
									text: 'Tipos de usuario',
									buttons: [
									  {
										text: 'Usuario',
										onClick: function() {
											saveTypeUser(1);
										}
									  },
									  {
										text: 'Profesional',
										onClick: function() {
											saveTypeUser(2);
										}
									  },
									  {
										text: 'Centro',
										onClick: function() {
											saveTypeUser(3);
										}
									  },
									],
									cssClass: "myAlert",
									verticalButtons: true,
								}).open();
							}
							else {
								var json = response.data.data;
								if(parseInt(json.usuario) > 0) {
									if(typeof json.filtro.reg_ficha != "undefined") {
										app.router.navigate({
											url: '/filtro/'
										});
									}
									else {
										if(typeof json.nombre == "undefined") {
											app.router.navigate({
												url: '/my-account/'
											});
										}
										else {
											app.router.navigate({
												url: '/filtro/'
											});
										}
									}
								}
								else if(parseInt(json.profesional) > 0) {
									if(typeof json.nombre == "undefined" || (typeof json.dnicif == "undefined" || json.dnicif == "")) {
										app.router.navigate({
											url: '/my-account/'
										});
									}
                                    else if(json.latitud == null || json.latitud == "") {
                                        app.router.navigate({
											url: '/location/'
                                        }); 
                                    }
									else {
										app.router.navigate({
											url: '/agenda/'
										});
									}
								}
								else if(parseInt(json.centrodesalud) > 0) {
									app.router.navigate({
										url: '/home-center/'
									});
								}
							}
						}
					}
					else {
						app.dialog.alert("Error con cuenta de Facebook, intente con otra cuenta");
					}
				});
				
			}, function (error) {
                app.customFunctions.hideIndicator();
                console.log(error); 
			});
		},
		function (error) { console.log(error); 
			}
	);
}

var dataNoLS = {};

var lsCompatible = lsTest();

if (lsCompatible === true) {
	if (isEmpty(Lockr.get('lastBuildDateTime_com.argi.clientes.app')) || Lockr.get('lastBuildDateTime_com.argi.clientes.app') != lastBuildDateTime) {
		Lockr.set('com.argi.clientes.app', null);
		Lockr.set('lastBuildDateTime_com.argi.clientes.app', lastBuildDateTime);
	}
} else {
	Lockr = {
		get: function (k) {
			return dataNoLS.hasOwnProperty(k) ? dataNoLS[k] : null;
		},
		set: function (k, v) {
			dataNoLS[k] = v;
		},
		flush: function () {
			dataNoLS = {};
		}
	};
}

var mapStyles = [{
	"elementType": "geometry",
	"stylers": [{
		"color": "#f5f5f5"
	}]
}, {
	"elementType": "labels.icon",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#616161"
	}]
}, {
	"elementType": "labels.text.stroke",
	"stylers": [{
		"color": "#f5f5f5"
	}]
}, {
	"featureType": "administrative.country",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#0096a4"
	}]
}, {
	"featureType": "administrative.land_parcel",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#bdbdbd"
	}]
}, {
	"featureType": "administrative.locality",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#ff9822"
	}]
}, {
	"featureType": "administrative.province",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#0096a4"
	}]
}, {
	"featureType": "poi",
	"elementType": "geometry",
	"stylers": [{
		"color": "#eeeeee"
	}]
}, {
	"featureType": "poi",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#757575"
	}]
}, {
	"featureType": "poi.park",
	"elementType": "geometry",
	"stylers": [{
		"color": "#e5e5e5"
	}]
}, {
	"featureType": "poi.park",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#729e0a"
	}]
}, {
	"featureType": "road",
	"elementType": "geometry",
	"stylers": [{
		"color": "#ffffff"
	}]
}, {
	"featureType": "road.highway",
	"elementType": "geometry",
	"stylers": [{
		"color": "#dadada"
	}]
}, {
	"featureType": "road.highway",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#1a1645"
	}, {
		"weight": 1
	}]
}, {
	"featureType": "road.highway.controlled_access",
	"elementType": "geometry.fill",
	"stylers": [{
		"color": "#ff9822"
	}]
}, {
	"featureType": "road.highway.controlled_access",
	"elementType": "geometry.stroke",
	"stylers": [{
		"color": "#0096a4"
	}]
}, {
	"featureType": "road.highway.controlled_access",
	"elementType": "labels.icon",
	"stylers": [{
		"color": "#0096a4"
	}]
}, {
	"featureType": "road.highway.controlled_access",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#ffffff"
	}, {
		"weight": 1
	}]
}, {
	"featureType": "road.highway.controlled_access",
	"elementType": "labels.text.stroke",
	"stylers": [{
		"color": "#ff9822"
	}]
}, {
	"featureType": "road.local",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#0096a4"
	}]
}, {
	"featureType": "transit.line",
	"elementType": "geometry",
	"stylers": [{
		"color": "#e5e5e5"
	}]
}, {
	"featureType": "transit.station",
	"elementType": "geometry",
	"stylers": [{
		"color": "#eeeeee"
	}]
}, {
	"featureType": "water",
	"elementType": "geometry",
	"stylers": [{
		"color": "#c9c9c9"
	}]
}, {
	"featureType": "water",
	"elementType": "labels.text.fill",
	"stylers": [{
		"color": "#9e9e9e"
	}]
}];

var addScript = function (url, callback) {
	var script = document.createElement('script');
	if (callback) script.onload = callback;
	script.type = 'text/javascript';
	script.src = url;
	try {
		document.body.appendChild(script);
	} catch (error) {
		//console.log(error);
	}
}

var getCurrentPosition = function (onSuccess, onError) {
	var options = {};
	if (cordovaIfDefined && (device.platform == "Android" && parseFloat(device.version) < 5)) {
		var options = {
			maximumAge: 10000,
			timeout: 30000,
			interval: 3000,
			fastInterval: 3000,
			priority: 100
		};
		//var watchID = cordova.plugins.locationServices.geolocation.watchPosition(onSuccess, onError, options);
	} else {
		options = {
			enableHighAccuracy: true
		};
		//var watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
	}
};

var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto' , 'Septiembre' , 'Octubre', 'Noviembre', 'Diciembre'];
	
var logout = function() {
	app.panel.close();
	$$(".menus").hide();
	fb = false;
	$$("#containerButtonImages").hide();
	app.data('userInfo', null);
	app.router.back('/login/', {
		force: true
	});
	app.views.main.router.clearHistory();
};

var API = {
	host: cordovaIfDefined ? 'http://terappiapp.es/' : 'http://terappiapp.es/', // || true
	//host: cordovaIfDefined ? 'http://terappia.es/app' : 'http://terappia.es/app', // || true
	getImage: function(folder, file, w, h) {
		return API.host + '/thumb.php?pi=' + folder + '&src=' + file + '&x=' + w + '&y=' + h + '&f=0&q=100&t=-1';
	},
	makeXHR: function (params, onSuccess, onError) {
		app.request({
			method: 'GET',
			url: API.host + '/api/operaciones-pruebas.php',
			data: params,
			complete: function (xhr, status) {
				if (status == 200) {
					onSuccess(JSON.parse(xhr.responseText));
				} else {
					//console.log(xhr);
					onError("Error en la llamada ajax con parametros ", params, ".");
				}
			}
		});
	},
	isValidEmail: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	auth: function (params, onSuccess, onError) {
		params.op = 1;
		API.makeXHR(params, onSuccess, onError);
	},
	getInfoFilter: function (params, onSuccess, onError) {
		params.op = 3;
		API.makeXHR(params, onSuccess, onError);
	},
	saveFilter: function (params, onSuccess, onError) {
		params.op = 4;
		API.makeXHR(params, onSuccess, onError);
	},
	getInfoProfesional: function (params, onSuccess, onError) {
		params.op = 5;
		API.makeXHR(params, onSuccess, onError);
	},
	validEmailPhone: function (params, onSuccess, onError) {
		params.op = 6;
		API.makeXHR(params, onSuccess, onError);
	},
	sendCodeConfirm: function (params, onSuccess, onError) {
		params.op = 7;
		API.makeXHR(params, onSuccess, onError);
	},
	saveUser: function (params, onSuccess, onError) {
		params.op = 8;
		API.makeXHR(params, onSuccess, onError);
	},
	getPics: function (params, onSuccess, onError) {
		params.op = 10;
		API.makeXHR(params, onSuccess, onError);
	},
	deletePic: function (params, onSuccess, onError) {
		params.op = 13;
		API.makeXHR(params, onSuccess, onError);
	},
	loadTaxs: function (params, onSuccess, onError) {
		params.op = 14;
		API.makeXHR(params, onSuccess, onError);
	},
	saveTaxs: function (params, onSuccess, onError) {
		params.op = 15;
		API.makeXHR(params, onSuccess, onError);
	},
	deleteTaxs: function (params, onSuccess, onError) {
		params.op = 16;
		API.makeXHR(params, onSuccess, onError);
	},
	saveOffers: function (params, onSuccess, onError) {
		params.op = 17;
		API.makeXHR(params, onSuccess, onError);
	},
	deleteOffers: function (params, onSuccess, onError) {
		params.op = 18;
		API.makeXHR(params, onSuccess, onError);
	},
	loadOffers: function (params, onSuccess, onError) {
		params.op = 19;
		API.makeXHR(params, onSuccess, onError);
	},
	saveComplement: function (params, onSuccess, onError) {
		params.op = 20;
		API.makeXHR(params, onSuccess, onError);
	},
	searchdni: function (params, onSuccess, onError) {
		params.op = 21;
		API.makeXHR(params, onSuccess, onError);
	},
	deleteUser: function (params, onSuccess, onError) {
		params.op = 22;
		API.makeXHR(params, onSuccess, onError);
	},
	loadTerminos: function (params, onSuccess, onError) {
		params.op = 23;
		API.makeXHR(params, onSuccess, onError);
	},
	saveDatesCenter: function (params, onSuccess, onError) {
		params.op = 24;
		API.makeXHR(params, onSuccess, onError);
	},
	actionUser: function (params, onSuccess, onError) {
		params.op = 25;
		API.makeXHR(params, onSuccess, onError);
	},
	loadEvents: function (params, onSuccess, onError) {
		params.op = 26;
		API.makeXHR(params, onSuccess, onError);
	},
	saveAgenda: function (params, onSuccess, onError) {
		params.op = 27;
		API.makeXHR(params, onSuccess, onError);
	},
	saveAgendaCenter: function (params, onSuccess, onError) {
		params.op = 28;
		API.makeXHR(params, onSuccess, onError);
	},
	loadProfesionalCenter: function (params, onSuccess, onError) {
		params.op = 29;
		API.makeXHR(params, onSuccess, onError);
	},
	loadCenterProfesional: function (params, onSuccess, onError) {
		params.op = 30;
		API.makeXHR(params, onSuccess, onError);
	},
	getInfoAgenda: function (params, onSuccess, onError) {
		params.op = 31;
		API.makeXHR(params, onSuccess, onError);
	},
	saveInfoAgenda: function (params, onSuccess, onError) {
		params.op = 32;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoProfesionalsCenter: function (params, onSuccess, onError) {
		params.op = 33;
		API.makeXHR(params, onSuccess, onError);
	},
	loadVisits: function (params, onSuccess, onError) {
		params.op = 34;
		API.makeXHR(params, onSuccess, onError);
	},
	deleteAgenda: function (params, onSuccess, onError) {
		params.op = 35;
		API.makeXHR(params, onSuccess, onError);
	},
	checkEmailPhone: function (params, onSuccess, onError) {
		params.op = 36;
		API.makeXHR(params, onSuccess, onError);
	},
	saveFavoriteRanking: function (params, onSuccess, onError) {
		params.op = 37;
		API.makeXHR(params, onSuccess, onError);
	},
	updateRanking: function (params, onSuccess, onError) {
		params.op = 38;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoProfessionals: function (params, onSuccess, onError) {
		params.op = 39;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoProfessionalsAll: function (params, onSuccess, onError) {
		params.op = 40;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoUsersProfessional: function (params, onSuccess, onError) {
		params.op = 41;
		API.makeXHR(params, onSuccess, onError);
	},
	cancelQuote: function (params, onSuccess, onError) {
		params.op = 42;
		API.makeXHR(params, onSuccess, onError);
	},
	lockQuote: function (params, onSuccess, onError) {
		params.op = 43;
		API.makeXHR(params, onSuccess, onError);
	},
	saveUserAgenda: function (params, onSuccess, onError) {
		params.op = 44;
		API.makeXHR(params, onSuccess, onError);
	},
	saveOrderPics: function (params, onSuccess, onError) {
		params.op = 45;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoQuote: function (params, onSuccess, onError) {
		params.op = 46;
		API.makeXHR(params, onSuccess, onError);
	},
	changeQuote: function (params, onSuccess, onError) {
		params.op = 47;
		API.makeXHR(params, onSuccess, onError);
	},
	getMutuas: function (params, onSuccess, onError) {
		params.op = 48;
		API.makeXHR(params, onSuccess, onError);
	},
	saveMutuasCenter: function (params, onSuccess, onError) {
		params.op = 49;
		API.makeXHR(params, onSuccess, onError);
	},
	saveOrderProfessionals: function (params, onSuccess, onError) {
		params.op = 50;
		API.makeXHR(params, onSuccess, onError);
	},
	loadInfoUserRanking: function (params, onSuccess, onError) {
		params.op = 51;
		API.makeXHR(params, onSuccess, onError);
	},
	getInfoProfesionalCenter: function (params, onSuccess, onError) {
		params.op = 52;
		API.makeXHR(params, onSuccess, onError);
	},
	saveLangs: function (params, onSuccess, onError) {
		params.op = 53;
		API.makeXHR(params, onSuccess, onError);
	},
	getPasswordRecoverCode: function (params, onSuccess, onError) {
		params.op = 5;
		API.makeXHR(params, onSuccess, onError);
	},
	checkPasswordRecoverCode: function (params, onSuccess, onError) {
		params.op = 6;
		API.makeXHR(params, onSuccess, onError);
	},
	saveResetNewPassword: function (params, onSuccess, onError) {
		params.op = 12;
		API.makeXHR(params, onSuccess, onError);
	},
	createAccount: function (params, onSuccess, onError) {
		params.op = 2;
		API.makeXHR(params, onSuccess, onError);
	},
	loadChat: function (params, onSuccess, onError) {
		params.op = 14;
		API.makeXHR(params, onSuccess, onError);
	},
	sentMessage: function (params, onSuccess, onError) {
		params.op = 15;
		API.makeXHR(params, onSuccess, onError);
	},
	addFile: function(element) {
		app.popover.close();
		app.customFunctions.showIndicator();
		var url = API.host + '/api/operaciones-pruebas.php';
		switch($$(element).attr("data-target")) {
			case 'camera':
				var srcType = Camera.PictureSourceType.CAMERA;
				var options = setOptions(srcType);
				var func = createNewFileEntry;

				options.targetHeight = 512;
				options.targetWidth = 512;

				navigator.camera.getPicture(function cameraSuccess(imageData) {
					app.request.post(url, { op: 15, file: imageData, i: app.views.main.router.currentRoute.query.idService, is: app.views.main.router.currentRoute.query.idRequest, u: app.data('userInfo').id, d: moment().format('YYYY-MM-DD HH:mm:ss') }, function (response) {
						messagesChat.addMessage({
							text: "",
							imageSrc: (API.host+'/files/'+response.archivo),
							type: 'sent',
							textFooter: response.fecha
						});
						$$(".page[data-name=chat] .messages-content").scrollTo(0, $$(".page[data-name=chat] .messages-content")[0].scrollHeight);
						app.customFunctions.hideIndicator();
					});
				}, function cameraError(error) {
					app.customFunctions.hideIndicator();
				}, options);
				break;
			case 'gallery':
				var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
				var options = setOptions(srcType);
				var func = createNewFileEntry;

				options.targetHeight = 512;
				options.targetWidth = 512;

				navigator.camera.getPicture(function cameraSuccess(imageData) {
					app.request.post(url, { op: 15, file: imageData, i: app.views.main.router.currentRoute.query.idService, is: app.views.main.router.currentRoute.query.idRequest, u: app.data('userInfo').id, d: moment().format('YYYY-MM-DD HH:mm:ss') }, function (response) {

						messagesChat.addMessage({
							text: "",
							imageSrc: (API.host+'/files/'+response.archivo),
							type: 'sent',
							textFooter: response.fecha
						});
						$$(".page[data-name=chat] .messages-content").scrollTo(0, $$(".page[data-name=chat] .messages-content")[0].scrollHeight);
						app.customFunctions.hideIndicator();
					});
				}, function cameraError(error) {
					app.customFunctions.hideIndicator();
				}, options);
				break;
			case 'document':
				$$("#dateFile").val(moment().format('YYYY-MM-DD HH:mm:ss'));
				$$("#idUser").val(app.data('userInfo').id);			
				$$("#idServ").val(app.views.main.router.currentRoute.query.idService);
				$$("#idReq").val(app.views.main.router.currentRoute.query.idRequest);
				$$("#addFile").click();
				break;
		}
	},
	addFileProfile: function(element) {
		app.popover.close();
		var page = $$(element).attr("data-page");
		app.customFunctions.showIndicator();
		var url = API.host + '/api/operaciones-pruebas.php';
		switch($$(element).attr("data-target")) {
			case 'camera':
				var srcType = Camera.PictureSourceType.CAMERA;
				var options = setOptions(srcType);
				var func = createNewFileEntry;

				options.targetHeight = 512;
				options.targetWidth = 512;

				navigator.camera.getPicture(function cameraSuccess(imageData) {
					picGallery = null;
					if(page == "my-account") {
						imgMyAccount = imageData;
						$$("#currentPicProfile").attr("src", "data:image/png;base64," + imageData);
					}
					else {
						if(page == "pics") {
							imgMyAccount = imageData;
							$$("#newPicAdd").attr("src", "data:image/png;base64," + imageData);
						}
						else {
							imgReg = imageData;
							$$("#imgReg").attr("src", "data:image/png;base64," + imageData);
							$$("#imgReg").css("opacity", "1");
							$$("#imgReg").css("position", "absolute");
						}
					}
					app.customFunctions.hideIndicator();
				}, function cameraError(error) {
					app.customFunctions.hideIndicator();
				}, options);
				break;
			case 'gallery':
				var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
				var options = setOptions(srcType);
				var func = createNewFileEntry;

				options.targetHeight = 512;
				options.targetWidth = 512;

				navigator.camera.getPicture(function cameraSuccess(imageData) {
					picGallery = null;
					if(page == "my-account") {
						imgMyAccount = imageData;
						$$("#currentPicProfile").attr("src", "data:image/png;base64," + imageData);
					}
					else {
						if(page == "pics") {
							imgMyAccount = imageData;
							$$("#newPicAdd").attr("src", "data:image/png;base64," + imageData);
						}
						else {
							imgReg = imageData;
							$$("#imgReg").attr("src", "data:image/png;base64," + imageData);
							$$("#imgReg").css("opacity", "1");
							$$("#imgReg").css("position", "absolute");
						}
					}
					app.customFunctions.hideIndicator();
				}, function cameraError(error) {
					app.customFunctions.hideIndicator();
				}, options);
				break;
		}
	}
};

var app = new Framework7({
	root: '#app',
	name: 'terAPPia',
	version: '1.0.0',
	theme: 'md',
	language: 'es-ES',
	id: 'com.terappia.app',
	isMobileDevice: typeof cordova === "undefined" ? false : true,
	hasNetworkConnection: function () {
		return myApp.isMobileDevice ? navigator.connection.type !== Connection.NONE : true;
	},
	lazy: {
		threshold: 50,
		sequential: false,
		placeholder: 'data:image/png;base64,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'
	},
	panel: {
		swipe: 'right',
		swipeActiveArea: '230px'
	},
    views: {
        ignoreCache: true
    },
	routes: [{
		path: '/home/',
		url: 'home.html',
		on: {
			pageInit: function (e, page) {
				$$(".selectTax").removeClass("active");
				var userInfo = {};
                var markerCurrentLocation = null;
				if(typeof app.views.main.router.currentRoute.query.visit != "undefined") {
					userInfo = {
						reg_password: 0	
					};
					app.data('userInfo', userInfo);
				}
				else {
					userInfo = app.data('userInfo');
				}
				$$("#menuPacientes").css("display", "");
				professionals = null;
				var center = {lat: 41.4006307, lng: 2.1305987};                
				//var center = {lat: 41.3948976, lng: 2.0787282};                
                var map = new google.maps.Map(document.getElementById('homeMap'), {
					center: center,
					disableDefaultUI: true,
					zoom: 14,
					clickableIcons: false//,
					//styles: mapStyles
				});
                
                mapTest = map;
				
				if(typeof userInfo.filtro != "undefined") {
					if(typeof userInfo.filtro.reg != "undefined") {
						$$("#iconFiltro").css("display", "");
					}
				}
				else {
					$$("#iconFiltro").css("display", "none");
				}
				
				$$("#homeMap").on("touchstart", function(e) {
					e.stopPropagation();
				});
                
				navigator.geolocation.getCurrentPosition(function(info) {
					var coords = info.coords;
					currentLat = coords.latitude;
					currentLng = coords.longitude;
                    
                    markerCurrentLocation = new google.maps.Marker({
                        position: {lat: parseFloat(currentLat), lng: parseFloat(currentLng)},
                        map: mapTest,
                        title: "Mi ubicación actual",
                        info: "Esta es mi ubicación"
                    });
                    
                    mapTest.setZoom(14);
                    mapTest.setCenter(new google.maps.LatLng(currentLat, currentLng));

                    markerCurrentLocation.addListener('click', function() {
                        infowindow.setContent("Esta es mi ubicación");
                        infowindow.open(mapTest, markerCurrentLocation);
                    });
                    
				}, function(error) {
					//console.log(error);
				}, { enableHighAccuracy: true });
				
				var professionalsHome = [], markers = [];
				
				var infowindow = new google.maps.InfoWindow({
				  content: ''
				});

				var bounds = new google.maps.LatLngBounds();
                
                if(app.views.main.router.currentRoute.path == "/home/") {
                    if(typeof userInfo.reg_password != "undefined") {
                        app.customFunctions.showIndicator();
                        API.loadInfoProfessionalsAll({
                            i: userInfo.reg_password,
                            lat: currentLat,
                            lng: currentLng,
                            d: moment().format('YYYY-MM-DD')
                        }, function (json) {
                            professionalsHome = json;

                            professionals = json;

                            if(json.length > 0) {
                                var markr = 'img/user-marker.png';
                                var name = "";
                                var lat = 0.0;
                                var lng = 0.0;
                                var trat = "";
                                json.forEach(function(p, k) {
                                    trat = "";
                                    lat = parseFloat(p.latitud);
                                    lng = parseFloat(p.longitud);
                                    if(parseInt(p.agenda) > 0) {
                                        markr = 'img/user-marker.png';
                                    }
                                    else {
                                        markr = 'img/user-marker-2.png';
                                    }

                                    name = p.nombre;
                                    if(parseInt(p.es_profesional) > 0) {
                                        name += p.apellidos;
                                    }
                                    
                                    p.tratamientos.forEach(function(tra) {
                                        trat += tra.tipotratamiento + ", ";
                                    });
                                    if(trat.length > 0) {
                                        trat = trat.substring(0, trat.length-2);
                                    }

                                    markers[k] = new google.maps.Marker({
                                        position: {lat: parseFloat(p.latitud), lng: parseFloat(p.longitud)},
                                        icon: {
                                            url: markr,
                                            scaledSize: new google.maps.Size(36, 53),
                                            origin: new google.maps.Point(0, 0),
                                            anchor: new google.maps.Point(0, 0)
                                        },
                                        map: map,
                                        title: name,
                                        info: p,
                                        street: ((p.ciudad != null && p.ciudad != "" ? p.ciudad : "") + " " + (p.calle != null && p.calle != "" ? p.calle : "") + " " + (p.numero != null && p.numero != "" ? p.numero : "")),
                                        cat: trat
                                    });

                                    markers[k].addListener('click', function() {

                                        var inf = this.info;

                                        var query = JSON.stringify(inf);
                                        /*if(inf.es_centro == 1) {
                                            query = "1&reg=" + inf.reg_password+"&centr=1";
                                        }*/

                                        infoTaxsUser = query;

                                        infowindow.setContent('<a href="/taxsUser/?q=1">'+this.title + '<p>'+starsRanking(inf.puntaje) + ' <span style=" margin-top: -3px;">('+inf.cant+')</span>'+'</p>' + "<p>" + this.street + "</p>"+'</a>');
                                        infowindow.open(map, markers[k]);
                                        /*
                                        setTimeout(function() {
                                            app.router.navigate({
                                                url: '/taxsUser/?data=' + query
                                            });
                                        }, 3000);*/
                                    });
                                    bounds.extend(new google.maps.LatLng(parseFloat(p.latitud), parseFloat(p.longitud)));						
                                });
                                if(json.length == 1) {
                                    map.setZoom(14);
                                    map.setCenter(new google.maps.LatLng(lat, lng));
                                }
                                else {
                                    map.fitBounds(bounds);
                                }
                                markersTest = markers;
                            }
                            app.customFunctions.hideIndicator();

                        }, function (error) {
                            app.customFunctions.hideIndicator();
                            //console.log(error);
                        });
                    }
                }
				
				$$(".selectTax").click(function() {
					var option = $$(this).attr("data-value");
					var band = true;
                    var allMarkers = false;
					if($$(this).hasClass("active")) {
						band = false;
                        allMarkers = true;
					}
					$$(".selectTax").removeClass("active");
                    if(band) {
						$$(this).addClass("active");
                    }
					
                    bounds = new google.maps.LatLngBounds();
                    var center = {lat: 41.4006307, lng: 2.1305987};
                    var cant = 0;
                    if(markers.length > 0) {
                        for (var i = 0; i < markers.length; i++) {
                            if(allMarkers) {
                                markers[i].setVisible(true);
                                bounds.extend(markers[i].getPosition());
                                cant++;
                            }
                            else {
                                if(markers[i].cat.indexOf(option) == -1) {
                                    markers[i].setVisible(false);
                                }
                                else {
                                    markers[i].setVisible(true);
                                    center = markers[i].getPosition();
                                    bounds.extend(markers[i].getPosition());
                                    cant++;
                                }
                            }
                        }
                    }
                    if(cant.length == 1) {
                        map.setZoom(14);
                        map.setCenter(center);
                    }
                    else {
                        if(cant.length > 1) {
                            map.fitBounds(bounds);
                        }
                    }
				});
			}
		}
	}, {
		path: '/login/',
		url: 'login.html',
		on: {
			pageInit: function (e, page) {				
				navigator.geolocation.getCurrentPosition(function(info) {
					var coords = info.coords;
					currentLat = coords.latitude;
					currentLng = coords.longitude;
				}, function(error) {
					//console.log(error);
				}, { enableHighAccuracy: true });
				
				API.loadTerminos({}, function(json) {
					if(json.info.length > 0) {
                        terminos = json.info;
						var html = '';
						/*json.info.forEach(function(t) {
							html += '<p style=" margin: 20px; text-align: justify;">'+t.texto+'</p>';
						});*/
						$$(".popup-terminos .page-content").html('<p style=" margin: 20px; text-align: justify;">'+terminos[0].texto+'</p>');
					}
				}, function(error) {
					//console.log(error);
				});
				
				$$("#containerFinger").css("display", "none");
				/*
				if(cordovaIfDefined) {
					Fingerprint.isAvailable(function(result) {
						console.log("available");
						console.log(result);
						$$("#containerFinger").css("display", "");
					}, function(message) {
						console.log("not available");
						console.log(message);
					});
				}*/
				
				var userInfo = app.data('userInfo');
				$$(".menus").hide();

				if (!isEmpty(userInfo)) {
					if(!push) {
						if(userInfo.password != "") {
							if(userInfo.reg_password > 0) {
								if(typeof userInfo.huellas == "undefined") {
									if(parseInt(userInfo.huella) == 1) {
										getFingerVerification();
									}
									else {
										if(parseInt(userInfo.mail) > 0) {
											$$("#email").val(userInfo.email);
										}
										else {
											$$("#email").val(userInfo.telefono);
										}
										$$("#password").val(userInfo.password);

										currentLat = userInfo.latitud;
										currentLng = userInfo.longitud;

										setTimeout(function () {
											$$("#login-check-access").trigger('click');
										}, 300);
									}
								}
							}
						}
						else {
                            app.customFunctions.showIndicator();
							setTimeout(function () {
								//withFacebook();
                                app.customFunctions.hideIndicator();
                                fb = true;
                                var info = app.data('userInfo');
                                if(parseInt(info.usuario) == 0 && parseInt(info.profesional) == 0 && parseInt(info.centrodesalud) == 0) {
                                    app.dialog.create({
                                        title: 'Seleccione que tipo de usuario será en la app.',
                                        text: 'Tipos de usuario',
                                        buttons: [
                                          {
                                            text: 'Usuario',
                                            onClick: function() {
                                                saveTypeUser(1);
                                            }
                                          },
                                          {
                                            text: 'Profesional',
                                            onClick: function() {
                                                saveTypeUser(2);
                                            }
                                          },
                                          {
                                            text: 'Centro',
                                            onClick: function() {
                                                saveTypeUser(3);
                                            }
                                          },
                                        ],
                                        cssClass: "myAlert",
                                        verticalButtons: true,
                                    }).open();
                                }
                                else {
                                    var json = app.data('userInfo');
                                    if(parseInt(json.usuario) > 0) {
                                        if(typeof json.filtro.reg_ficha != "undefined") {
                                            app.router.navigate({
                                                url: '/filtro/'
                                            });
                                        }
                                        else {
                                            if(typeof json.nombre == "undefined") {
                                                app.router.navigate({
                                                    url: '/my-account/'
                                                });
                                            }
                                            else {
                                                app.router.navigate({
                                                    url: '/filtro/'
                                                });
                                            }
                                        }
                                    }
                                    else if(parseInt(json.profesional) > 0) {
                                        if(typeof json.nombre == "undefined") {
                                            app.router.navigate({
                                                url: '/my-account/'
                                            });
                                        }
                                        else {
                                            app.router.navigate({
                                                url: '/agenda/'
                                            });
                                        }
                                    }
                                    else if(parseInt(json.centrodesalud) > 0) {
                                        app.router.navigate({
                                            url: '/home-center/'
                                        });
                                    }
                                }
                                
							}, 500);
						}
					}
				}
			}
		}
	}, {
		path: '/fingerprint/',
		url: 'fingerprint.html',
		on: {
			pageInit: function (e, page) {				
				if(cordovaIfDefined) {
					getFingerVerification();
				}
			}
		}
	}, {
		path: '/register/',
		url: 'register.html',
		on: {
			pageInit: function (e, page) {
                
                const myInput = document.getElementById('register-re-email');
                 myInput.onpaste = function(e) {
                   e.preventDefault();
                 }
                 
                 $$("#register-phone").focus(function() {
                     if($$("#register-phone").val() == "") {
                         $$("#register-phone").val("0034");
                     }
                 });
                
                 $$("#register-phone").blur(function() {
                     if($$("#register-phone").val() == "0034") {
                         $$("#register-phone").val("");
                     }
                 });
                
				$$("#validRegister").off("click").click(function() {
					var band = false;
					var msg = "";
					if($$("#register-email").val() != "") {
						if(API.isValidEmail($$("#register-email").val())) {
                            if($$("#register-re-email").val() != "") {
                                if(API.isValidEmail($$("#register-re-email").val())) {
                                    if($$("#register-email").val() == $$("#register-re-email").val()) {
                                        band = true;
                                    }
                                    else {
                                        msg = "Los correos ingresados no coinciden.";
                                    }
                                }
                                else {
                                    msg = "El correo electrónico ingresado es inválido.";
                                }
                            }
                            else {
                                msg = "Debe repetir su correo electrónico.";
                            }
						}
						else {
							msg = "El correo electrónico ingresado es inválido.";
						}
					}
					
					if($$("#register-phone").val() != "") {
						band = false;
						if($$("#register-phone").val().length > 8) {
							if($$("#register-phone").val().substring(0, 1) == "+") {
								if($$("#register-phone").val().substring(0, 2) == "34") {
									if($$("#register-phone").val().substring(2, 4) != "80" && $$("#register-phone").val().substring(2, 4) != "90") {
										band = true;
										msg = "";
									}
									else {
										msg = "No permitido los numeros 80 y 90.";
									}
								}
								else {
									msg = "El formato del teléfono tiene que ser 0034xxxxxxxxx.";
								}
							}
							else {
								if($$("#register-phone").val().substring(0, 2) == "00") {
									if($$("#register-phone").val().substring(2, 4) == "34") {
										if($$("#register-phone").val().substring(4, 6) != "80" && $$("#register-phone").val().substring(4, 6) != "90") {
											band = true;
											msg = "";
										}
										else {
											msg = "No permitido los numeros 80 y 90.";
										}
									}
									else {
										msg = "El formato del teléfono tiene que ser 0034xxxxxxxxx.";
									}
								}
								else {
									msg = "El formato del teléfono tiene que ser 0034xxxxxxxxx.";
								}
							}
						}
						else {
							msg = "La longitud del numero debe ser mayor a 9.";
						}
					}
					
					if(band) {
						if($$("#register-password").val().length > 3) {
							if($$("#register-password").val() == $$("#register-password-confirm").val()) {
                                if($$("input[type=checkbox][name=acept]:checked").length == 2) {
                                    API.validEmailPhone({
                                        e: $$("#register-email").val(),
                                        p: $$("#register-phone").val()
                                    }, function(json) {
                                        if(json.msg == "OK") {
                                            var data = app.form.convertToData('#form-register');
                                            app.router.navigate({
                                                url: '/confirm/?registerData=' + JSON.stringify(data)
                                            });
                                        }
                                        else {
                                            //logout();
                                            app.dialog.alert(json.msg);
                                        }
                                    }, function(error) {
                                        //console.log(error);
                                    });
                                }
                                else {
                                    app.dialog.alert("Debe aceptar los Términos y condiciones y las Políticas de privacidad.");
                                }
							}
							else {
								app.dialog.alert("Las contraseñas no coinciden.");
							}
						}
						else {
							app.dialog.alert("La contraseña debe estar en un rango de 4 y 10 dígitos.");
						}
					}
					else {
						if(msg == "") {
							app.dialog.alert("Debe ingresar el correo electronico o el numero de telefono");
						}
						else {
							app.dialog.alert(msg);
						}
					}
				});
			}
		}
	}, {
		path: '/confirm/',
		url: 'confirm.html',
		on: {
			pageInit: function (e, page) {
				var query = app.views.main.router.currentRoute.query;
				if(typeof query.update != "undefined") {
					query.registerData = JSON.parse(query.update);
				}
				else {
					query.registerData = JSON.parse(query.registerData);
				}
				codeConfirm = "";
				dateConfirm = null;
				
				currentLat = null, currentLng = null;
				navigator.geolocation.getCurrentPosition(function(info) {
					var coords = info.coords;
					currentLat = coords.latitude;
					currentLng = coords.longitude;
				}, function(error) {
					//console.log(error);
				}, { enableHighAccuracy: true });
				
				setCodeUser = function(element) {
					var option = $$(element).attr("data-target");
					dateConfirm = moment().format('YYYY-MM-DD HH:mm:ss');
					var band = true;					
					var e, p;
					if(typeof query.update != "undefined") {
						var userInfo = app.data('userInfo');
                        if(typeof query.registerData.p != "undefined" || typeof query.registerData.e != "undefined") {
                            if(typeof query.registerData.p != "undefined") {
                                if(parseInt(option) == 2) {
                                    band = false;
                                    app.dialog.alert("No puedes usar esta opción, estas actualizando el teléfono y se requiere la verificación por la misma vía.");
                                }
                                else {
                                    p = query.registerData.phone;
                                }
                            }
                            else {
                                if(parseInt(option) == 1) {
                                    band = false;
                                    app.dialog.alert("No puedes usar esta opción, estas actualizando el correo y se requiere la verificación por la misma vía.");
                                }
                                else {
                                    e = query.registerData.email;
                                }
                            }
                        }
                        else {
                            switch(parseInt(option)) {
                                case 1:
                                    if(typeof query.registerData.phone == "undefined" || query.registerData.phone == "") {
                                        band = false;
                                        app.dialog.alert("No puede usar esta opción sino añadio un telefono en el registro");
                                    }
                                    else {
                                        p = query.registerData.phone;
                                    }
                                    break;
                                case 2:
                                    if(typeof userInfo.email == "undefined" || userInfo.email == "") {
                                        band = false;
                                        app.dialog.alert("No puede usar esta opción sino añadio un correo electronico en el registro");
                                    }
                                    else {
                                        e = userInfo.email;
                                    }
                                    break;
                            }
                        }
					}
					else {
						switch(parseInt(option)) {
							case 1:
								if(typeof query.registerData.phone == "undefined" || query.registerData.phone == "") {
									band = false;
									app.dialog.alert("No puede usar esta opción sino añadio un telefono en el registro");
								}
								else {
									p = query.registerData.phone;
								}
								break;
							case 2:
								if(typeof query.registerData.email == "undefined" || query.registerData.email == "") {
									band = false;
									app.dialog.alert("No puede usar esta opción sino añadio un correo electronico en el registro");
								}
								else {
									e = query.registerData.email;
								}
								break;
						}						
					}
					
					if(band) {
						$$(element).attr("disabled", true);
						API.sendCodeConfirm({
							d: dateConfirm,
							e: e,
							p: p,
							o: option
						}, function(json) {
							$$(element).attr("disabled", false);
							if(json.msg == "OK") {
								codeConfirm = json.code;
								app.dialog.alert("Su código de verificacion se ha enviado, en breve lo recibirá.");
							}
							else {
								app.dialog.alert(json.msg);
							}
						}, function(error) {
							//console.log(error);
						});
					}
				};
			}
		}
	}, {
		path: '/home-center/',
		url: 'home-center.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				
				app.customFunctions.showIndicator();
				API.loadInfoProfesionalsCenter({
					i: userInfo.reg_password,
					d: moment().format('YYYY-MM-DD')
				}, function (json) {
					var html = "";
					var style = "";
					var h1, h2, hours = [], citas;
					json.forEach(function(date) {
						html += '<div class="swiper-slide" data-date="'+date.dia+'" style="width: 100%;"><div class="row"><div class="col-15" style=" text-align: right;"><a href="javascript: app.swiper.get(\'.sw2\').slidePrev();" class="link" style=" margin-top: 15px;"><i class="fas fa-arrow-left"></i></a></div><div class="col-70"><p style=" text-align: center;"><strong>'+date.fecha+'</strong></p></div><div class="col-15"><a href="javascript: app.swiper.get(\'.sw2\').slideNext();" class="link" style=" margin-top: 15px;"><i class="fas fa-arrow-right"></i></a></div></div><div class="row" style="margin-left: 10px;margin-right: 10px;margin-bottom:  10px;">';
						Object.keys(date.dias).map(function (key) {
							html += '<div class="col-25"><p style=" margin-top: 0; margin-bottom: 5px; text-align: center;">'+date.dias[key][0].nombre + " " + date.dias[key][0].apellidos +'</p><div style=" background: #9ffaff; text-align: center;">';
							hours = [];
							date.dias[key].forEach(function(d) {
								style = "";
								
								d.horas.forEach(function(h) {
									if(parseInt(h["cita"]) == 1) {
										style = "text-decoration: line-through;";
									}
									html += '<p style=" margin: 0; '+style+'">'+h["hora"]+'</p>';
									style = "";
								});
							});
							html += '</div></div>';
						});
						html += '</div></div>';
					});
					$$("#containerDatesProfessionalsCenter").html(html);
					
					var swiper = app.swiper.create('.sw2', {
						speed: 400,
						spaceBetween: 100
					});
					
					var band = false;
					$$("#containerDatesProfessionalsCenter .swiper-slide").each(function(index, value) {
						if($$(value).attr("data-date") == moment().format("YYYY-MM-DD")) {
							swiper.slideTo(index, 0);
							band = true;
						}
					});
					if(!band) {
						$$("#containerDatesProfessionalsCenter .swiper-slide").each(function(index, value) {
							if(moment().isAfter($$(value).attr("data-date"), "YYYY-MM-DD")) {
								swiper.slideTo(index > 0 ? (index - 1) : 0, 0);
								return;
							}
						});
					}
					
					app.customFunctions.hideIndicator();
				}, function (error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				if(userInfo.imagenes.length > 0) {
					var html = "";
					userInfo.imagenes.forEach(function(p) {
						html += '<div class="swiper-slide" style="width: 100%;height:  225px;"><img src="'+(API.host + "/images/pics/" + p.foto)+'" style="width: 100%;height: 100%;"> <p style=" margin-left: 15px; font-weight: 600; font-size: 15px; margin-top: 5px;">'+p.texto+'</p></div>';
					});
					$$("#containerPicsHomeCenter").html(html);

					var swiper = app.swiper.create('.sw1', {
						speed: 400,
						spaceBetween: 100
					});
				}
				$$("#titleCenterHome").html(userInfo.nombre);
				$$("#menuCentro").css("display", "");
			}
		}
	}, {
		path: '/professionals-center/',
		url: 'professionals-center.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				app.customFunctions.showIndicator();
				API.loadProfesionalCenter({
					i: userInfo.reg_password,
					center: 1
				}, function(json) {
					app.customFunctions.hideIndicator();
					//console.log(json);
				 	var html = "";
					var taxs = "";
					professionals = json;
					json.forEach(function(u) {
						taxs = "";
						u.tratamientos.forEach(function(t) {
							taxs += t.tratamiento + ' | ';
						});
						if(taxs != "") {
							taxs = taxs.substr(0, (taxs.length -2));
						}
						html += '<li style=" height: 96px;"> <a href="/agenda/?i='+u.reg_password+'&esc=0&esp=1&center=1'+'" class="item-link item-content selectProfessional orderProfessionals" data-id="'+u.reg_relacionprof+'" data-orden="'+u.orden+'"> <div class="item-media"><img src="'+((u.foto != null && u.foto != "" ? (API.host + "/images/pics/" + u.foto) : 'img/avatar-default-alt.png'))+'" width="60" style=" border-radius: 50%;"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+ u.nombre + " " + u.apellidos +'</div> <div class="item-after" style=" font-size: 12px;">'+starsRanking(u.puntaje)+'<span style="margin-top:-3px;margin-left: 2px;">('+u.cant+')</span>'+'</div> </div> <div class="item-text">'+taxs+'</div> </div> </a> <div class="sortable-handler" style=" right: 0;"></div> </li>';
					});
					$$("#listProfessionalsCenter").html(html);
					
					/*$$(".selectProfessional").click(function() {
						$$("li").removeClass("item-divider");
						$$(this).closest("li").addClass("item-divider");
					});
					
					$$(".page[data-name=professionals-center]").on("click", function(e) {
						if($$(e.target).closest("#listProfessionalsCenter").length == 0) {
							$$("li").removeClass("item-divider");
						}
					});*/
					
				}, function(error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
			}
		}
	}, {
		path: '/planning/',
		url: 'planning.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var calendarInline;
				
				API.loadEvents({
					i: userInfo.reg_password
				}, function(json) {
					//console.log(json);
				}, function(error) {
					//console.log(error);
				});
				
				calendarInline = app.calendar.create({
				  containerEl: '#calendar',
				  value: [new Date()],
				  weekHeader: true,
				  dateFormat: 'DD/MM/YYYY',
				  monthNames: monthNames,
				  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
				  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
				  renderToolbar: function () {
					return '<div class="toolbar calendar-custom-toolbar no-shadow">' +
					  '<div class="toolbar-inner">' +
						'<div class="left">' +
						  '<a href="#" class="link icon-only"><i class="fal fa-arrow-left"></i></a>' +
						'</div>' +
						'<div class="center"></div>' +
						'<div class="right">' +
						  '<a href="#" class="link icon-only"><i class="fal fa-arrow-right"></i></a>' +
						'</div>' +
					  '</div>' +
					'</div>';
				  },
				  on: {
					init: function (c) {
					  $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth].toUpperCase() + " " + c.currentYear);
					  $$('.calendar-custom-toolbar .left .link').on('click', function () {
						calendarInline.prevMonth();
					  });
					  $$('.calendar-custom-toolbar .right .link').on('click', function () {
						calendarInline.nextMonth();
					  });
					},
					dayClick: function(c, el) {
						/*$$("#labelDayClass").html("CLASES " + el.textContent.trim() + " " + monthNames[c.currentMonth].toUpperCase());
						var html = "";
						var daysTmp = daysArr.concat([]);
						var dayC = c.currentYear + "-" + zeroFill((c.currentMonth+1), 2) + "-" + zeroFill(el.textContent.trim(), 2);
						daysTmp.push(new Date(c.currentYear, c.currentMonth, parseInt(el.textContent.trim()), 0, 0, 0, 0));
						calendarInline.setValue(daysTmp);
						daysClasses.forEach(function(d) {
							if(moment(d.fecha, "YYYY-MM-DD").format("YYYY-MM-DD") == dayC) {
								d.clases.forEach(function(c) {
									html += '<li style="border-bottom: 1.5px solid #363940;height: 30px;line-height: 30px;font-size: 12px;padding-left:  25px; max-width: none; padding-right: 25px;" class="row"> <div class="col-20" style=" text-align: left;">'+moment(c.fecha, "YYYY-MM-DD HH:mm:ss").format("hh:mma")+'</div> <div class="col-30" style=" color: #decf1b; text-align: left;">'+c.nombre.toUpperCase()+'</div> <div class="col-20" style=" text-align: left; color: gray;">30 min.</div> <div class="col-30" style=" text-align: left;"><button class="col button button-fill button-round" style=" height: 20px; line-height: 20px; background-color: #decf1b; color: black; font-size: 11px; font-weight: 600;" onclick="addClass(this);" data-id="'+c.id+'" data-info=\''+JSON.stringify(c)+'\'>Apuntarme</button></div> </li>';
								});
							}
						});
						$$("#listClassDay").html(html);*/
					},
					monthYearChangeStart: function (c) {
					  $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth].toUpperCase() + " " + c.currentYear);
					}
				  }
				});
				
			}
		}
	}, {
		path: '/planning-professional/',
		url: 'planning-professional.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var calendarInline;
                
                $$("#calendarFrom").val(moment().format('DD/MM/YYYY'));
				$$("#calendarUntil").val(moment().format('DD/MM/YYYY'));
				var today = moment();
				var calendarDefault1 = app.calendar.create({
				  inputEl: '#calendarFrom',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					minDate: today,
					on: {
						dayClick: function(c, el) {
							calendarDefault1.close();
						}
				  	}
				});
				var calendarDefault2 = app.calendar.create({
				  inputEl: '#calendarUntil',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					minDate: today,
					on: {
						dayClick: function(c, el) {
							calendarDefault2.close();
						}
				  	}
				});
                
                
				app.customFunctions.showIndicator();
				API.loadCenterProfesional({
					i: userInfo.reg_password
				}, function(json) {
					var html = '<option value="">Ninguno</option>';
					if(json.length > 0) {
						json.forEach(function(c) {
							html += '<option value="'+c.reg_password+'">'+c.nombre+'</option>';
						});
					}
					$$("#centrosSaludAgenda").html(html);
					app.customFunctions.hideIndicator();
				}, function(error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				if(parseInt(userInfo.trabajafiestas) > 0) {
					$$("#daysAgenda").html('<option value="1" selected="">Lunes</option> <option value="2" selected="">Martes</option> <option value="3" selected="">Miércoles</option> <option value="4" selected="">Jueves</option> <option value="5" selected="">Viernes</option> <option value="6" selected="">Sábado</option> <option value="0" selected="">Domingo</option>');
				}
				else {
					$$("#daysAgenda").html('<option value="1" selected="">Lunes</option> <option value="2" selected="">Martes</option> <option value="3" selected="">Miércoles</option> <option value="4" selected="">Jueves</option> <option value="5" selected="">Viernes</option> <option value="6">Sábado</option> <option value="0">Domingo</option>');
				}
                
                $$("#saveAgenda").click(function() {
                    var userInfo = app.data('userInfo');
                    
                    app.smartSelect.open(".smart-days-agenda");
                    app.smartSelect.close(".smart-days-agenda");
                    
                    var dias = [];
                    if(typeof app.smartSelect.get(".smart-days-agenda").items != "undefined") {
                        app.smartSelect.get(".smart-days-agenda").items.forEach(function(d) {
                           if(d.selected) {
                               dias.push(d.value);
                           }
                        });
                    }
                    else {
                        dias = $$("#daysAgenda").val();
                    }
                    
                    if(dias.length > 0) {
                        var d1 = moment($$("#calendarFrom").val(), "DD/MM/YYYY");
                        var d2 = moment($$("#calendarUntil").val(), "DD/MM/YYYY");
                        if(d1.isBefore(d2) || d1 == d1) {
							app.customFunctions.showIndicator();
                            API.saveAgenda({
                                i: userInfo.reg_password,
                                desde: d1.format("YYYY-MM-DD"),
                                hasta: d2.format("YYYY-MM-DD"),
                                horaDesde: $$("#calendarFromHours").val(),
                                horaHasta: $$("#calendarUntilHours").val(),
                                horaDesdeD: $$("#calendarFromHoursBreakProf").val(),
                                horaHastaD: $$("#calendarUntilHoursBreakProf").val(),
                                centro: $$("#centrosSaludAgenda").val(),
                                visita: $$("#visit").val(),
                                valueAgenda: $$("#valueAgenda").val(),
                                dias: JSON.stringify(dias)
                            }, function(json) {
								app.customFunctions.hideIndicator();
                                if(json.msg == "OK") {
                                    calendarDefault1.setValue([moment()]);
                                    calendarDefault2.setValue([moment()]);
                                	//$$("#calendarFrom").val(moment().format('DD/MM/YYYY'));
									//$$("#calendarUntil").val(moment().format('DD/MM/YYYY'));
									app.dialog.alert("Los datos se han almacenado correctamente.");
									
									API.getInfoProfesional({
										i: userInfo.reg_password,
										d: moment().format('YYYY-MM-DD'),
										u: 1
									}, function (json) {
										loadDatesProfessional(json, 0);
									}, function (error) {
										//console.log(error);
									});
                                }
								else {
                                    if(json.msg.indexOf("disponibles") >= 0) {
                                        app.dialog.alert(json.msg);
                                    }
                                    else {
                                        app.dialog.confirm(json.msg, function () {
                                            app.customFunctions.showIndicator();
                                            API.saveAgenda({
                                                 i: userInfo.reg_password,
                                                desde: d1.format("YYYY-MM-DD"),
                                                hasta: d2.format("YYYY-MM-DD"),
                                                horaDesde: $$("#calendarFromHours").val(),
                                                horaHasta: $$("#calendarUntilHours").val(),
                                                horaDesdeD: $$("#calendarFromHoursBreakProf").val(),
                                                horaHastaD: $$("#calendarUntilHoursBreakProf").val(),
                                                centro: $$("#centrosSaludAgenda").val(),
                                                visita: $$("#visit").val(),
                                                valueAgenda: $$("#valueAgenda").val(),
                                                dias: JSON.stringify(dias),
                                                delete: 1
                                            }, function(json) {
                                                app.customFunctions.hideIndicator();
                                                calendarDefault1.setValue([moment()]);
                                                calendarDefault2.setValue([moment()]);
                                                //$$("#calendarFrom").val(moment().format('DD/MM/YYYY'));
                                                //$$("#calendarUntil").val(moment().format('DD/MM/YYYY'));
                                                app.dialog.alert("Los datos se han almacenado correctamente.");

                                                API.getInfoProfesional({
                                                    i: userInfo.reg_password,
                                                    d: moment().format('YYYY-MM-DD'),
                                                    u: 1
                                                }, function (json) {
                                                    loadDatesProfessional(json, 0);
                                                }, function (error) {
                                                    //console.log(error);
                                                });

                                            }, function(error) {
                                                //console.log(error);
                                            });
                                        });
                                    }
								}
                            }, function(error) {
                                app.customFunctions.hideIndicator();
                                //console.log(error);
                            });
                        }
                        else {
                            app.dialog.alert("El rango de fechas esta incorrecto, la fecha inicial debe ser menor o igual a la fecha final.");
                        }
                    }
                    else {
                        app.dialog.alert("Debe seleccionar algun día de la semana.");
                    }
                });
                
                var html = "";
				var t = 30;
				for(var i = 8; i <= 22; i+=0.5) {
					var j = i | 0;
					j = zeroFill(j, 2);
					t = t == 0 ? 30 : 0;
					html += '<option value="'+j+":"+zeroFill(t, 2)+':00">'+j+":"+zeroFill(t, 2)+'</option>';
				}
				
				$$("#calendarFromHours").html(html);
				$$("#calendarUntilHours").html(html);
				$$("#calendarFromHoursBreakProf").html(html);
				$$("#calendarUntilHoursBreakProf").html(html);
				
			}
		}
	}, {
		path: '/planning-center/',
		url: 'planning-center.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var calendarInline;
				app.customFunctions.showIndicator();
				API.loadProfesionalCenter({
					i: userInfo.reg_password
				}, function(json) {
					var html = '<option value="0">Seleccione</option>';
					if(json.length > 0) {
						json.forEach(function(p) {
							html += '<option value="'+p.reg_password+'">'+p.nombre+" "+p.apellidos+'</option>';
						});
					}
					$$("#profesionalesAgenda").html(html);
					app.customFunctions.hideIndicator();
				}, function(error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
                
                $$("#calendarFromCenter").val(moment().format('DD/MM/YYYY'));
				$$("#calendarUntilCenter").val(moment().format('DD/MM/YYYY'));
				var today = moment();
				var calendarDefault1 = app.calendar.create({
				  inputEl: '#calendarFromCenter',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					minDate: today,
					on: {
						dayClick: function(c, el) {
							calendarDefault1.close();
						}
				  	}
				});
				var calendarDefault2 = app.calendar.create({
				  inputEl: '#calendarUntilCenter',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					minDate: today,
					on: {
						dayClick: function(c, el) {
							calendarDefault2.close();
						}
				  	}
				});
                
                $$("#saveAgendaCenter").click(function() {
                    var userInfo = app.data('userInfo');
                    
                    app.smartSelect.open(".smart-days-agenda-center");
                    app.smartSelect.close(".smart-days-agenda-center");
                    
                    var dias = [];
                    if(typeof app.smartSelect.get(".smart-days-agenda-center").items != "undefined") {
                        app.smartSelect.get(".smart-days-agenda-center").items.forEach(function(d) {
                           if(d.selected) {
                               dias.push(d.value);
                           }
                        });
                    }
                    else {
                        dias = $$("#daysAgendaCenter").val();
                    }
                    
                    if(dias.length > 0) {
                        var d1 = moment($$("#calendarFromCenter").val(), "DD/MM/YYYY");
                        var d2 = moment($$("#calendarUntilCenter").val(), "DD/MM/YYYY");
                        if(d1.isBefore(d2) || d1 == d1) {
							if(parseInt($$("#profesionalesAgenda").val()) > 0) {
								app.customFunctions.showIndicator();
								API.saveAgendaCenter({
									i: userInfo.reg_password,
									desde: d1.format("YYYY-MM-DD"),
									hasta: d2.format("YYYY-MM-DD"),
									horaDesde: $$("#calendarFromHoursCenter").val(),
									horaHasta: $$("#calendarUntilHoursCenter").val(),
									horaDesdeD: $$("#calendarFromHoursCenterBreak").val(),
									horaHastaD: $$("#calendarUntilHoursCenterBreak").val(),
									profesional: $$("#profesionalesAgenda").val(),
									visita: $$("#visitCenter").val(),
									valueAgenda: $$("#valueAgendaCenter").val(),
									dias: JSON.stringify(dias)
								}, function(json) {
									app.customFunctions.hideIndicator();
									if(json.msg == "OK") {
                                        calendarDefault1.setValue([moment()]);
                                        calendarDefault2.setValue([moment()]);
										//$$("#calendarFromCenter").val(moment().format('DD/MM/YYYY'));
										//$$("#calendarUntilCenter").val(moment().format('DD/MM/YYYY'));
										app.dialog.alert("Los datos se han almacenado correctamente.");
									}
									else {
                                        if(json.msg.indexOf("disponibles") >= 0) {
                                            app.dialog.alert(json.msg);
                                        }
                                        else {
                                            app.dialog.confirm(json.msg, function () {
                                                app.customFunctions.showIndicator();
                                                API.saveAgendaCenter({
                                                    i: userInfo.reg_password,
                                                    desde: d1.format("YYYY-MM-DD"),
                                                    hasta: d2.format("YYYY-MM-DD"),
                                                    horaDesde: $$("#calendarFromHoursCenter").val(),
                                                    horaHasta: $$("#calendarUntilHoursCenter").val(),
                                                    horaDesdeD: $$("#calendarFromHoursCenterBreak").val(),
                                                    horaHastaD: $$("#calendarUntilHoursCenterBreak").val(),
                                                    profesional: $$("#profesionalesAgenda").val(),
                                                    visita: $$("#visitCenter").val(),
                                                    valueAgenda: $$("#valueAgendaCenter").val(),
                                                    dias: JSON.stringify(dias),
                                                    delete: 1
                                                }, function(json) {
                                                    app.customFunctions.hideIndicator();
                                                    calendarDefault1.setValue([moment()]);
                                                    calendarDefault2.setValue([moment()]);
                                                    //$$("#calendarFromCenter").val(moment().format('DD/MM/YYYY'));
                                                    //$$("#calendarUntilCenter").val(moment().format('DD/MM/YYYY'));
                                                    app.dialog.alert("Los datos se han almacenado correctamente.");
                                                }, function(error) {
                                                    //console.log(error);
                                                });
                                            });
                                        }
									}
								}, function(error) {
                                    app.customFunctions.hideIndicator();
									//console.log(error);
								});
							}
							else {
								app.dialog.alert("Debe seleccionar un profesional para continuar.");
							}
                        }
                        else {
                            app.dialog.alert("El rango de fechas esta incorrecto, la fecha inicial debe ser menor o igual a la fecha final.");
                        }
                    }
                    else {
                        app.dialog.alert("Debe seleccionar algun día de la semana.");
                    }
                });
                
                var html = "";
				var t = 30;
				for(var i = 8; i <= 22; i+=0.5) {
					var j = i | 0;
					j = zeroFill(j, 2);
					t = t == 0 ? 30 : 0;
					html += '<option value="'+j+":"+zeroFill(t, 2)+':00">'+j+":"+zeroFill(t, 2)+'</option>';
					
				}
				
				$$("#calendarFromHoursCenter").html(html);
				$$("#calendarUntilHoursCenter").html(html);
				
				$$("#calendarFromHoursCenterBreak").html(html);
				$$("#calendarUntilHoursCenterBreak").html(html);
				
			}
		}
	}, {
		path: '/center-profile/',
		url: 'center-profile.html',
		on: {
			pageInit: function (e, page) {
				var userInfo1 = app.data('userInfo');
				
				if(typeof userInfo1.nombre != "undefined") {
					if(userInfo1.nombre != null && userInfo1.nombre != "") {
						$$("#center-name").val(userInfo1.nombre);
					}
					if(userInfo1.direccion != null && userInfo1.direccion != "") {
						$$("#center-location").val(userInfo1.direccion);
					}
					if(userInfo1.codigopostal != null && userInfo1.codigopostal != "") {
						$$("#center-code-postal").val(userInfo1.codigopostal);
					}
					if(userInfo1.ciudad != null && userInfo1.ciudad != "") {
						$$("#center-city").val(userInfo1.ciudad);
					}
				}
				
				API.getPics({
					i: userInfo1.reg_password
				}, function(json) {
					var html = "";
					if(json.length > 0) {
						json.forEach(function(p) {
							html += '<div class="swiper-slide"><img src="'+(API.host + "/images/pics/" + p.foto)+'" style="width: 100%;    height: 100%;"> <p style=" margin-left: 15px; font-weight: 600; font-size: 15px; margin-top: 5px;">'+p.texto+'</p></div>';
						});
						$$(".swiper-wrapper").html(html);
						
						var swiper = app.swiper.create('.swiper-container', {
							speed: 400,
							spaceBetween: 100
						});
						
					}
				}, function(error) {
					//console.log(error);
				});
				
				$$("#registerDatesProfile").click(function() {
					var userInfo = app.data('userInfo');
					if(userInfo.reg_password == 0) {
						app.dialog.alert("Debe registrarse para poder utilizar esta función.");
					}
					else {
						API.saveDatesCenter({
							name: $$("#center-name").val(),
							codePostal: $$("#center-code-postal").val(),
							i: userInfo.reg_password
						}, function(json) {
							json.info.password = userInfo.password;
							userInfo = json.info;
							app.data('userInfo', userInfo);
							app.dialog.alert("Información añadida correctamente.");
							if(typeof app.views.main.router.currentRoute.query.page == "undefined") {
								app.router.navigate({
									url: '/home-center/'
								});
							}
						}, function(error) {
							//console.log(error);
						});
					}
				});
			}
		}
	}, {
		path: '/pics/',
		url: 'pics.html',
		on: {
			pageInit: function (e, page) {
				imgMyAccount = null;
				app.customFunctions.showIndicator();
				$$(".popover-add-picture-profile a").attr("data-page", "pics");
				//app.sortable.enable(".sortable");
				var pics = [];
				var picSelected = null;
                $$("#savePic").attr("data-i", 0);
				test = function(element) {
					$$("li").removeClass("item-divider");
                    console.log(element.target);
                    if(typeof element.path != "undefined") {
                        element.path.forEach(function(e) {
                            if(e.localName == "li") {
                                $$(e).addClass("item-divider");
                                $$("#deletePic").attr("data-id", $$(e).attr("data-id"));
                                picSelected = $$(e).attr("data-id");
                            }
                        });
                    }
                    else {
                        $$($$(element.target).closest("li")).addClass("item-divider");
                        $$("#deletePic").attr("data-id", $$($$(element.target).closest("li")).attr("data-id"));
                        picSelected = $$($$(element.target).closest("li")).attr("data-id");
                    }
					
					$$("#containerFirstOption").hide();
					$$("#containerOtherOptions").css("display", "flex");
				};
				
				test2 = function(element) {
					app.sortable.enable(".sortable");
					$$("li").removeClass("item-divider");
					$$("#containerOtherOptions").hide();
					$$("#containerFirstOption").css("display", "flex");
					picSelected = null;
				};
				
				$$("#deletePic").click(function() {
					var i = $$(this).attr("data-id");
					app.dialog.confirm('Esta seguro que desea eliminar esta foto?', function () {
						app.customFunctions.showIndicator();
						API.deletePic({
							i: i
						}, function(json) {
							app.customFunctions.hideIndicator();
							app.dialog.alert("Foto eliminada exitosamente.");
							$$("#containerOtherOptions").hide();
							$$("#containerFirstOption").css("display", "flex");
							
							app.sortable.disable(".sortable");
							
							if(json.msg == "DELETE") {
								var userInfo = app.data('userInfo');
								//userInfo.foto = null;
								app.data('userInfo', userInfo);
							}
							
							getPics();
						}, function(error) {
                            app.customFunctions.hideIndicator();
							//console.log(error);
						});
					});
				});
				
				$$("#modifyPic").click(function() {
					pics.forEach(function(p) {
						if(p.reg == picSelected) {
							$$("#newPicAdd").attr("src", API.host + "/images/pics/" + p.foto);
							$$("#text-pic").val(p.texto);
                            $$("#savePic").attr("data-i", p.reg);
						}
					});
				});
				
				function getPics() {
					var userInfo = app.data('userInfo');
					API.getPics({
						i: userInfo.reg_password
					}, function(json) {
						var html = "";
						app.customFunctions.hideIndicator();
						if(json.length > 0) {
							pics = json;
							json.forEach(function(p) {
								html += '<li style=" height: 108px;" data-id="'+p.reg+'"><a href="#" class="item-link item-content orderPics" onclick="test(event)"  data-id="'+p.reg+'" data-orden="'+p.orden+'"> <div class="item-media"><img src="'+(API.host + "/images/pics/" + p.foto)+'" width="80"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+(p.texto != null && p.texto != "" ? p.texto : "Sin título")+'</div> </div> </div></a> <div class="sortable-handler" style=" width: 100%; right: -120px;"></div> </li>'; //ontouchmove="test2();"
							});
						}
						$$("#listPics").html(html);
						
					}, function(error) {
                        app.customFunctions.hideIndicator();
						//console.log(error);
					});
				}
				
				$$(".page[data-name=pics]").on("click", function(e) {
					if($$(e.target).closest("#listPics").length == 0) {
						if(!$$(e.target).hasClass("fas")) {
							$$("li").removeClass("item-divider");
							$$("#containerOtherOptions").hide();
							$$("#containerFirstOption").css("display", "flex");
							picSelected = null;
                            $$(".sortable-action").css("display", "");
                            
                            if($$(".sortable").hasClass("sortable-enabled")) {
                                app.sortable.disable(".sortable");
                                var sort = [];
                                $$(".orderPics").each(function(index, value) {
                                    sort.push({
                                        id: $$(this).attr("data-id"),
                                        index: (index+1)
                                    });
                                });

                                API.saveOrderPics({
                                    pics: JSON.stringify(sort)
                                }, function(json) {
                                    //console.log(json);
                                }, function(error) {
                                    //console.log(error);
                                });
                            }
						}
					}
				});
				
				getPics();
				
				$$("#savePic").off("click").click(function() {
					var userInfo = app.data('userInfo');
					if(picSelected != null) {
						if($$("#text-pic").val() != "" || imgMyAccount != null) {
							app.customFunctions.showIndicator();
							app.request.post(API.host + '/api/operaciones-pruebas.php', {
								op: 11,
								i: userInfo.reg_password,
								img: imgMyAccount,
								text: $$("#text-pic").val(),
								edit: picSelected,
                                iedit: $$("#savePic").attr("data-i")
							}, function (json) {
								//console.log(json);
								app.customFunctions.hideIndicator();
								$$("li").removeClass("item-divider");
								$$("#containerOtherOptions").hide();
								$$("#containerFirstOption").css("display", "flex");
								picSelected = null;
								
								$$(".popup-close").trigger("click");
								app.dialog.alert("Foto actualizada exitosamente.");
								getPics();
							});
						}
						else {
							app.dialog.alert("Debe añadir una algo para continuar");
						}
					}
					else {
						if(imgMyAccount != null) {
							app.customFunctions.showIndicator();
							app.request.post(API.host + '/api/operaciones-pruebas.php', {
								op: 11,
								i: userInfo.reg_password,
								img: imgMyAccount,
								text: $$("#text-pic").val(),
                                iedit: $$("#savePic").attr("data-i")
							}, function (json) {
								//console.log(json);
								app.customFunctions.hideIndicator();
								$$(".popup-close").trigger("click");
								app.dialog.alert("Foto agregada exitosamente.");
								getPics();
							});
						}
						else {
							app.dialog.alert("Debe añadir una foto para continuar");
						}
					}
				});
				
				$$(".popup-close").click(function() {
					imgMyAccount = null;
					$$("#newPicAdd").attr("src", "img/avatar-default-alt.png");
					$$("#text-pic").val("");
                    $$("#savePic").attr("data-i", 0);
				});
			}
		}
	}, {
		path: '/reset-password/',
		url: 'reset-password.html',
		on: {
			pageInit: function (e, page) {
				var code, date;
				$$(".inputsRecover").click(function() {
					date = moment().format('YYYY-MM-DD HH:mm:ss');
					var band = false;
					if(parseInt($$(this).attr("data-id")) == 1) {
						if($$("#reset-phone").val() != "") {
							band = true;
						}
						else {
							app.dialog.alert("Debe añadir un número de teléfono para continuar.");
						}
					}
					else {
						if($$("#reset-email").val() != "") {
							band = true;
						}
						else {
							app.dialog.alert("Debe añadir un correo electrónico para continuar.");
						}
					}
					if(band) {
						API.sendCodeConfirm({
							d: date,
							e: $$("#reset-email").val(),
							p: $$("#reset-phone").val(),
							o: $$(this).attr("data-id"),
							reset: 1
						}, function(json) {
							if(json.msg == "OK") {
								code = json.code;
								app.dialog.alert("Código enviado exitosamente, en 10 minutos expira.");
							}
							else {
								app.dialog.alert(json.msg);
							}
						}, function(error) {
							//console.log(error);
						});
					}
				});
				
				$$("#reset-code").keyup(function() {
					if($$("#reset-code").val().length == 6) {
                        var a = moment(date, 'YYYY-MM-DD HH:mm:ss');
                        var b = moment(moment());
                        if(a.diff(b, 'minutes') <= 10) {
                            if($$("#reset-code").val() == code) {
                                $$("#reset-password-step-3").css({
                                    opacity: 1
                                });
                            }
                            else {
                                app.dialog.alert("Código incorrecto.");
                            }
                        }
                        else {
                            app.dialog.alert("El código ha expirado, solicite enviarlo de nuevo.");
                        }
					}
				});
				
				$$("#reset-password-save").click(function() {
					if($$("#reset-phone").val() != "" || $$("#reset-email").val() != "") {
						var password = $$('#reset-new-password').val();
						var $$btn = $$(this);
						$$btn.append('<div class="la-ball-spin la-sm" style="position: absolute; top: 8px; right: 8px; color: white;"> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> </div>');
						$$btn.addClass('disabled');
						API.saveResetNewPassword({
							p: password,
							e: $$("#reset-email").val(),
							ph: $$("#reset-phone").val()
						}, function(json) {
							$$btn.removeClass('disabled').find('.la-ball-spin').remove();
							if(json.msg == "OK") {
								
								app.router.navigate({
									url: '/login/'
								});
								
								/*app.data('userInfo', json.info);
								
								if(parseInt(json.info.centrodesalud) > 0) {
									app.router.navigate({
										url: '/home-center/',
										reloadAll: true,
										clearPreviousHistory: true,
										ignoreCache: true
									});
								}
								else {
									app.router.navigate({
										url: '/my-account/',
										reloadAll: true,
										clearPreviousHistory: true,
										ignoreCache: true
									});
								}*/
								
								
								app.dialog.alert("Su clave ha sido reestablecida satisfactoriamente.");
							}
							else {
								app.dialog.alert(json.msg);
							}
						}, function(error) {
							$$btn.removeClass('disabled').find('.la-ball-spin').remove();
							//console.log(error);
						});
					}
				});
			}
		}
	}, {
		path: '/filtro/',
		url: 'filtro.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				/*currentLat = null, currentLng = null;*/
				
				navigator.geolocation.getCurrentPosition(function(info) {
					var coords = info.coords;
					currentLat = coords.latitude;
					currentLng = coords.longitude;					
				}, function(error) {
					//console.log(error);
				}, { enableHighAccuracy: true });
                
                app.range.setValue(".rangeDistance1", 2);
                //app.range.setValue(".rangeDistance2", 5);
				
				app.customFunctions.showIndicator();
				API.getInfoFilter({
                    i: userInfo.reg_password
                }, function (json) {
					app.customFunctions.hideIndicator();
					var html = '<option value="0">Sin definir</option>';
					if(json.tratamientos.length > 0) {
						json.tratamientos.forEach(function(t) {
							html += '<option value="'+t.reg+'">'+t.tratamiento+'</option>';
						});
						$$("#tratamiento").html(html);
					}
					html = '<option value="0">Indiferente</option>';
					if(json.idiomas.length > 0) {
						json.idiomas.forEach(function(i) {
							html += '<option value="'+i.reg+'">'+i.idioma+'</option>';
						});
						$$("#lang").html(html);
					}
					html = '<option value="0">Ninguna</option>';
					if(json.mutua.length > 0) {
						json.mutua.forEach(function(m) {
							html += '<option value="'+m.reg+'">'+m.descripcion+'</option>';
						});
					}
					
					/*if(json.Domicilio_pref) {
						$$("#domicilio").prop("checked", true);
					}
					else {
						$$("#domicilio").prop("checked", false);
					}*/
					
					$$("#mutua").html(html);                    
                    if(typeof json.filtro.reg != "undefined") {
                        app.range.setValue(".rangeDistance1", json.filtro.Distancia_maxi);
						/*if(parseInt(json.filtro.Distancia_maxi) >= 5) {
							app.range.setValue(".rangeDistance2", json.filtro.Distancia_maxi);
							app.range.setValue(".rangeDistance1", 0);
						}
						else {
							app.range.setValue(".rangeDistance1", json.filtro.Distancia_maxi);
							app.range.setValue(".rangeDistance2", 5);
						}*/
                        app.range.setValue(".rangePrice", json.filtro.Precio_maxi);
						
						$$("#tratamiento").val(json.filtro.reg_tratamiento);
						$$("#mutua").val(json.filtro.reg_mutuas);
						$$("#lang").val(json.filtro.reg_idiomas);
						
						if(parseInt(json.filtro.favoritos) == 1) {
							$$("#checkFavorite").prop("checked", true);
						}
						else {
							$$("#checkFavorite").prop("checked", false);
						}
						
                    }
                    else {
						$$("#checkFavorite").prop("checked", false);
                        app.range.setValue(".rangeDistance1", 2);
                       // app.range.setValue(".rangeDistance2", 5);
                        //app.range.setValue(".rangeDistance2", 24);
                        //app.range.setValue(".rangePrice", 500);
                    }
                    
				}, function (error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
                
                /*$$('.rangeDistance1').on('range:change', function (e, range) {
                    if(parseInt($$("#distance2").val()) > 5) {
                        app.range.setValue(".rangeDistance2", 5);
                    }
                });
                $$('.rangeDistance2').on('range:change', function (e, range) {
                    if(parseInt($$("#distance").val()) > 0) {
                        app.range.setValue(".rangeDistance1", 0);
                    }
                });*/
				
				$$("#saveFilter").click(function() {
					if(currentLat == null) {
						//app.dialog.alert("No se pudo obtener su ubicación, el filtro ubicación no será tomado en cuenta.");
					}
					app.customFunctions.showIndicator();
					API.saveFilter({
						f: $$("#checkFavorite:checked").length,
						//s: $$("#sex").val(),
						t: $$("#tratamiento").val(),
						l: $$("#lang").val(),
						m: $$("#mutua").val(),
						d: $$("#distance").val(),
						//d2: $$("#distance2").val(),
						p: $$("#price").val(),
						//dom: $$("#domicilio:checked").length,
						lat: currentLat,
						lng: currentLng,
						i: userInfo.reg_password,
                        date: moment().format('YYYY-MM-DD')
					}, function (json) {
						app.customFunctions.hideIndicator();
                        
                        userInfo["filtro"] = json.filtro;
						app.data('userInfo', userInfo);
                        
						if(json.profesionales.length > 0) {
							professionals = json.profesionales;
							app.router.navigate({
								url: '/professionals/?data=1'
							});
						}
						else {
							app.dialog.alert("Sin resultados para la búsqueda.");
						}
					}, function (error) {
                        app.customFunctions.hideIndicator();
						//console.log(error);
					});
				});
			}
		}
	}, {
		path: '/mutuas/',
		url: 'mutuas.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var query = app.views.main.router.currentRoute.query;
				var escentro = 0;
				var esprofesional = 0;
				if(typeof query.es_centro != "undefined") {
					escentro = 1;
				}
				else {
					esprofesional = 1;
				}
				app.customFunctions.showIndicator();
				API.getMutuas({
                    i: userInfo.reg_password,
					esc: escentro,
					esp: esprofesional
                }, function (json) {
					var html = "";
					app.customFunctions.hideIndicator();
					var checked = "";
                    json.forEach(function(m) {
						checked = "";
						if(m.es > 0) {
							checked = 'checked="checked"';
						}
						html += '<li><label class="item-checkbox item-content"><input type="checkbox" name="mutuasCenter" '+checked+' value="'+m.reg+'"><i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title">'+m.descripcion+'</div></div></label></li>';
                    });
					$$("#listMutuasCenter").html(html);
				}, function (error) {
					app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				$$("#saveMutuasCenter").click(function() {
					if($$("input[type=checkbox][name=mutuasCenter]:checked").length > 0) {
						app.dialog.confirm('Quiere grabar los cambios?', function () {
							app.customFunctions.showIndicator();
							API.saveMutuasCenter({
								i: userInfo.reg_password,
								esc: escentro,
								esp: esprofesional,
								values: JSON.stringify($$("input[type=checkbox][name=mutuasCenter]:checked").toArray().map(function(value) { return value.value; }))
							}, function (json) {
								app.customFunctions.hideIndicator();
								app.dialog.alert("Información almacenada");
							}, function (error) {
                                app.customFunctions.hideIndicator();
								//console.log(error);
							});
						}, function() {

						});
					}
					else {
						app.dialog.alert("Debe seleccionar al menos una mutua para continuar.");
					}
				});
			}
		}
	}, {
		path: '/info-quote/',
		url: 'info-quote.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var query = app.views.main.router.currentRoute.query;
				var info = null;
				
				$$("#actionChangeQuote").css("pointer-events", "none");
				$$("#commentSession").html("");
				app.customFunctions.showIndicator();
				API.loadInfoQuote({
					i: query.i,
                    h: query.h
				}, function (json) {
                    
                    if(typeof json.oferta != "undefined") {
                        if(typeof json.oferta.reg != "undefined") {
                            var dto = "";
                            if(json.oferta.dto != "0") {
                                dto = " " + json.oferta.dto + "% de descuento";
                            }
                            $$("#labelInfoQuoteDate").html("del " + moment(json.oferta.fech_ini, "YYYY-MM-DD").format("DD/MM/YYYY") + " al " + moment(json.oferta.fech_fin, "YYYY-MM-DD").format("DD/MM/YYYY") + " de " + moment(json.oferta.hora_ini, "HH:mm:ss").format("HH:mm") + " a " + moment(json.oferta.hora_fin, "HH:mm:ss").format("HH:mm") + " precio: " + json.oferta.precio + "&#8364; " + dto);                            
                            $$("#containerOfferQuote").css("display", "");
                        }
                        else {
                            $$("#containerOfferQuote").css("display", "none");
                        }
                    }
                    else {
                        $$("#containerOfferQuote").css("display", "none");
                    }
                    
                    if(json.comentario) {
                        $$("#commentSession").html(json.comentario);
                    }
					
					$$("#actionChangeQuote").attr("href", '/agenda/?change=1&idreg='+json.reg);
					$$("#actionChangeQuote").css("pointer-events", "");
					$$("#labelTitleUserQuote").html(json.nombre);
					$$("#motivoInfoAgenda").html(json.motivo);
					$$("#labelInfoUserQe").html((json.telefono ? json.telefono : "") + " | " + json.direccion);
					var image = 'img/avatar-default-alt.png';
					if(userInfo.foto != null && userInfo.foto != "") {
						image = API.host + "/images/pics/" + json.foto;
					}
					info = json;
					$$("#numberSession").html(json.sesion);
					$$("#dateInfoAgenda").html("Fecha: " + moment(json.dia, "YYYY-MM-DD").format("DD/MM/YYYY") + " hora: " + moment(json.hora, "HH:mm:ss").format("HH:mm"));
					$$("#imgUserQuote").attr("src", image);
					app.customFunctions.hideIndicator();
				}, function (error) {
					app.customFunctions.hideIndicator();
				});
				
				$$("#cancelQ").click(function() {
					app.dialog.confirm('Esta seguro que desea cancelar la cita?', function () {
						if(parseInt(info.motivo) > 0) {
							app.dialog.prompt('Motivo de la cancelación?', function (name) {
								app.customFunctions.showIndicator();
								API.cancelQuote({
									i: info.reg,
									d: moment().format('YYYY-MM-DD'),
									reg: userInfo.reg_password,
									m: name
								}, function (json) {
									
									API.getInfoProfesional({
										i: userInfo.reg_password,
										d: moment().format('YYYY-MM-DD'),
										u: 1
									}, function (json) {
										////console.log(json);
										loadInfoPage(json);
										loadDatesProfessional(json, 0);
										app.customFunctions.hideIndicator();
										app.router.back();
									}, function (error) {
										app.customFunctions.hideIndicator();
										////console.log(error);
									});
									
								}, function (error) {
									app.customFunctions.hideIndicator();
									////console.log(error);
								});
							});
						}
						else {
							app.customFunctions.showIndicator();
							API.cancelQuote({
								i: info.reg,
								d: moment().format('YYYY-MM-DD'),
								reg: userInfo.reg_password
							}, function (json) {
								API.getInfoProfesional({
									i: userInfo.reg_password,
									d: moment().format('YYYY-MM-DD'),
									u: 1
								}, function (json) {
									
									API.getInfoProfesional({
										i: userInfo.reg_password,
										d: moment().format('YYYY-MM-DD'),
										u: 1
									}, function (json) {
										////console.log(json);
										loadInfoPage(json);
										loadDatesProfessional(json, 0);
										app.customFunctions.hideIndicator();
										app.router.back();
									}, function (error) {
										app.customFunctions.hideIndicator();
										////console.log(error);
									});
									
									
								}, function (error) {
									app.customFunctions.hideIndicator();
									////console.log(error);
								});
							}, function (error) {
								app.customFunctions.hideIndicator();
								////console.log(error);
							});
						}
					}, function() {

					});
				});
			}
		}
	}, {
		path: '/actionsQuote/',
		url: 'actionsQuote.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
                var query = app.views.main.router.currentRoute.query;
				var info = {};
				if(professionals) {
					professionals.forEach(function(p) {
						if(p.reg_password == query.reg) {
							info = p;
						}
					});
				}
				else {
					info = userInfo;
				}
				var image = 'img/avatar-default-alt.png';
				if(info.foto != null && info.foto != "") {
					image = API.host + "/images/pics/" + info.foto;
				}
				$$("#imgUserQuote").attr("src", image);
				
				$$("#labelQuote").html(moment(query.d, "YYYY-MM-DD").format('dddd').charAt(0).toUpperCase() + moment(query.d, "YYYY-MM-DD").format('dddd').slice(1) + " " + moment(query.d, "YYYY-MM-DD").format('DD/MM/YYYY') + ' Hora ' + query.h);

				$$("#nameQuoteUser").html(info.nombre + " " + info.apellidos);
				$$("#rankingQuote").html(starsRanking(info.puntaje) + ' <span style=" margin-top: -3px;">('+info.cant+')</span>');
				$$("#locationQuote").html(info.ciudad + " " + (info.calle != null ? info.calle : "") + " " + (info.numero != null ? info.numero : ""));
			}
		}
	}, {
		path: '/agenda/',
		url: 'agenda.html',
		on: {
			pageInit: function (e, page) {
				var query = app.views.main.router.currentRoute.query;
                
                $$("#containerBackProf").css("display", "none");
                $$("#containerMenuProf").css("display", "");
                
                setTimeout(function() {
                     if(typeof query.change != "undefined") {
                        $$("#containerBackProf").css("display", "");
                        $$("#containerMenuProf").css("display", "none");
                    }
                }, 750);
                
				loadInfoPage = function(userInfo) {
                    console.log(userInfo);
					var image = 'img/avatar-default-alt.png';
					if(userInfo.foto != null && userInfo.foto != "") {
						image = API.host + "/images/pics/" + userInfo.foto;
					}
                    console.log(image);
					
					$$("#imgUser").attr("src", image);
					var stars = starsRanking(userInfo.puntaje);
					var name = userInfo.nombre ? userInfo.nombre : "Sin información";
					if(typeof userInfo.es_centro != "undefined") {
						if(parseInt(userInfo.es_profesional) > 0) {
							name += " " + userInfo.apellidos;
						}
					}
					else {
                        if(userInfo.apellidos) {
                            name += " " + userInfo.apellidos;
                        }
					}
					$$("#username").html(name);
					$$("#labelStars").html(stars + '<span style=" margin-top: -3px;">('+userInfo.cant+')</span>');
					
					var html = "";
					if(typeof userInfo.tratamientos != "undefined") {
						if(userInfo.tratamientos.length > 0) {
							userInfo.tratamientos.forEach(function(t) {
								html += t.tratamiento + " | ";
							});
							html = html.substr(0, (html.length - 2));
						}
                        
                        if(typeof app.views.main.router.currentRoute.query.t != "undefined") {
                            userInfo.tratamientos.forEach(function(t) {
                                if(t.reg == app.views.main.router.currentRoute.query.t) {
                                    if(typeof t.oferta != "undefined") {
                                        if(typeof t.oferta.fech_ini != "undefined") {
                                            html += ' Oferta del ' + moment(t.oferta.fech_ini, "YYYY-MM-DD").format("DD/MM/YYYY") + " al " + moment(t.oferta.fech_fin, "YYYY-MM-DD").format("DD/MM/YYYY") + " de " + moment(t.oferta.hora_ini, "HH:mm:ss").format("HH:mm") + " a " + moment(t.oferta.hora_fin, "HH:mm:ss").format("HH:mm") + " precio: " + t.oferta.precio + " &#8364;";
                                            if(t.oferta.dto != "0") {
                                                html += " " + t.oferta.dto + "% de descuento";
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        
						$$("#labelTaxsProf").html(html);						
					}
				};
				
				loadDatesProfessional = function(json, type) {
					var arr = Object.keys(json.fechas).map(function (key) { return json.fechas[key]; });
					var col = 0;
					
					var datac = "";
					var datap = "";
					var tt = "";
					if(typeof app.views.main.router.currentRoute.query.esc != "undefined") {
						query = app.views.main.router.currentRoute.query;
						datac = query.esc;
						datap = query.esp;
					}
					if(typeof app.views.main.router.currentRoute.query.t != "undefined") {
						tt = query.t;
					}
					if(typeof app.views.main.router.currentRoute.query.center != "undefined") {
						type = 0;
					}
					
					if(arr.length > 0) {
						var html = "";
						var h1, h2, citas, hours, band = true;
						var color = "";
						if(type == 0) {
							arr.forEach(function(d) {
								hours = "";
								band = false;
								d.forEach(function(t) {
									t.horas.forEach(function(h) {
										band = true;
										color = "";
										if(parseInt(t.bloqueada) == 1) {
											hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px; background-color: red !important;" class="col-33 button button-fill actionsDaysCancel" data-mot="0" data-bloqueada="0" data-quote="0" data-reg="'+t.reg+'" data-hour="'+h.h+":00"+'">'+h.h+'</a>';
										}
										else {
											if(typeof h.c.reg != "undefined") {
												if(parseInt(h.c.bloqueada) == 2) {
													//hours += '<a href="/actionsQuote/?i='+h.c.reg+'&d='+t.dia+'&h='+h.h+':00&esc=0&esp=1&reg='+json.reg_password+'" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px; background-color: #ff00ff !important;" class="col-33 button button-fill" data-mot="'+h.c.visitasconjuntas+'" data-quote="'+(h.c.reg ? h.c.reg : 0)+'" data-reg="'+t.reg+'" data-date="'+t.dia+'" data-hour="'+h.h+":00"+'">'+h.h+'</a>';
													hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px; background-color:red !important;" class="col-33 button button-fill actionsDaysCancel" data-mot="0" data-bloqueada="2" data-quote="'+h.c.reg+'" data-reg="'+t.reg+'">'+h.h+'</a>';
												}
												else {
													if(typeof query.change == "undefined") {
														hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px; background-color: #ff00ff !important;" class="col-33 button button-fill actionsDays" data-mot="'+h.c.visitasconjuntas+'" data-bloqueada="0" data-quote="'+(h.c.reg ? h.c.reg : 0)+'" data-reg="'+t.reg+'" data-date="'+t.dia+'" data-hour="'+h.h+":00"+'">'+h.h+'</a>';
													}
												}
											}
											else {
                                                /*
                                                var reg = $$(this).attr("data-reg");
                                                var hour = $$(this).attr("data-hour");
                                                var date = $$(this).attr("data-date");
                                                var quote = $$(this).attr("data-quote");
                                                var mot = $$(this).attr("data-mot");
                                                var userInfo = app.data('userInfo');

                                                var action = parseInt($$(this).attr("data-action"));*/
                                                
												if(typeof query.change != "undefined") {
													hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px;" class="col-33 button button-fill actionsDays" data-action="1" data-date="'+t.dia+'" data-mot="0" data-quote="0" data-reg="'+t.reg+'" data-hour="'+h.h+":00"+'">'+h.h+'</a>';
												}
												else {
													hours += '<a href="/actionsQuote/?i='+t.reg+'&d='+t.dia+'&h='+h.h+':00&esc=0&esp=1&reg='+json.reg_password+'" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px;" class="col-33 button button-fill" data-action="0" data-date="'+t.dia+'" data-mot="0" data-quote="0" data-reg="'+t.reg+'" data-hour="'+h.h+":00"+'">'+h.h+'</a>';
												}
											}
										}
										col++;
										if(col == 2) {
											col = 0;
										}
									});
								});
								if(band) {
									if(col < 2) {
										for(var i = col +1; i < 3; i++) {
											hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px;margin-top: 5px;color: white;background: white !important;" class="col-33">00:00</a>';
										}
										col = 0;
									}
									html += '<li class="accordion-item"> <a href="#" class="item-link item-content"> <div class="item-media"><i class="far fa-calendar" style=" color: #065b94;"></i></div> <div class="item-inner" style=" margin-left: 0;"> <div class="item-title" style="color: #065b94;font-size:  15px;">'+d[0].fecha+'</div> </div> </a> <div class="accordion-item-content" style=""> <div class="block"> <div class="row" style=" margin-left: 20px; margin-right: 20px;">'+hours+'</div> </div> </div> </li>';
								}
							});
						}
						else {
							arr.forEach(function(d) {
								hours = "";
								band = false;
								d.forEach(function(t) {
									t.horas.forEach(function(h) {
										band = true;
										hours += '<a href="'+(type == 1 ? ('/request-agenda/?i='+t.reg+'&d='+t.dia+'&h='+h+":00&esc="+datac+"&esp="+datap+"&t="+tt) : "#")+'" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px;" class="col-33 button button-fill actionsDays" data-date="'+t.dia+'" data-reg="'+t.reg+'" data-hour="'+h+":00"+'">'+h+'</a>';
										col++;
										if(col == 2) {
											col = 0;
										}
									});
								});
								if(band) {
									if(col < 2) {
										for(var i = col +1; i < 3; i++) {
											hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px;margin-top: 5px;color: white;background: white !important;" class="col-33">00:00</a>';
										}
										col = 0;
									}
									html += '<li class="accordion-item"> <a href="#" class="item-link item-content"> <div class="item-media"><i class="far fa-calendar" style=" color: #065b94;"></i></div> <div class="item-inner" style=" margin-left: 0;"> <div class="item-title" style="color: #065b94;font-size:  15px;">'+d[0].fecha+'</div> </div> </a> <div class="accordion-item-content" style=""> <div class="block"> <div class="row" style=" margin-left: 20px; margin-right: 20px;">'+hours+'</div> </div> </div> </li>';
								}
							});
						}
						$$("#dates").html(html);
						if(type == 0) {
							
							$$(".actionsDaysCancel").click(function() {
								var reg = $$(this).attr("data-reg");
								var hour = $$(this).attr("data-hour");
								var quote = $$(this).attr("data-quote");
								var bloqueada = parseInt($$(this).attr("data-bloqueada"));
								var userInfo = app.data('userInfo');
								var text = "el dia seleccionado";
								if(bloqueada == 2) {
									text = "la hora seleccionada";
								}
								
								app.dialog.confirm('Esta seguro que desea desbloquear '+text+'?', function () {
									app.customFunctions.showIndicator();
									API.lockQuote({
										r: reg,
										h: hour,
										d: moment().format('YYYY-MM-DD'),
										l: 0,
										b: bloqueada,
										q: quote
									}, function (json) {
										var i = userInfo.reg_password;
										if(typeof app.views.main.router.currentRoute.query.i != "undefined") {
											i = app.views.main.router.currentRoute.query.i;
										}
										API.getInfoProfesional({
											i: i,
											d: moment().format('YYYY-MM-DD'),
											u: 1
										}, function (json) {
											////console.log(json);
											//loadInfoPage(json);
											loadDatesProfessional(json, 0);
											app.customFunctions.hideIndicator();
										}, function (error) {
                                            app.customFunctions.hideIndicator();
											////console.log(error);
										});
									}, function (error) {
                                        app.customFunctions.hideIndicator();
										////console.log(error);
									});
								}, function() {
									
								});
							});
							
							$$(".actionsDays").click(function() {
								var reg = $$(this).attr("data-reg");
								var hour = $$(this).attr("data-hour");
								var date = $$(this).attr("data-date");
								var quote = $$(this).attr("data-quote");
								var mot = $$(this).attr("data-mot");
								var userInfo = app.data('userInfo');
								
								var action = parseInt($$(this).attr("data-action"));
								
								if(action > 0) {
									app.customFunctions.showIndicator();
									API.changeQuote({
										i: app.views.main.router.currentRoute.query.idreg,
										reg: reg,
										hour: hour,
										quote: date
									}, function (json) {
										console.log(json);
										app.views.main.router.currentRoute.query = {};
										$$("#containerBackProf").css("display", "none");
										$$("#containerMenuProf").css("display", "");
										
										query = {};
										
										var html = "";
										API.getInfoProfesional({
											i: userInfo.reg_password,
											d: moment().format('YYYY-MM-DD'),
											u: 1
										}, function (json) {
											loadDatesProfessional(json, 0);
										}, function (error) {
                                            app.customFunctions.hideIndicator();
											////console.log(error);
										});
										
										app.customFunctions.hideIndicator();
									}, function (error) {
										app.customFunctions.hideIndicator();
									});
								}
								else {
									if(parseInt(quote) > 0) {
									
										app.router.navigate({
											url: '/info-quote/?i=' + reg + "&h=" + hour
										});

										/*app.dialog.confirm('Esta seguro que desea cancelar la cita?', function () {
											if(parseInt(mot) > 0) {
												app.dialog.prompt('Motivo de la cancelación?', function (name) {
													app.customFunctions.showIndicator();
													API.cancelQuote({
														i: quote,
														d: moment().format('YYYY-MM-DD'),
														reg: userInfo.reg_password,
														m: name
													}, function (json) {
														API.getInfoProfesional({
															i: userInfo.reg_password,
															d: moment().format('YYYY-MM-DD'),
															u: 1
														}, function (json) {
															////console.log(json);
															loadInfoPage(json);
															loadDatesProfessional(json, 0);
															app.customFunctions.hideIndicator();
														}, function (error) {
															app.customFunctions.hideIndicator();
															////console.log(error);
														});
													}, function (error) {
														app.customFunctions.hideIndicator();
														////console.log(error);
													});
												});
											}
											else {
												app.customFunctions.showIndicator();
												API.cancelQuote({
													i: quote,
													d: moment().format('YYYY-MM-DD'),
													reg: userInfo.reg_password
												}, function (json) {
													API.getInfoProfesional({
														i: userInfo.reg_password,
														d: moment().format('YYYY-MM-DD'),
														u: 1
													}, function (json) {
														////console.log(json);
														loadInfoPage(json);
														loadDatesProfessional(json, 0);
														app.customFunctions.hideIndicator();
													}, function (error) {
														app.customFunctions.hideIndicator();
														////console.log(error);
													});
												}, function (error) {
													app.customFunctions.hideIndicator();
													////console.log(error);
												});
											}
										}, function() {

										});*/
									}
									else {
										app.dialog.confirm('Esta seguro que desea bloquear todas las horas del dia seleccionado?', function () {
											app.customFunctions.showIndicator();
											API.lockQuote({
												i: quote,
												r: reg,
												h: hour,
												d: moment().format('YYYY-MM-DD'),
												reg: userInfo.reg_password,
												l: 1
											}, function (json) {
												API.getInfoProfesional({
													i: userInfo.reg_password,
													d: moment().format('YYYY-MM-DD'),
													u: 1
												}, function (json) {
													////console.log(json);
													loadInfoPage(json);
													loadDatesProfessional(json, 0);
													app.customFunctions.hideIndicator();
												}, function (error) {
													app.customFunctions.hideIndicator();
													////console.log(error);
												});
											}, function (error) {
												app.customFunctions.hideIndicator();
												////console.log(error);
											});
										}, function() {
											app.router.navigate({
												url: '/request-agenda-user/?i='+reg+'&h='+hour+'&d='+date
											});
										});
									}
								}
								
							});
						}
					}
				};
				
				if(typeof query.change != "undefined") {
					$$("#containerBackProf").css("display", "");
					$$("#containerMenuProf").css("display", "none");
				}
				
				$$("#professionalsCalendar").html("");
				$$("#dates").html("");
				
				$$("#titleProfessionalsCenterCalendar").css("display", "none");
				
				if(typeof query.i != "undefined") {
					$$("#containerBackProf").css("display", "");
					app.customFunctions.showIndicator();
					$$("#containerMenuProf").hide();
					var u;
					if(typeof app.views.main.router.currentRoute.query.center != "undefined") {
						u = 1;
                        var userInfo = app.data('userInfo');
                        if(typeof userInfo.reg_password != "undefined") {
                            u = userInfo.reg_password;
                        }
					}
					API.getInfoProfesional({
						i: query.i,
						d: moment().format('YYYY-MM-DD'),
						esc: query.esc,
						esp: query.esp,
						u: u
					}, function (json) {
						//console.log(json);
						
						loadInfoPage(json);
						
						if(query.esc == 1) {
							var html = "";
							var arr = [];
							var col = 0;

							var datac = "";
							var datap = "";
							var tt = "";
							var image;
							var stars = "";
							var name = "";
							var tax = "";
							
							$$("#titleProfessionalsCenterCalendar").css("display", "");
							$$("#titleProfessionalsCenterCalendar").html("Profesionales de: " + json.nombre);
							
							json.profesionales_fechas.forEach(function(p) {
                                
                                if(typeof p.info.nombre != "undefined") {
                                    image = 'img/avatar-default-alt.png';
                                    if(p.info.foto != null && p.info.foto != "") {
                                        image = API.host + "/images/pics/" + p.info.foto;
                                    }
                                    stars = starsRanking(p.info.puntaje);
                                    html += '<li class="accordion-item"> <a href="#" class="item-link item-content"> <div class="item-media"><img src="'+image+'" alt="" style=" width: 40px;"></div> <div class="item-inner" style=" margin-left: 0;"> <div class="item-title" style="color: #065b94;font-size:  15px; margin-left: 15px;">'+p.info.nombre+" "+p.info.apellidos+'</div> <div class="item-after">'+stars + '<span style=" margin-top: -3px;">('+p.cant+')</span>'+'</div> </div> </a> <div class="accordion-item-content" style=""> <div class="block"> <div class="row" style="  margin-right: 20px;">';


                                    /*name = p.info.nombre;
                                    if(typeof p.info.es_centro != "undefined") {
                                        if(parseInt(p.info.es_profesional) > 0) {
                                            name += " " + p.info.apellidos;
                                        }
                                    }
                                    else {
                                        name += " " + p.info.apellidos;
                                    }*/
                                    tax = "";
                                    if(typeof p.info.tratamientos != "undefined") {
                                        if(p.info.tratamientos.length > 0) {
                                            p.info.tratamientos.forEach(function(t) {
                                                tax += t.tratamiento + " | ";
                                            });
                                            tax = tax.substr(0, (html.length - 2));
                                        }					
                                    }

                                    arr = Object.keys(p.fechasProfesionales).map(function (key) { return p.fechasProfesionales[key]; });
                                    col = 0;
                                    datac = "";
                                    datap = "";
                                    tt = "";
                                    if(typeof app.views.main.router.currentRoute.query.esc != "undefined") {
                                        query = app.views.main.router.currentRoute.query;
                                        datac = query.esc;
                                        datap = query.esp;
                                    }
                                    if(typeof app.views.main.router.currentRoute.query.t != "undefined") {
                                        tt = query.t;
                                    }

                                    html += '<div class="list accordion-list"> <ul>';

                                    if(arr.length > 0) {
                                        var h1, h2, citas, hours, band = true;
                                        var color = "";
                                        arr.forEach(function(d) {
                                            hours = "";
                                            band = false;
                                            d.forEach(function(t) {
                                                t.horas.forEach(function(h) {
                                                    band = true;
                                                    hours += '<a href="'+'/request-agenda/?i='+t.reg+'&d='+t.dia+'&h='+h+":00&esc="+datac+"&esp="+datap+"&t="+tt+'" style="max-width: 80px;min-height: 50px;line-height:  50px; margin-top: 5px;" class="col-33 button button-fill actionsDays" data-date="'+t.dia+'" data-reg="'+t.reg+'" data-hour="'+h+":00"+'">'+h+'</a>';
                                                    col++;
                                                    if(col == 2) {
                                                        col = 0;
                                                    }
                                                });
                                            });
                                            if(band) {
                                                if(col < 2) {
                                                    for(var i = col +1; i < 3; i++) {
                                                        hours += '<a href="#" style="max-width: 80px;min-height: 50px;line-height:  50px;margin-top: 5px;color: white;background: white !important;" class="col-33">00:00</a>';
                                                    }
                                                    col = 0;
                                                }
                                                html += '<li class="accordion-item"> <a href="#" class="item-link item-content"> <div class="item-media"><i class="far fa-calendar" style=" color: #065b94;"></i></div> <div class="item-inner" style=" margin-left: 0;"> <div class="item-title" style="color: #065b94;font-size:  15px;">'+d[0].fecha+'</div> </div> </a> <div class="accordion-item-content" style=""> <div class="block"> <div class="row" style=" margin-left: 20px; margin-right: 20px;">'+hours+'</div> </div> </div> </li>';
                                            }
                                        });
                                    }
                                    html += ' </ul> </div>    </div> </div> </div> </li>';
                                }
                                
							});
							html += '';
							$$("#professionalsCalendar").html(html);
						}
						else {
							loadDatesProfessional(json, 1);
						}
						app.customFunctions.hideIndicator();
					}, function (error) {
						app.customFunctions.hideIndicator();
						//console.log(error);
					});
					//$$("#menuProfesionales").css("display", "none");
				}
				else {
					$$("#containerBackProf").css("display", "none");
					$$("#containerMenuProf").css("display", "");
					var userInfo = app.data('userInfo');
					//$$("#menuProfesionales").css("display", "");
					loadInfoPage(userInfo);

					var html = "";
					API.getInfoProfesional({
						i: userInfo.reg_password,
						d: moment().format('YYYY-MM-DD'),
						u: 1
					}, function (json) {
						loadDatesProfessional(json, 0);
					}, function (error) {
						////console.log(error);
					});
				}				
			}
		}
	}, {
		path: '/request-agenda-user/',
		url: 'request-agenda-user.html',
		on: {
			pageInit: function (e, page) {
				var query = app.views.main.router.currentRoute.query;
				var userInfo = app.data('userInfo');
				app.customFunctions.showIndicator();
				var clientes = null;
				
				infoNewLocation = {};
				
				API.loadInfoUsersProfessional({
					i: query.i,
					u: userInfo.reg_password,
					d: moment().format('YYYY-MM-DD')
				}, function (json) {
					////console.log(json);
					var html = '<option value="">Seleccione</option>';
					var nombre = "";
					json.clientes.forEach(function(c) {
						/*nombre = c.nombre+" "+c.apellidos;
						if(c.nombre == null && c.apellido == null) {
							
						}*/
						html += '<option value="'+c.reg_password+'">'+(c.nombre != null && c.apellidos != null ? (c.nombre+" "+c.apellidos) : c.email)+'</option>';
					});
					$$("#clientesProfesional").html(html);
					clientes = json.clientes;
					html = "";
					json.tratamientos.forEach(function(t) {
						html += '<option value="'+t.reg+'">'+t.tratamiento+'</option>';
					});
					$$("#tratamientosProfesional").html(html);
					
					$$("#clientesProfesional").change(function() {
						
						$$("#name-client-request").attr("disabled", false);
						$$("#last-name-client-request").attr("disabled", false);
						$$("#phone-client-request").attr("disabled", false);
						
						$$("#name-client-request").removeAttr("disabled");
						$$("#last-name-client-request").removeAttr("disabled");
						$$("#phone-client-request").removeAttr("disabled");
						
						$$("#name-client-request").val("");
						$$("#last-name-client-request").val("");
						$$("#location-client-request").val("");
						$$("#postal-client-request").val("");
						$$("#phone-client-request").val("");
						var value = this.value;
						clientes.forEach(function(c) {
							if(value == c.reg_password) {
								$$("#name-client-request").val(c.nombre);
								$$("#last-name-client-request").val(c.apellidos);
								$$("#phone-client-request").val(c.telefono);
								$$("#name-client-request").attr("disabled", true);
								$$("#last-name-client-request").attr("disabled", true);
								$$("#phone-client-request").attr("disabled", true);
							}
						});
					});
					
					$$("#name-client-request").keydown(function() {
						$$("#clientesProfesional").val("");
					});
					$$("#last-name-client-request").keydown(function() {
						$$("#clientesProfesional").val("");
					});
					$$("#location-client-request").keydown(function() {
						$$("#clientesProfesional").val("");
					});
					$$("#postal-client-request").keydown(function() {
						$$("#clientesProfesional").val("");
					});
					$$("#phone-client-request").keydown(function() {
						$$("#clientesProfesional").val("");
					});
					
					
					$$("#confirmRequest").click(function() {
						var band = true;
						if($$("#clientesProfesional").val() != "") {
							
						}
						else {
							if($$("#name-client-request").val() == "" || $$("#last-name-client-request").val() == "" || $$("#phone-client-request").val() != "") {
								band = false;
								app.dialog.alert("Los campos nombre, apellido y telefono son obligatorios");
							}
						}
						
						if(band) {
                            app.customFunctions.showIndicator();
							var userInfo = app.data('userInfo');
							API.saveUserAgenda({
								i: userInfo.reg_password,
								idc: $$("#clientesProfesional").val(),
								idt: $$("#tratamientosProfesional").val(),
								name: $$("#name-client-request").val(),
								lastName: $$("#last-name-client-request").val(),
								phone: $$("#phone-client-request").val(),
								code: $$("#postal-client-request").val(),
								location: JSON.stringify(infoNewLocation),
								ida: app.views.main.router.currentRoute.query.i,
								h: app.views.main.router.currentRoute.query.h,
								d: app.views.main.router.currentRoute.query.d
							}, function (json) {
                                app.customFunctions.hideIndicator();
								if(json.msg == "OK") {
                                    goToBack();
									setTimeout(function() {
                                        goToBack();
                                        app.dialog.alert("Información almacenada");
                                    }, 500);
								}
								else {
									app.dialog.alert(json.msg);
								}
							}, function (error) {
								//console.log(error);
							});
						}
						
					});
					
					/*if(json.existe == 1) {
						app.dialog.confirm('Ya hay una cita para el día seleccionado, desea suprimirlo?', function () {
							
						}, function() {
							app.router.back();
						});
					}*/
					
					app.customFunctions.hideIndicator();
				}, function (error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});					
			}
		}
	}, {
		path: '/request-agenda/',
		url: 'request-agenda.html',
		on: {
			pageInit: function (e, page) {
				var query = app.views.main.router.currentRoute.query;
				var datac = "";
				var datap = "";
				
				if(typeof query.esc != "undefined" && query.esc != "") {
					datac = query.esc;
					datap = query.esp;
				}
                
                $$("#labelVisitaDomicilio").css("display", "none");
                var t;
                if(typeof query.t != "undefined") {
                    t = query.t;
                }
				
				var userInfo = app.data('userInfo');
				app.customFunctions.showIndicator();
				API.getInfoAgenda({
					i: query.i,
					u: userInfo.reg_password,
					d: moment().format('YYYY-MM-DD'),
					esc: datac,
					esp: datap,
                    t: t,
                    calendar: query.d,
                    h: query.h
				}, function (json) {
					//console.log(json);
					
					var image = 'img/avatar-default-alt.png';
					if(json.foto != null && json.foto != "") {
						image = API.host + "/images/pics/" + json.foto;
					}
					$$("#imgUserRequestAgenda").attr("src", image);
					
					var name = json.nombre;
					if(datap != "") {
						if(parseInt(datap) > 0) {
							name += " " + json.apellidos;
						}
					}
					else {
						name += " " + json.apellidos;
					}
					
					$$("#usernameRequestAgenda").html(name);
					var stars = starsRanking(json.puntaje);
					$$("#labelStarsRequestAgenda").html(stars + '<span style=" margin-top: -3px;">('+json.cant+')</span>');
					
					var taxs = "";
					var html = "";
                    var taxx = false;
                    
                    if(typeof query.t != "undefined" && query.t != "") {
						taxx = true;
					}
                    
                    var withOffert = "";
                    
					json.tratamientos.forEach(function(t) {
                        if(taxx) {
                            if(t.reg == query.t) {
                                if(typeof t.oferta.reg != "undefined") {
                                    withOffert += ' | Oferta del ' + moment(t.oferta.fech_ini, "YYYY-MM-DD").format("DD/MM/YYYY") + " al " + moment(t.oferta.fech_fin, "YYYY-MM-DD").format("DD/MM/YYYY") + " de " + moment(t.oferta.hora_ini, "HH:mm:ss").format("HH:mm") + " a " + moment(t.oferta.hora_fin, "HH:mm:ss").format("HH:mm") + " precio: " + t.oferta.precio + " &#8364;";
                                    if(t.oferta.dto != "0") {
                                        withOffert += " " + t.oferta.dto + "% de descuento";
                                    }
                                }
                                if(!t.domicilio) {
                                    if(typeof userInfo.filtro.reg != "undefined") {
                                        if(parseInt(userInfo.filtro.Domicilio_pref) == 1) {
                                            $$("#labelVisitaDomicilio").css("display", "");
                                        }
                                    }
                                   // $$("#labelVisitaDomicilio").css("display", "");
                                }
                            }
                        }
						html += '<option value="'+t.reg+'">'+t.tratamiento+'</option>';
						taxs += t.tratamiento + ' | ';
					});
					$$("#motivoRequestAgenda").html(html);
					
					if(taxx) {
						$$("#motivoRequestAgenda").val(query.t);
					}
					
					if(taxs != "") {
						taxs = taxs.substr(0, (taxs.length -2));
					}
                    taxs += withOffert;
					$$("#labelTaxsProfRequestAgenda").html(taxs);
					$$("#dateRequestAgenda").html(moment(json.dia, "YYYY-MM-DD").format("DD/MM/YYYY") + " " +moment(query.h, "HH:mm:ss").format("HH:mm"));
					
					/*if(json.existe == 1) {
						app.dialog.confirm('Ya hay una cita para el día seleccionado, desea suprimirlo?', function () {
							
						}, function() {
							app.router.back();
						});
					}*/
					
					app.customFunctions.hideIndicator();
				}, function (error) {
					app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				$$("#saveRequestAgenda").click(function() {
					if(userInfo.reg_password == 0) {
						app.dialog.alert("Debes registrarte para poder realizar una reserva.");
					}
					else {
						app.customFunctions.showIndicator();
						var query = app.views.main.router.currentRoute.query;
						API.saveInfoAgenda({
							i: query.i,
							h: query.h,
							d: query.d,
							u: userInfo.reg_password,
							dc: moment().format('YYYY-MM-DD'),
							motivo: $$("#motivoRequestAgenda").val(),
							session: $$("#sessionRequestAgenda").val(),
							esc: datac,
							esp: datap,
                            c: $$("#commentRequest").val()
						}, function (json) {
							app.customFunctions.hideIndicator();
							if(json.msg != "OK") {
								app.dialog.alert(json.msg);
							}
                            else {
                                app.dialog.alert("Tu reserva se ha procesado correctamente! Te hemos mandado un sms o un correo electrónico de confirmación. Puedes consultar tu reserva en visitas pendientes");
                            }
							app.router.back();
							setTimeout(function() {
								app.views.main.router.refreshPage();
							}, 1000);
						}, function (error) {
							app.customFunctions.hideIndicator();
							//console.log(error);
						});
					}
				});
					
			}
		}
	}, {
		path: '/my-account/',
		url: 'my-account.html',
		on: {
			pageInit: function (e, page) {
				$$(".popover-add-picture-profile a").attr("data-page", "my-account");
				var userInfo = app.data('userInfo');
                
                $$(".labelsForProfessional").css("display", "none");
                if(parseInt(userInfo.profesional) > 0) {
                    $$(".labelsForProfessional").css("display", "");
                }
				
				picGallery = null;
				imgMyAccount = null;
				
				API.getPics({
					i: userInfo.reg_password
				}, function(json) {
					var html = "";
					if(json.length > 0) {
						html = '<div class="row" style=" margin-top: 20px; margin-left: 10px; margin-right: 10px;">';
						json.forEach(function(i) {
							html += '<div class="col-33"><a href="#" onclick="selectPic(this);" data-pic="'+i.foto+'" data-id="'+i.reg+'" class="link"><img src="'+API.host + "/images/pics/" + i.foto+'" style="width: 100%;height:  115px;" alt=""/></a></div>';
						});
						html += '</div>';
						$$(".popup-gallery .page-content").html(html);
						$$("#containerButtonImages").css("display", "");
					}
					else {
						$$("#containerButtonImages").css("display", "none");
					}
				}, function(error) {
					//console.log(error);
				});
				
				/*if(userInfo.imagenes.length > 0) {
					var html = '<div class="row" style=" margin-top: 20px; margin-left: 10px; margin-right: 10px;">';
					userInfo.imagenes.forEach(function(i) {
						html += '<div class="col-33"><a href="#" onclick="selectPic(this);" data-pic="'+i.foto+'" data-id="'+i.reg+'" class="link"><img src="'+API.host + "/images/pics/" + i.foto+'" style="width: 100%;height:  115px;" alt=""/></a></div>';
					});
					html += '</div>';
					$$(".popup-gallery .page-content").html(html);
					$$("#containerButtonImages").css("display", "");
				}
				else {
					
				}*/
                $$("input[type=checkbox][name=aceptMA]").prop("checked", false);
                $$("#containerTerm").css("display", "");
                if(typeof userInfo.privacidad != "undefined" && typeof userInfo.condiciones != "undefined") {
                    if(userInfo.privacidad && userInfo.condiciones) {
                        $$("input[type=checkbox][name=aceptMA]").prop("checked", true);
                    }
                }
                //if(fb) {
                    //if(typeof userInfo.privacidad != "undefined" && userInfo.privacidad  == null) {
                       //$$("#containerTerm").css("display", "");
                    //}
                //}
				
				if(parseInt(userInfo.profesional) > 0) {
					$$("#containerdni").css("display", "");
					$$("#containerMenuProf").css("display", "");
				}
				else {
					$$("#containerdni").css("display", "none");
				}
				
				
				//$$("#my-location").val(userInfo.direccion);
				
				if(typeof userInfo.nombre != "undefined") {
					$$("#my-account-name").val(userInfo.nombre);					
					$$("#deleteDates").css("display", "");
				}
				else {
					$$("#deleteDates").hide();
				}				
				
				if(userInfo.foto != null && userInfo.foto != "") {
					$$("#currentPicProfile").attr("src", API.host + "/images/pics/" + userInfo.foto);
				}
				
				if(typeof userInfo.apellidos != "undefined") {
					$$("#my-account-last-name").val(userInfo.apellidos);
				}
				if(typeof userInfo.codigopostal != "undefined") {
					$$("#my-account-code-postal").val(userInfo.codigopostal);
				}
				if(typeof userInfo.telefono_ficha != "undefined") {
					$$("#my-account-phone").val(userInfo.telefono_ficha);
				}
                else {
                    if(userInfo.telefono) {
                        $$("#my-account-phone").val(userInfo.telefono);
                    }
                }
				if(typeof userInfo.fijo != "undefined") {
					$$("#my-account-phone2").val(userInfo.fijo);
				}
				if(typeof userInfo.dnicif != "undefined") {
					$$("#my-account-dni").val(userInfo.dnicif);
				}
				if(userInfo.email) {
					$$("#my-account-email").val(userInfo.email);
				}
				
				$$("#deleteDates").click(function() {
					app.dialog.confirm('Esta seguro que desea eliminar esta información?', function () {
						app.customFunctions.showIndicator();
						
						/*$$("#currentPicProfile").attr("src", "img/avatar-default-alt.png");
						
						$$("#my-account-name").val("");
						$$("#my-account-last-name").val("");
						$$("#my-location").val("");
						$$("#my-account-code-postal").val("");
						$$("#my-account-phone").val("");
						$$("#my-account-phone2").val("");
						$$("#my-account-dni").val("");
						
						$$("#deleteDates").hide();*/
						var userInfo = app.data('userInfo');
						API.deleteUser({
							i: userInfo.reg_password,
							p: userInfo.profesional,
							u: userInfo.usuario
						}, function(json) {
							app.customFunctions.hideIndicator();
							logout();
							app.dialog.alert("Borrado correcto.");
						}, function(error) {
							app.customFunctions.hideIndicator();
							//console.log(error);
						});
					});
				});
                
                $$("#my-account-phone").focus(function() {
                     if($$("#my-account-phone").val() == "") {
                         $$("#my-account-phone").val("0034");
                     }
                 });
                
                 $$("#my-account-phone").blur(function() {
                     if($$("#my-account-phone").val() == "0034") {
                         $$("#my-account-phone").val("");
                     }
                 });
				
				imgMyAccount = null;
				$$("#registerDates").click(function() {
					var url = API.host + '/api/operaciones-pruebas.php';
					var userInfo = app.data('userInfo');
					var band = true;
					if(userInfo.profesional > 0) {
						if($$("#my-account-dni").val() == "") {
							band = false;
							app.dialog.alert("El DNI/NIF es obligatorio");
						}
					}
					
					if(band) {
						
						var band2 = true;
						
						if(fb) {
                            var next = true;
                            if(typeof userInfo.privacidad != "undefined" && userInfo.privacidad  == null) {
                               if($$("input[type=checkbox][name=aceptMA]:checked").length < 2) {
                                    next = false;
                                    band2 = true;
                                    app.dialog.alert("Debe aceptar los Términos y condiciones y las Políticas de privacidad.");
                                }
                            }
                            if(next) {
                                //if(userInfo.telefono != null && userInfo.telefono != "") {
                                if($$("#my-account-phone").val() != "") {
                                    if(userInfo.telefono != $$("#my-account-phone").val()) {
                                        
                                        var band4 = false;
                                        
                                        if($$("#my-account-phone").val().length > 8) {
                                            if($$("#my-account-phone").val().substring(0, 1) == "+") {
                                                if($$("#my-account-phone").val().substring(0, 2) == "34") {
                                                    if($$("#my-account-phone").val().substring(2, 4) != "80" && $$("#my-account-phone").val().substring(2, 4) != "90") {
                                                        band4 = true;
                                                        band2 = false;
                                                    }
                                                    else {
                                                        app.dialog.alert("No permitido los numeros 80 y 90.");
                                                    }
                                                }
                                                else {
                                                    app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                }
                                            }
                                            else {
                                                if($$("#my-account-phone").val().substring(0, 2) == "00") {
                                                    if($$("#my-account-phone").val().substring(2, 4) == "34") {
                                                        if($$("#my-account-phone").val().substring(4, 6) != "80" && $$("#my-account-phone").val().substring(4, 6) != "90") {
                                                            band4 = true;
                                                            band2 = false;
                                                        }
                                                        else {
                                                             app.dialog.alert("No permitido los numeros 80 y 90.");
                                                        }
                                                    }
                                                    else {
                                                        app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                    }
                                                }
                                                else {
                                                    app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                }
                                            }
                                        }
                                        else {
                                            app.dialog.alert("El teléfono ingresado debe ser mayor a 8 caracteres");
                                        }
                                        
                                        if(band4) {
                                            band2 = false;
                                            API.checkEmailPhone({
                                                p: $$("#my-account-phone").val(),
                                            }, function(json) {
                                                if(json.msg == "OK") {
                                                    app.router.navigate({
                                                        url: '/confirm/?update=' + JSON.stringify({
                                                            name: $$("#my-account-name").val(),
                                                            lastName: $$("#my-account-last-name").val(),
                                                            code: $$("#my-account-code-postal").val(),
                                                            phone: $$("#my-account-phone").val(),
                                                            phone2: $$("#my-account-phone2").val(),
                                                            dni: $$("#my-account-dni").val(),
                                                            p: 1,
                                                            acept: "[1, 1]"
                                                        })
                                                    });
                                                }
                                                else {
                                                    band2 = false;
                                                    app.dialog.alert("El teléfono ingresado ya existe");
                                                }
                                                app.customFunctions.hideIndicator();
                                            }, function(error) {
                                                app.customFunctions.hideIndicator();
                                                //console.log(error);
                                            });
                                        }
                                    }
                                }
                                //}
                            }
						}
						else {
                            if($$("#my-account-phone").val() != "" || $$("#my-account-email").val() != "") {
                                if($$("#my-account-phone").val() != "") {
                                    if(userInfo.telefono != $$("#my-account-phone").val()) {
                                        var band3 = false;
                                        
                                        if($$("#my-account-phone").val().length > 8) {
                                            if($$("#my-account-phone").val().substring(0, 1) == "+") {
                                                if($$("#my-account-phone").val().substring(0, 2) == "34") {
                                                    if($$("#my-account-phone").val().substring(2, 4) != "80" && $$("#my-account-phone").val().substring(2, 4) != "90") {
                                                        band3 = true;
                                                        band2 = false;
                                                    }
                                                    else {
                                                        app.dialog.alert("No permitido los numeros 80 y 90.");
                                                    }
                                                }
                                                else {
                                                    app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                }
                                            }
                                            else {
                                                if($$("#my-account-phone").val().substring(0, 2) == "00") {
                                                    if($$("#my-account-phone").val().substring(2, 4) == "34") {
                                                        if($$("#my-account-phone").val().substring(4, 6) != "80" && $$("#my-account-phone").val().substring(4, 6) != "90") {
                                                            band3 = true;
                                                            band2 = false;
                                                        }
                                                        else {
                                                             app.dialog.alert("No permitido los numeros 80 y 90.");
                                                        }
                                                    }
                                                    else {
                                                        app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                    }
                                                }
                                                else {
                                                    app.dialog.alert("El formato del teléfono tiene que ser 0034xxxxxxxxx.");
                                                }
                                            }
                                        }
                                        else {
                                            app.dialog.alert("El teléfono ingresado debe ser mayor a 8 caracteres");
                                        }
                                        
                                        if(band3) {
                                            band2 = false;
                                            API.checkEmailPhone({
                                                p: $$("#my-account-phone").val(),
                                            }, function(json) {
                                                if(json.msg == "OK") {
                                                    app.router.navigate({
                                                        url: '/confirm/?update=' + JSON.stringify({
                                                            name: $$("#my-account-name").val(),
                                                            lastName: $$("#my-account-last-name").val(),
                                                            code: $$("#my-account-code-postal").val(),
                                                            phone: $$("#my-account-phone").val(),
                                                            phone2: $$("#my-account-phone2").val(),
                                                            dni: $$("#my-account-dni").val(),
                                                            p: 1
                                                        })
                                                    });
                                                }
                                                else {
                                                    band2 = false;
                                                    app.dialog.alert("El teléfono ingresado ya existe.");
                                                }
                                                app.customFunctions.hideIndicator();
                                            }, function(error) {
                                                app.customFunctions.hideIndicator();
                                                //console.log(error);
                                            });
                                        }
                                    }
                                }
                                if($$("#my-account-email").val() != "") {
                                    band2 = false;
                                    if(userInfo.email != $$("#my-account-email").val()) {
                                        API.checkEmailPhone({
                                            e: $$("#my-account-email").val(),
                                        }, function(json) {
                                            if(json.msg == "OK") {
                                                app.router.navigate({
                                                    url: '/confirm/?update=' + JSON.stringify({
                                                        name: $$("#my-account-name").val(),
                                                        lastName: $$("#my-account-last-name").val(),
                                                        code: $$("#my-account-code-postal").val(),
                                                        phone: $$("#my-account-phone").val(),
                                                        phone2: $$("#my-account-phone2").val(),
                                                        email: $$("#my-account-email").val(),
                                                        dni: $$("#my-account-dni").val(),
                                                        e: 1
                                                    })
                                                });
                                            }
                                            else {
                                                band2 = false;
                                                app.dialog.alert("El correo electrónico ingresado ya existe");
                                            }
                                            app.customFunctions.hideIndicator();
                                        }, function(error) {
                                            app.customFunctions.hideIndicator();
                                            //console.log(error);
                                        });
                                        band2 = false;
                                    }
                                }
                            }
						}
						
						if(band2) {
                            if(typeof userInfo.privacidad != "undefined" && userInfo.privacidad  == null) {
                               if($$("input[type=checkbox][name=aceptMA]:checked").length < 2) {
                                    app.dialog.alert("Debe aceptar los Términos y condiciones y las Políticas de privacidad.");
                                }
                            }
                            else {
                                app.customFunctions.showIndicator();
                                app.request.post(url, {
                                    op: 9,
                                    i: userInfo.reg_password,
                                    img: imgMyAccount,
                                    name: $$("#my-account-name").val(),
                                    lastName: $$("#my-account-last-name").val(),
                                    code: $$("#my-account-code-postal").val(),
                                    phone: $$("#my-account-phone").val(),
                                    phone2: $$("#my-account-phone2").val(),
                                    dni: $$("#my-account-dni").val(),
                                    picGallery: picGallery,
                                    acept: "[1, 1]"
                                }, function (json) {
                                    app.customFunctions.hideIndicator();
                                    json = JSON.parse(json);
                                    //console.log(json);
                                    userInfo = app.data('userInfo');
                                    //console.log(userInfo);
                                    json.info.password = userInfo.password;
                                    if(imgMyAccount != null) {
                                        $$("#imgUser").attr("src", "data:image/png;base64," + imgMyAccount);
                                    }
                                    if(picGallery != null) {
                                        $$("#imgUser").attr("src", $$("#currentPicProfile").attr("src"));
                                    }
                                    $$("#username").html($$("#my-account-name").val() + " " + $$("#my-account-last-name").val());
                                    imgMyAccount = null;
                                    app.data('userInfo', json.info);
                                    userInfo = app.data('userInfo');							
                                    app.dialog.alert("Información actualizada correctamente.");
                                    if(typeof app.views.main.router.currentRoute.query.page != "undefined") {
                                        app.router.navigate({
                                            url: '/agenda/'
                                        });
                                    }
                                    else {
                                        if(userInfo.usuario > 0) {
                                            app.router.navigate({
                                                url: '/filtro/'
                                            });
                                        }
                                        else {
                                            app.router.navigate({
                                                url: '/complement/'
                                            });
                                        }
                                    }
                                }, function() {
                                    app.customFunctions.hideIndicator();
                                });
                            }
						}
					}
				});
			}
		}
	}, {
		path: '/location/',
		url: 'location.html',
		on: {
			pageInit: function (e, page) {
				
				var userInfo = app.data('userInfo');
				var center = {lat: 41.3948976, lng: 2.0787282};
                if(userInfo.latitud != null && userInfo.latitud != "") {
                    center = {lat: parseFloat(userInfo.latitud), lng: parseFloat(userInfo.longitud)};
                }
                
                var map = new google.maps.Map(document.getElementById('locationMap'), {
					center: center,
					disableDefaultUI: true,
					zoom: 16,
					clickableIcons: false//,
					//styles: mapStyles
				});
				
				var geocoder = new google.maps.Geocoder;
				
				markerCurrentPosition = new google.maps.Marker({
					position: center,
					icon: {
						url: 'img/user-marker.png',
						scaledSize: new google.maps.Size(36, 53),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(0, 0)
					},
					map: map,
					title: 'Mi posición actual'
				});
				
				locate = function() {
					app.request({
						method: 'get',
						url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&components=country:Es&key=AIzaSyAo-Dp0Q2Rlzbi2MtjsYaD4gauMTJU9wJ4',
						dataType: 'json',
						data: {
							input: $$("#location-city").val() + " " + $$("#location-street").val() + " " + $$("#location-number").val() // + " " + $$("#location-piso").val()
						},
						success: function(response) {
							//console.log(response);
							if(response.status == "ZERO_RESULTS") {
								app.request({
									method: 'get',
									url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&components=country:Es&key=AIzaSyAo-Dp0Q2Rlzbi2MtjsYaD4gauMTJU9wJ4',
									dataType: 'json',
									data: {
										input: $$("#location-city").val()
									},
									success: function(response) {
										if(response.status == "OK") {
											var place_id = response.predictions[0].place_id;
											geocoder.geocode({'placeId': place_id}, function(results, status) {
												if (status === google.maps.GeocoderStatus.OK) {
												  if (results[0]) {
													map.setZoom(18);
													markerCurrentPosition.setPosition(results[0].geometry.location);
													map.panTo(markerCurrentPosition.getPosition());
													markerCurrentPosition.setAnimation(google.maps.Animation.BOUNCE);
													//geocodeLatLng(geocoder, map3);
													setTimeout(function () {
														markerCurrentPosition.setAnimation(null);
														google.maps.event.trigger(map, "resize");
													}, 2500);
												  } else {
													map.setZoom(18);
													markerCurrentPosition.setPosition(center);
													map.panTo(markerCurrentPosition.getPosition());
												  }
												} else {
													markerCurrentPosition.setPosition(center);
													map.panTo(markerCurrentPosition.getPosition());
													map.setZoom(18);
												}
											});
										}
										else {
											map.setZoom(18);
											markerCurrentPosition.setPosition(center);
											map.panTo(markerCurrentPosition.getPosition());
										}
									}
								});
							}
							else {
								var place_id = response.predictions[0].place_id;
								//console.log(place_id);
								geocoder.geocode({'placeId': place_id}, function(results, status) {
									if (status === google.maps.GeocoderStatus.OK) {
									  if (results[0]) {
									  	map.setZoom(18);
										markerCurrentPosition.setPosition(results[0].geometry.location);
										map.panTo(markerCurrentPosition.getPosition());
										markerCurrentPosition.setAnimation(google.maps.Animation.BOUNCE);
										//geocodeLatLng(geocoder, map3);
										setTimeout(function () {
											markerCurrentPosition.setAnimation(null);
											google.maps.event.trigger(map, "resize");
										}, 2500);
									  } else {
										markerCurrentPosition.setPosition(center);
										map.panTo(markerCurrentPosition.getPosition());
										map.setZoom(18);
									  }
									} else {
										markerCurrentPosition.setPosition(center);
										map.panTo(markerCurrentPosition.getPosition());
										map.setZoom(18);
									}
								});
							}
						}
					});
				};
				
				$$("#location-city").keyup(function(e) {
					locate();
				});
				
				$$("#location-street").keyup(function(e) {
					locate();
				});
				
				$$("#location-number").keyup(function(e) {
					locate();
				});
				
				/*$$("#location-piso").keyup(function(e) {
					locate();
				});*/
				
				$$("#registerLocation").click(function() {
					var userInfo = app.data('userInfo');
					if(userInfo.reg_password == 0) {
						app.dialog.alert("Debe registrarse para poder utilizar esta función.");
					}
					else {
						if(typeof app.views.main.router.currentRoute.query.n != "undefined") {
							infoNewLocation = {
								city: $$("#location-city").val(),
								street: $$("#location-street").val(),
								number: $$("#location-number").val(),
								piso: $$("#location-piso").val(),
								latitud: markerCurrentPosition.getPosition().lat(),
								longitud: markerCurrentPosition.getPosition().lng()
							};
							goToBack();
						}
						else {
							if(parseInt(userInfo.profesional) > 0 || parseInt(userInfo.usuario) > 0) {
								var url = API.host + '/api/operaciones-pruebas.php';
								app.customFunctions.showIndicator();
								app.request.post(url, {
									op: 9,
									i: userInfo.reg_password,
									location: JSON.stringify({
										city: $$("#location-city").val(),
										street: $$("#location-street").val(),
										number: $$("#location-number").val(),
										piso: $$("#location-piso").val(),
										latitud: markerCurrentPosition.getPosition().lat(),
										longitud: markerCurrentPosition.getPosition().lng()
									})
								}, function (json) {
									app.customFunctions.hideIndicator();
									userInfo.ciudad = $$("#location-city").val();
									userInfo.calle = $$("#location-street").val();
									userInfo.numero = $$("#location-number").val();
									userInfo.piso = $$("#location-piso").val();
									userInfo.latitud = markerCurrentPosition.getPosition().lat();
									userInfo.longitud = markerCurrentPosition.getPosition().lng();
									app.data('userInfo', userInfo);

									goToBack();
									setTimeout(function() {
										$$(".dialog-button").trigger("click");
									}, 3000);
									app.dialog.alert("Se ha guardado exitosamente la dirección.");
								}, function() {
									app.customFunctions.hideIndicator();
								});
							}

							if(parseInt(userInfo.centrodesalud) > 0) {
								API.saveDatesCenter({
									i: userInfo.reg_password,
									location: JSON.stringify({
										city: $$("#location-city").val(),
										street: $$("#location-street").val(),
										number: $$("#location-number").val(),
										piso: $$("#location-piso").val(),
										latitud: markerCurrentPosition.getPosition().lat(),
										longitud: markerCurrentPosition.getPosition().lng()
									})
								}, function(json) {

									userInfo.ciudad = $$("#location-city").val();
									userInfo.calle = $$("#location-street").val();
									userInfo.numero = $$("#location-number").val();
									userInfo.piso = $$("#location-piso").val();
									userInfo.latitud = markerCurrentPosition.getPosition().lat();
									userInfo.longitud = markerCurrentPosition.getPosition().lng();
									app.data('userInfo', userInfo);

									goToBack();
									setTimeout(function() {
										$$(".dialog-button").trigger("click");
									}, 3000);
									app.dialog.alert("Información guardada exitosamente.");
								}, function(error) {
									app.customFunctions.hideIndicator();
									//console.log(error);
								});
							}
						}
					}
				});
				
				if(userInfo.ciudad != null && userInfo.ciudad != "") {
					$$("#location-city").val(userInfo.ciudad);
				}
				if(userInfo.calle != null && userInfo.calle != "") {
					$$("#location-street").val(userInfo.calle);
				}
				if(userInfo.numero != null && userInfo.numero != "") {
					$$("#location-number").val(userInfo.numero);
				}
				if(userInfo.piso != null && userInfo.piso != "") {
					$$("#location-piso").val(userInfo.piso);
				}
				
				/*map.addListener('click', function (e) {
					markerCurrentPosition.setPosition(e.latLng);
					map.panTo(markerCurrentPosition.getPosition());
					markerCurrentPosition.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function () {
						markerCurrentPosition.setAnimation(null);
					}, 1500);
				});*/
				
			}
		}
	}, {
		path: '/complement/',
		url: 'complement.html',
		on: {
			pageInit: function (e, page) {
				var mutuas, centros;
				var userInfo = app.data('userInfo');
				app.customFunctions.showIndicator();
				API.getInfoFilter({
					i: userInfo.reg_password
				}, function (json) {
					app.customFunctions.hideIndicator();
					var labelMutua = "";
					var labelCentro = "";
					var checkedCentro;
					var checkedMutua;
					var html = '<option value="0" selected>Consulta privada</option>';
					if(json.centro.length > 0) {
						json.centro.forEach(function(c) {
							checkedCentro = "";
							if(parseInt(c.reg) > 0) {
								if(parseInt(c.is) == 1) {
									labelCentro += c.nombre + " ";
									checkedCentro = "selected";
								}
								html += '<option value="'+c.reg+'" '+checkedCentro+'>'+c.nombre+'</option>';
							}
						});
					}
					$$("#centroSalud").html(html);
					//$$("#labelCentro").html(labelCentro);
					html = '<option value="0" selected>Solo privado</option>';
					if(json.mutua.length > 0) {
						json.mutua.forEach(function(m) {
							checkedMutua = "";
							if(parseInt(m.reg) > 0) {
								if(parseInt(m.is) == 1) {
									labelMutua += m.descripcion + " ";
									checkedMutua = "selected";
								}
								html += '<option value="'+m.reg+'" '+checkedMutua+'>'+m.descripcion+'</option>';
							}
						});
					}
					//$$("#labelMutua").html(labelMutua);
					$$("#mutuasProf").html(html);
					
					var ninguno = "selected";
					if(json.idiomas.length > 0) {
						json.idiomas.forEach(function(i) {
							checkedMutua = "";
							if(parseInt(i.agregado) > 0) {
								ninguno = "";
							}
						});
					}
                    html = '<option value="0" '+ninguno+'>Ninguno</option>';
					if(json.idiomas.length > 0) {
                        var names = "";
						json.idiomas.forEach(function(i) {
							checkedMutua = "";
							if(parseInt(i.agregado) > 0) {
                                names += i.idioma + ", ";
								checkedMutua = "selected";
							}
							html += '<option value="'+i.reg+'" '+checkedMutua+'>'+i.idioma+'</option>';
						});
                        if(names != "") {
                            names = names.substring(0, (names.length -2));
                        }
                        $$("#actionLangs .item-after").html(names);
                        /*setTimeout(function() {
                            $$("#actionLangs").trigger("click");
                            setTimeout(function() {
                                app.smartSelect.close("#actionLangs");
                            }, 500);
                        }, 600);*/
					}
					$$("#langProf").html(html);
					
					mutuas = app.smartSelect.create({
						el: "#mutuasProf"
					});
					centros = app.smartSelect.create({
						el: "#centroSalud"
					});
					
					if(typeof json.ficha != "undefined") {
						var info = json.ficha;
						if(info.trabajafiestas) {
                            if(info.trabajafiestas > 0) {
                                $$("#workIn").prop("checked", true);
                            }
                        }
                        if(info.colegiado) {
                            if(info.colegiado > 0) {
                                $$("#vigor1").prop("checked", true);
                            }
                        }
						if(info.seguro) {
                            if(info.seguro > 0) {
                                $$("#vigor2").prop("checked", true);
                            }
                        }
                        if(info.AEAT) {
                            if(info.AEAT > 0) {
                                $$("#vigor3").prop("checked", true);
                            }
                        }
						/*if(info.sexo != null && info.sexo != "") {
							$$("#sexProf").val(info.sexo);
						}*/
						/*if(info.mutua != null && info.mutua != "") {
							$$("#mutuasProf").val(info.mutua);
						}
						if(info.centrosalud != null && info.centrosalud != "") {
							$$("#centroSalud").val(info.centrosalud);
						}*/
					}
					
				}, function (error) {
                    app.customFunctions.hideIndicator();
					//console.log(error);
				});
                
                $$(".item-link.smart-select").click(function() {
                    var action = $$(this).attr("data-action");
                    setTimeout(function() {
                        $$(".page.smart-select-page[data-name=smart-select-page][data-select-name=fruits] .navbar .navbar-inner").append('<div class="right"> <a href="#" id="actionSaveLang" class="link back"> <i class="fal fa-check" style="color: white;"></i> </a> </div>');
                        if(action == "idiomas") {
                            $$("#actionSaveLang").click(function() {
                                app.customFunctions.showIndicator();
                                API.saveComplement({
                                    i: userInfo.reg_password,
                                    idiomas: JSON.stringify($$("#langProf").val())
                                }, function (json) {
                                    app.customFunctions.hideIndicator();
                                    app.dialog.alert("Información actualizada exitosamente.");
                                }, function (error) {
                                    app.customFunctions.hideIndicator();
                                    //console.log(error);
                                });
                            });
                        }
                    }, 700);
                });
                
				$$("#saveComplement").click(function() {
					var url = API.host + '/api/operaciones-pruebas.php';
					var userInfo = app.data('userInfo');
					app.customFunctions.showIndicator();
					API.saveComplement({
						i: userInfo.reg_password,
						d: moment().format('YYYY-MM-DD'),
						centros: JSON.stringify($$("#centroSalud").val()),
						mutuas: JSON.stringify($$("#mutuasProf").val()),
						idiomas: JSON.stringify($$("#langProf").val()),
						sexProf: $$("#sexProf").val(),
						vigor1: $$("#vigor1:checked").length,
						vigor2: $$("#vigor2:checked").length,
						vigor3: $$("#vigor3:checked").length,
						workIn: $$("#workIn:checked").length
					}, function (json) {
						app.customFunctions.hideIndicator();
						json.password = userInfo.password;
						app.data('userInfo', json);
						if(typeof app.views.main.router.currentRoute.query.page != "undefined") {
							app.router.back();
						}
						else {
							app.router.navigate({
								url: '/agenda/'
							});
						}
                        setTimeout(function() {
                            app.dialog.alert("Información actualizada exitosamente.");
                        }, 500);
					}, function (error) {
						app.customFunctions.hideIndicator();
						//console.log(error);
					});
				});
			}
		}
	}, {
		path: '/taxs/',
		url: 'taxs.html',
		on: {
			pageInit: function (e, page) {
				firstTax = true;
				getTaxs();
				
				$$("#deleteTaxs").click(function() {
					app.dialog.confirm('Esta seguro que desea eliminar esta información?', function () {
						app.customFunctions.showIndicator();
						var userInfo = app.data('userInfo');
						API.deleteTaxs({
							i: userInfo.reg_password,
                            t: $$("#tratamientosTarifas").val()
						}, function(json) {
							app.customFunctions.hideIndicator();
							$$("#deleteTaxs").hide();
							$$("#tratamientosTarifas").val("");
							$$("#descripcionTax").val("");
							$$("#priceTax").val("");
							$$("#timeTax").val("");
							$$("#saveTaxs").html("Alta");
							app.dialog.alert("Datos eliminados exitosamente.");
						}, function(error) {
							app.customFunctions.hideIndicator();
							//console.log(error);
						});
					});
				});

				$$("#saveTaxs").click(function() {
					var userInfo = app.data('userInfo');
					if($$("#tratamientosTarifas").val() > 0 && $$("#descripcionTax").val() != "") {
						app.customFunctions.showIndicator();
						API.saveTaxs({
							i: userInfo.reg_password,
							t: $$("#tratamientosTarifas").val(),
							d: $$("#descripcionTax").val(),
							p: $$("#priceTax").val(),
							tim: $$("#timeTax").val(),
							o: $$("#offert:checked").length
						}, function (json) {
							app.customFunctions.hideIndicator();
							
							getTaxs();
							
							app.dialog.alert("Tarifa confirmada.");
							$$("#saveTaxs").html("Alta-Modif");
							$$("#deleteTaxs").css("display", "");
							
							if($$("#offert:checked").length > 0) {
								app.router.navigate({
									url: '/offers/?i=' + $$("#tratamientosTarifas").val()
								});
							}
							
						}, function (error) {
						 	app.customFunctions.hideIndicator();
							//console.log(error);
						});
					}
					else {
						app.dialog.alert("Debe añadir un tratamiento y una descripción.");
					}					
				});
			}
		}
	}, {
		path: '/offers/',
		url: 'offers.html',
		on: {
			pageInit: function (e, page) {
				
				var query = app.views.main.router.currentRoute.query;
				
				
				$$("#fromOffers").val(moment().format('DD/MM/YYYY'));
				$$("#untilOffers").val(moment().format('DD/MM/YYYY'));
				var calendarDefault1 = app.calendar.create({
				  inputEl: '#fromOffers',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					on: {
						dayClick: function(c, el) {
							calendarDefault1.close();
						}
				  	}
				});
				var calendarDefault2 = app.calendar.create({
				  inputEl: '#untilOffers',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					on: {
						dayClick: function(c, el) {
							calendarDefault2.close();
						}
				  	}
				});
				
				var userInfo = app.data('userInfo');
				
				var html = "";
				var t = 30;
				for(var i = 8; i <= 22; i+=0.5) {
					var j = i | 0;
					j = zeroFill(j, 2);
					t = t == 0 ? 30 : 0;
					html += '<option value="'+j+":"+zeroFill(t, 2)+'">'+j+":"+zeroFill(t, 2)+'</option>';
					
				}
				
				$$("#fromHours").html(html);
				$$("#untilHours").html(html);
				app.customFunctions.showIndicator();
				API.loadOffers({
					i: userInfo.reg_password
				}, function (json) {
					var info = json.info;
					var data = info;
					
					$$("#saveOffers").html("Alta");
					
					if(info.tratamientos.length > 0) {
						var html = '<option value="">Tratamientos</option>';
						info.tratamientos.forEach(function(t) {
							html += '<option value="'+t.reg+'">'+t.tratamiento+'</option>';
						});
						$$("#tratamientosOfertas").html(html);
					}
					
					if(typeof query.i != "undefined") {
						$$("#tratamientosOfertas").val(query.i);
					}
					
					app.customFunctions.hideIndicator();

					$$("#tratamientosOfertas").change(function() {
						var value = this.value;
						var info;
						var text = "";
						var dias = "";
						if(value != "") {
							var band = true;
							data.ofertas.forEach(function(o) {
								if(value == o.reg_tratamientos) {
									$$("#deleteOffer").css("display", "");
									$$("#saveOffers").html("Alta-modif");
									band = false;
									info = o;
									$$("#fromOffers").val(info.dechaDesde);
									$$("#untilOffers").val(info.fechaHasta);
									$$("#fromHours").val(info.horaDesde);
									$$("#untilHours").val(info.horaHasta);
									$$("#descuentoOffers").val(info.dto);
									$$("#giftOffers").val(info.regalo);
									$$("#priceOffers").val(info.precio);

									if(info.lun > 0) {
										text = '<option value="1" selected="">Lunes</option>';
										dias = "Lunes";
									}
									else {
										text = '<option value="1">Lunes</option>';
									}
									if(info.mar > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Martes";
										text += '<option value="2" selected="">Martes</option>';
									}
									else {
										text += '<option value="2">Martes</option>';
									}
									if(info.mier > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Miércoles";
										text += '<option value="3" selected="">Miércoles</option>';
									}
									else {
										text += '<option value="3">Miércoles</option>';
									}
									if(info.jue > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Jueves";
										text += '<option value="4" selected="">Jueves</option>';
									}
									else {
										text += '<option value="4">Jueves</option>';
									}
									if(info.vier > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Viernes";
										text += '<option value="5" selected="">Viernes</option>';
									}
									else {
										text += '<option value="5">Viernes</option>';
									}
									if(info.sab > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Sábado";
										text += '<option value="6" selected="">Sábado</option>';
									}
									else {
										text += '<option value="6">Sábado</option>';
									}
									if(info.dom > 0) {
										if(dias != "") {
											dias += ", ";
										}
										dias += "Domingo";
										text += '<option value="7" selected="">Domingo</option>';
									}
									else {
										text += '<option value="7">Domingo</option>';
									}
									$$("#containerLabelDays .item-after").html(dias);
									$$("#daysOffers").html(text);
									$$("#saveOffers").html("Alta-modif");
								}
							});
							if(band) {
								$$("#fromOffers").val("");
								$$("#untilOffers").val("");
								$$("#fromHours").val("");
								$$("#untilHours").val("");
								$$("#descuentoOffers").val("");
								$$("#giftOffers").val("");
								$$("#priceOffers").val("");
								$$("#saveOffers").html("Alta");
							}
						}
						else {
							$$("#fromOffers").val("");
							$$("#untilOffers").val("");
							$$("#fromHours").val("");
							$$("#untilHours").val("");
							$$("#descuentoOffers").val("");
							$$("#giftOffers").val("");
							$$("#priceOffers").val("");
							$$("#saveOffers").html("Alta");
						}
					});
					
				}, function (error) {
					app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				$$("#saveOffers").click(function() {
					var userInfo = app.data('userInfo');
					var desde = moment($$("#fromOffers").val(), "DD/MM/YYYY");
					var hasta = moment($$("#untilOffers").val(), "DD/MM/YYYY");
					if($$("#tratamientosOfertas").val() != "") {
						app.customFunctions.showIndicator();
                        API.saveOffers({
                            i: userInfo.reg_password,
                            tratamientos: $$("#tratamientosOfertas").val(),
                            fechaDesde: desde.format("YYYY-MM-DD"),
                            fechaHasta: hasta.format("YYYY-MM-DD"),
                            horaDesde: $$("#fromHours").val(),
                            horaHasta: $$("#untilHours").val(),
                            dias: JSON.stringify($$("#daysOffers").val()),
                            descuento: $$("#descuentoOffers").val(),
                            precio: $$("#priceOffers").val(),
                            regalo: $$("#giftOffers").val()
                        }, function (json) {
							app.customFunctions.hideIndicator();
                            $$("#deleteOffer").css("display", "");
                            $$("#saveOffers").html("Alta-modif");
                            app.dialog.alert("Datos almacenados exitosamente.");
							
							query = app.views.main.router.currentRoute.query;
							if(typeof query.i != "undefined") {
								app.router.back();
							}
							
                        }, function (error) {
							app.customFunctions.hideIndicator();
                            //console.log(error);
                        });
                    }
                    else {
                        app.dialog.alert("Debe seleccionar un tratamiento.");
                    }
				});
				
				$$("#descuentoOffers").keypress(function(e) {
					if($$("#descuentoOffers").val().length == 2) {
						e.preventDefault();
					}
				});
				
				$$("#deleteOffer").click(function() {
					app.dialog.confirm('Esta seguro que desea eliminar esta información?', function () {
						app.customFunctions.showIndicator();
						var userInfo = app.data('userInfo');
						if($$("#tratamientosOfertas").val() != "") {
                            API.deleteOffers({
                                i: userInfo.reg_password,
                                t: $$("#tratamientosOfertas").val()
                            }, function(json) {
                                app.customFunctions.hideIndicator();
                                $$("#deleteOffer").hide();
                                $$("#containerLabelDays .item-after").html("");
                                $$("#tratamientosOfertas").val("");
                                $$("#descuentoOffers").val("");
                                $$("#priceOffers").val("");
                                $$("#giftOffers").val("");
                                $$("#fromHours").val("08:00");
                                $$("#untilHours").val("08:00");
                                $$("#fromOffers").val("");
                                $$("#untilOffers").val("");
                                //$$("#fromOffers").val(moment().format('DD/MM/YYYY'));
                                //$$("#untilOffers").val(moment().format('DD/MM/YYYY'));
                                $$("#saveOffers").html("Alta");
                                app.dialog.alert("Datos eliminados exitosamente.");
                            }, function(error) {
								app.customFunctions.hideIndicator();
                                //console.log(error);
                            });
                        }
                        else {
                            app.dialog.alert("Debe seleccionar un tratamiento.");
                        }
					});
				});
			}
		}
	}, {
		path: '/personal/',
		url: 'personal.html',
		on: {
			pageInit: function (e, page) {
				
				$$("#labelAction").html("Alta");
				
				var today = moment();
				var futureMonth = moment(today).add(3, 'M');
				var calendarDefault1 = app.calendar.create({
				  inputEl: '#dateE',
					monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
					monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
					dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
					dateFormat: 'dd/mm/yyyy',
					minDate: today,
					maxDate: futureMonth,
					on: {
						dayClick: function(c, el) {
							calendarDefault1.close();
						}
				  	}
				});
				
				var user = false;
				
				var userInfo = app.data('userInfo');
				$$("#alta").prop("disabled", false);
                
                $$("#alta").change(function() {
                    if(this.checked) {
                        $$("#savePersonal").css("display", "");
                    }
                    else {
                        $$("#savePersonal").css("display", "none");
                    }
                });
                
				$$("#searchdni").click(function() {
					if($$("#cifp").val() != "") {
                        app.customFunctions.showIndicator();
						API.searchdni({
							i: userInfo.reg_password,
							s: $$("#cifp").val()
						}, function (json) {
							if(typeof json.info.nombre != "undefined") {
								user = true;
								/*if(json.info.reg_prof != null && json.info.reg_prof != "") {
									$$("#labelAction").html("Baja");
								}*/
								
								if(parseInt(json.info.existe) > 0) {
									$$("#labelAction").html("Baja");
									$$("#alta").prop("disabled", true);
								}
								else {
									$$("#alta").prop("disabled", false);
								}
								
                                $$("#labelTitleUser").html(json.info.nombre + " " + json.info.apellidos);
                                $$("#imgUser").attr("src", (json.info.foto != null && json.info.foto != "" ? (API.host + "/images/pics/" + json.info.foto) :  'img/avatar-default-alt.png'));
                                $$("#savePersonal").attr("data-id", json.info.reg_password);
								var html = "";
                                if(json.info.tratamientos.length > 0) {
                                    json.info.tratamientos.forEach(function(t) {
                                        html += t.tratamiento + ' | ';
                                    });
                                    html = html.substr(0, (html.length -2));
                                }
                                html += json.info.telefono + ' | ' + json.info.email;
                                $$("#labelTaxsUser").html(html);
								$$("#containerUserPersonal").css("display", "");
							}
							else {
                                $$("#containerUserPersonal").css("display", "none");
								app.dialog.alert("Sin resultados.");
							}
                            app.customFunctions.hideIndicator();
						}, function (error) {
							app.customFunctions.hideIndicator();
							//console.log(error);
						});
					}
					else {
						app.dialog.alert("Debe añadir el dni/cif para continuar.");
					}
				});
				
				$$("#savePersonal").click(function() {
					if($$("#cifp").val() != "" && $$("#dateE").val() != "") {
						if(user) {
                            app.customFunctions.showIndicator();
							var d1 = moment($$("#dateE").val(), "DD/MM/YYYY");
							API.actionUser({
								i: userInfo.reg_password,
								s: $$("#cifp").val(),
								d: d1.format("YYYY-MM-DD"),
								c: $$("#alta:checked").length,
								p: $$("#savePersonal").attr("data-id")
							}, function (json) {
                                $$("#labelAction").html("Alta");
                                $$("#containerUserPersonal").hide();
								$$("#cifp").val("");
								$$("#dateE").val("");
								user = false;
                                $$("#alta").prop("checked", false);
                                $$("#savePersonal").css("display", "none");
								app.dialog.alert("Información procesada.");
                                app.customFunctions.hideIndicator();
							}, function (error) {
								app.customFunctions.hideIndicator();
								//console.log(error);
							});
						}
						else {
							app.dialog.alert("No existen usuarios con el dni/cif escrito.");
						}
					}
					else {
						app.dialog.alert("Debe añadir el dni/cif para continuar y/o la fecha de efectividad.");
					}
				});
			}
		}
	}, {
		path: '/center/',
		url: 'center.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				
				/*API.loadOffers({
					i: userInfo.reg_password
				}, function (json) {
					
				}, function (error) {
					//console.log(error);
				});
				
				*/
			}
		}
	},  {
		path: '/ranking-professional/',
		url: 'ranking-professional.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var i = app.views.main.router.currentRoute.query.p;
				app.customFunctions.showIndicator();
				$$("#containerMenuProf").hide();
				API.getInfoProfesional({
					i: i,
					idc: userInfo.reg_password,
                    d: moment().format('YYYY-MM-DD')
				}, function (json) {
					if(parseInt(json.valoracion.favorito) > 0) {
						$$("#favoriteRating").attr("data-status", 1);
						$$("#favoriteRating").html('<i class="fas fa-heart" style=" font-size: 20px;"></i>');
					}
					else {
						$$("#favoriteRating").attr("data-status", 0);
						$$("#favoriteRating").html('<i class="fal fa-heart" style=" font-size: 20px;"></i>');
					}
					
					app.range.setValue(".rangeP", json.valoracion.puntualidad);
					app.range.setValue(".rangeA", json.valoracion.amabilidad);
					app.range.setValue(".rangeT", json.valoracion.tratamiento);
					
					if(json.valoracion.comentario != null && json.valoracion.comentario != "") {
						$$("#comentarioPaciente").val(json.valoracion.comentario);
					}
					else {
						$$("#comentarioPaciente").val("");
					}
					
					$$("#labelTaxsUserRanking").html(starsRanking(json.puntaje) + ' ('+json.cant+')');
					
					$$("#labelTitleUserRanking").html(json.nombre + " / " + json.apellidos);
					app.customFunctions.hideIndicator();
				}, function (error) {
					app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				$$("#saveRanking").click(function() {
					API.updateRanking({
						i: i,
						idc: userInfo.reg_password,
						p: app.range.getValue(".rangeP"),
						a: app.range.getValue(".rangeA"),
						t: app.range.getValue(".rangeT"),
						c: $$("#comentarioPaciente").val()
					}, function (json) {
						$$("#labelTaxsUserRanking").html(starsRanking(json.puntaje) + ' ('+json.cantidad+')');
						app.dialog.alert("Los datos se han actualizado correctamente.");
					}, function (error) {
						//console.log(error);
					});
				});
				
				$$("#favoriteRating").click(function() {
					var s = parseInt($$(this).attr("data-status"));
					if(s == 0) {
						$$(this).attr("data-status", 1);
						$$(this).html('<i class="fas fa-heart" style=" font-size: 20px;"></i>');
						s = 1;
					}
					else {
						$$(this).attr("data-status", 0);
						$$(this).html('<i class="fal fa-heart" style=" font-size: 20px;"></i>');
						s = 0;
					}
					
					API.saveFavoriteRanking({
						i: i,
						idc: userInfo.reg_password,
						val: s
					}, function (json) {
						app.dialog.alert("Los datos se han actualizado correctamente.");
					}, function (error) {
						//console.log(error);
					});					
				});
				
			}
		}
	},  {
		path: '/ranking-professional-center/',
		url: 'ranking-professional-center.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				var i = app.views.main.router.currentRoute.query.p;
				app.customFunctions.showIndicator();
                
                app.range.setValue(".rangePCenter", 0);
                app.range.setValue(".rangeACenter", 0);
                app.range.setValue(".rangeTCenter", 0);
                $$("#comentarioPacienteCenter").val("");
                var prof = [];
                
				$$("#containerMenuProf").hide();
				API.getInfoProfesionalCenter({
					i: i,
					idc: userInfo.reg_password,
                    d: moment().format('YYYY-MM-DD')
				}, function (json) {
                    
                    console.log(json);
                    prof = json.profesionales;
                    
                    $$("#labelTitleUserRankingCenter").html(json.nombre);
                    $$("#labelTaxsUserRankingCenter").html(starsRanking(json.puntaje) + ' (' + json.cant + ')');
                    var html = '<option value="">Seleccione</option>';
                    json.profesionales.forEach(function(p) {
                        html += '<option value="'+p.reg_password+'">'+p.nombre+" "+p.apellidos+'</option>';
                    });
                    $$("#professionalsRankingCenter").html(html);
                    
                    $$("#professionalsRankingCenter").change(function() {
                        app.range.setValue(".rangePCenter", 0);
                        app.range.setValue(".rangeACenter", 0);
                        app.range.setValue(".rangeTCenter", 0);
                        $$("#comentarioPacienteCenter").val("");
                        $$("#favoriteRating").attr("data-status", 0);
						$$("#favoriteRating").html('<i class="fal fa-heart" style=" font-size: 20px;"></i>');
                        var value = this.value;
                        if(value != "") {
                            prof.forEach(function(p) {
                                if(p.reg_password == value) {
                                    if(typeof p.valoracion.reg != "undefined") {
                                        app.range.setValue(".rangePCenter", p.valoracion.puntualidad);
                                        app.range.setValue(".rangeACenter", p.valoracion.amabilidad);
                                        app.range.setValue(".rangeTCenter", p.valoracion.tratamiento);
                                        $$("#comentarioPacienteCenter").val(p.valoracion.comentario);
                                        if(parseInt(p.valoracion.favorito) > 0) {
                                            $$("#favoriteRating").attr("data-status", 1);
                                            $$("#favoriteRating").html('<i class="fas fa-heart" style=" font-size: 20px;"></i>');
                                        }
                                    }
                                }
                            });
                        } 
                    });
					app.customFunctions.hideIndicator();
				}, function (error) {
					app.customFunctions.hideIndicator();
					//console.log(error);
				});
				
				$$("#saveRankingCenter").click(function() {
                    if($$("#professionalsRankingCenter").val() != "") {
                        API.updateRanking({
                            i: i,
                            idc: userInfo.reg_password,
                            p: app.range.getValue(".rangePCenter"),
                            a: app.range.getValue(".rangeACenter"),
                            t: app.range.getValue(".rangeTCenter"),
                            c: $$("#comentarioPacienteCenter").val(),
                            prof: $$("#professionalsRankingCenter").val()
                        }, function (json) {
                            
                            prof = json.profesionales;
                            $$("#labelTaxsUserRankingCenter").html(starsRanking(json.puntaje) + ' (' + json.cant + ')');
                            
                            app.dialog.alert("Los datos se han actualizado correctamente.");
                        }, function (error) {
                            //console.log(error);
                        });
                    }
                    else {
                        app.dialog.alert("Debe seleccionar un profesional para continuar.");
                    }
				});
				
				$$("#favoriteRatingCenter").click(function() {
                    if($$("#professionalsRankingCenter").val() != "") {
                        var s = parseInt($$(this).attr("data-status"));
                        if(s == 0) {
                            $$(this).attr("data-status", 1);
                            $$(this).html('<i class="fas fa-heart" style=" font-size: 20px;"></i>');
                            s = 1;
                        }
                        else {
                            $$(this).attr("data-status", 0);
                            $$(this).html('<i class="fal fa-heart" style=" font-size: 20px;"></i>');
                            s = 0;
                        }

                        API.saveFavoriteRanking({
                            i: i,
                            idc: userInfo.reg_password,
                            val: s,
                            prof: $$("#professionalsRankingCenter").val()
                        }, function (json) {
                            app.dialog.alert("Los datos se han actualizado correctamente.");
                        }, function (error) {
                            //console.log(error);
                        });
                    }
                    else {
                        app.dialog.alert("Debe seleccionar un profesional para continuar.");
                    }		
				});
				
			}
		}
	},  {
		path: '/visit-pending/',
		url: 'visit-pending.html',
		on: {
			pageInit: function (e, page) {
				getVisitPending();
			}
		}
	}, {
		path: '/history-visit/',
		url: 'history-visit.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				
				API.loadVisits({
					i: userInfo.reg_password,
					h: 1
				}, function (json) {
					var html = "";
					var d1 = moment();
					var d2, deleteP = "", rating = "", motivo = "";
					json.profesionales.forEach(function(p) {
						rating = "";
						motivo = "";
						p.citas.forEach(function(c) {
                            if(c.tratamiento) {
                                if(motivo.indexOf(c.tratamiento) == -1) {
                                    motivo += c.tratamiento + ", ";
                                }
                            }
							d2 = moment(c.dia + " " + c.hora, "YYYY-MM-DD HH:mm:ss");
							if(d2.isBefore(d1)) {
								rating = '<div class="item-after"> <a href="/ranking-professional/?p='+p.reg_password+'" class="link" style=" margin-right: 15px;"><i class="fas fa-pencil-alt" style=" font-size: 18px;"></i></a> </div>';
							}
						});
                        if(motivo.length > 0) {
                            motivo = motivo.substring(0, motivo.length-2);
                        }
						html += '<div class="list media-list" style=" margin: 0;"> <ul> <li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-media"><img src="'+((p.foto != null && p.foto != "" ? (API.host + "/images/pics/" + p.foto) : 'img/avatar-default-alt.png'))+'" style=" border-radius: 50%;" width="44"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title" id=""> '+p.nombre+" "+p.apellidos+' </div> '+rating+' </div> <div class="item-subtitle" id="" style="color: gray;white-space:  normal;">'+motivo+'</div> </div> </div> </li> </ul> </div><div id="" class="list no-hairlines-md" style="margin: 0;"> <ul>';
						p.citas.forEach(function(c) {
							d2 = moment(c.dia, "YYYY-MM-DD");
							deleteP = '<a href="#" data-id="'+c.reg+'" class="link deleteVisitHistory" style=" margin-right: 15px;"><i class="fas fa-trash" style=" font-size: 18px;"></i></a>';
							if(d2.isBefore(d1)) {
								deleteP = "";
							}
							html += '<li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-inner"> <div class="item-title" style=" margin-left: 5px;">Fecha '+d2.format("DD-MM-YYYY")+' '+moment(c.hora, "HH:mm:ss").format("HH:mm")+'</div> <div class="item-after"> '+deleteP+' </div> </div> </div> </li>';
						});
						html += '</ul></div>';
					});
                    rating = "";
                    json.centros.forEach(function(c) {
                        motivo = "";
                        rating = "";
                        if(c.citas.length > 0) {
                            c.citas.forEach(function(ci) {
                                d2 = moment(ci.dia + " " + ci.hora, "YYYY-MM-DD HH:mm:ss");
                                if(d2.isBefore(moment())) {
                                    rating = '<div class="item-after"> <a href="/ranking-professional-center/?p='+c.reg_password+'" class="link" style=" margin-right: 15px;"><i class="fas fa-pencil-alt" style=" font-size: 18px;"></i></a> </div>';
                                }
                                
                                if(ci.tratamiento) {
                                    if(motivo.indexOf(ci.tratamiento) == -1) {
                                        motivo += ci.tratamiento + ", ";
                                    }
                                }
                            });
                            if(motivo.length > 0) {
                                motivo = motivo.substring(0, motivo.length-2);
                            }

                            html += '<div class="list media-list" style=" margin: 0;"> <ul> <li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-media"><img src="img/avatar-default-alt.png" style=" border-radius: 50%;" width="44"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title" id=""> '+c.nombre+'</div> '+rating+' </div> <div class="item-subtitle" id="" style="color: gray;white-space:  normal;">'+motivo+'</div> </div> </div> </li> </ul> </div><div id="" class="list no-hairlines-md" style="margin: 0;"> <ul>';

                            rating = "";
                            if(c.citas.length > 0) {
                                c.citas.forEach(function(ci) {
                                    d2 = moment(ci.dia, "YYYY-MM-DD");
                                    deleteP = '<a href="#" data-id="'+ci.reg+'" class="link deleteVisit" style=" margin-right: 15px;"><i class="fas fa-trash" style=" font-size: 18px;"></i></a>';
                                    if(d2.isBefore(d1)) {
                                        deleteP = "";
                                    }
                                    html += '<li style=" border-bottom: 1px solid rgba(0, 0, 0, 0.12);"> <div class="item-content"> <div class="item-inner"> <div class="item-title" style="font-size: 15px;">'+ci.nombre+" "+ci.apellidos+" "+d2.format("DD-MM-YYYY")+' '+moment(ci.hora, "HH:mm:ss").format("HH:mm")+'</div> <div class="item-after"> '+deleteP+' </div> </div> </div> </li>';
                                });
                            }
                            html += '</ul></div>';
                        }
                    });
                    
					$$("#containerVisitsHistory").html(html);
					
					$$(".deleteVisitHistory").click(function() {
                        var userInfo = app.data('userInfo');
						var element = $$(this);
						app.dialog.confirm("Esta seguro que desea eliminar este registro?", function () {
							app.customFunctions.showIndicator();
							API.deleteAgenda({
								i: element.attr("data-id"),
                                u: userInfo.reg_password
							}, function(json) {
								app.customFunctions.hideIndicator();
								element.closest("li").remove();
								getVisitPending();
								app.dialog.alert("Los datos se han eliminado correctamente.");
							}, function(error) {
								app.customFunctions.hideIndicator();
								//console.log(error);
							});
						});
					});
					
				}, function (error) {
					//console.log(error);
				});
			
			}
		}
	}, {
		path: '/maps/',
		url: 'maps.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
                
                var center = {lat: 41.4006307, lng: 2.1305987};
                if(userInfo.latitud != null && userInfo.latitud != "") {
                    center = {lat: parseFloat(userInfo.latitud), lng: parseFloat(userInfo.longitud)};
                }
                
                var bounds, markers = [];
                var markerPosition;
                var map = new google.maps.Map(document.getElementById('map'), {
					center: center,
					disableDefaultUI: true,
					zoom: 12,
					clickableIcons: false,
					styles: mapStyles
				});
				
				var infowindow = new google.maps.InfoWindow({
				  content: ''
				});
				
				var bounds = new google.maps.LatLngBounds();
				getPositionMarker = function(element) {
					map.setZoom(14);
					map.setCenter(markers[parseInt($$(element).attr("data-i"))].getPosition());
					
					var inf = JSON.parse($$(element).attr("data-info"));
					var query = $$(element).attr("data-info");
					/*if(inf.es_centro == 1) {
						query = "1&reg=" + inf.reg_password+"&centr=1";
					}*/
                    
                    infoTaxsUser = query;
                    
                    infowindow.setContent('<a href="/taxsUser/?q=1">'+$$(element).attr("data-name") + '<p>'+starsRanking(inf.puntaje) + ' <span style=" margin-top: -3px;">('+inf.cant+')</span>'+'</p>'+'</a>');
					infowindow.open(map, markers[parseInt($$(element).attr("data-i"))]);
                    
                    
					/*
					setTimeout(function() {
						app.router.navigate({
							url: '/taxsUser/?data=' + query
						});
					}, 3000);*/
					
				};
                
                if(professionals != null) {
                	var data = professionals;
                    var i = 0;
					var html = "";
					var taxs = "";
					var stars = "";
					var markr = 'img/user-marker.png';
					var nombre = "";
                    data.forEach(function(d, key) {
                      if(d.latitud != null && d.latitud != "") {
						  	nombre = d.nombre;
						  	if(typeof d.apellidos != "undefined") {
						  		if(d.apellidos) {
						  			nombre += " " + d.apellidos;
						  		}
						  	}
						   	taxs = "";
						  	stars = starsRanking(d.puntaje);
						  	//stars = starsRanking(d.cualificacion);
							d.tratamientos.forEach(function(t) {
								taxs += t.tratamiento + ' | ';
							});
							if(taxs != "") {
								taxs = taxs.substr(0, (taxs.length -2));
							}
						  
						  	if(parseInt(d.agenda) > 0) {
								markr = 'img/user-marker.png';
							  	html += '<li><a href="#" onclick="getPositionMarker(this)" data-i="'+i+'" data-name="'+nombre+'" data-info=\''+JSON.stringify(d)+'\' class="item-link item-content"><div class="item-media"><img src="'+((d.foto != null && d.foto != "" ? (API.host + "/images/pics/" + d.foto) : 'img/avatar-default-alt.png'))+'" width="40" style=" border-radius: 50%;"></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+nombre+'</div><div class="item-after">'+stars+'</div></div><div class="item-text">'+taxs+'</div></div></a></li>';
							  }
							  else {
								markr = 'img/user-marker-2.png';
							  }
						  
                           markers[i] = new google.maps.Marker({
                                position: {
                                    lat: parseFloat(d.latitud),
                                    lng: parseFloat(d.longitud)
                                },
                                icon: {
                                    url: markr,
                                    scaledSize: new google.maps.Size(36, 53),
                                    origin: new google.maps.Point(0, 0),
                                    anchor: new google.maps.Point(0, 0)
                                },
							   map: map,
							   iw: nombre,
							   street: ((d.ciudad != null && d.ciudad != "" ? d.ciudad : "") + " " + (d.calle != null && d.calle != "" ? d.calle : "") + " " + (d.numero != null && d.numero != "" ? d.numero : "")),
							   info: JSON.stringify(d)
                            });

                            markers[i].addListener('click', function() {
								
								var info = this.info;
								var inf = JSON.parse(info);
								var query = info;
								/*if(inf.es_centro == 1) {
									query = "1&reg=" + inf.reg_password+"&centr=1";
								}*/
                                
                                infoTaxsUser = query;
                                
                                infowindow.setContent('<a href="/taxsUser/?q=1">'+this.iw + '<p>'+starsRanking(inf.puntaje) + ' <span style=" margin-top: -3px;">('+inf.cant+')</span>'+'</p>' + " <p>" + this.street + "</p>"+'</a>');
								infowindow.open(map, this);
                                
								/*
								setTimeout(function() {
									app.router.navigate({
										url: '/taxsUser/?data=' + query
									});
								}, 3000);*/
								
                            });
						  	bounds.extend(new google.maps.LatLng(parseFloat(d.latitud), parseFloat(d.longitud)));
                            i++;
                        }
                    });
					map.fitBounds(bounds);
					$$("#listProfessionalsMap").html(html);
                }
			}
		}
	},  {
		path: '/professionals/',
		url: 'professionals.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				$$("#toMap").attr("href", "/maps/");
				$$("#listSearch").html("");
                var query = app.views.main.router.currentRoute.query;
				if(typeof query.registerData != "undefined") {
                   // var list = JSON.parse(query.registerData);
                    getData(professionals);
                }
                else {
                    app.customFunctions.showIndicator();
					API.saveFilter({
						i: userInfo.reg_password,
                        filter: 1,
						lat: currentLat,
						lng: currentLng,
                        date: moment().format('YYYY-MM-DD')
					}, function (json) {
						app.customFunctions.hideIndicator();
						if(json.profesionales.length > 0) {
							professionals = json.profesionales;
						 	getData(json.profesionales);
						}
						else {
							app.dialog.alert("Sin resultados para la búsqueda del filtro.");
						}
					}, function (error) {
						app.customFunctions.hideIndicator();
						//console.log(error);
					});
                }
				
				function getData(list) {
                    var html = "";
                    var taxs = "";
                    var name = "";
					var data = "";
                    list.forEach(function(u) {
                        taxs = "";
                        u.tratamientos.forEach(function(t) {
                            taxs += t.tratamiento + ' | ';
                        });
                        if(taxs != "") {
                            taxs = taxs.substr(0, (taxs.length -2));
                        }
						name = u.nombre;
						if(typeof u.apellidos != "undefined") {
							name += " " + u.apellidos;
						}
						data = "1&reg=" + u.reg_password+"&prof=1";
						if(parseInt(u.es_centro) == 1) {
							data = "1&reg=" + u.reg_password+"&centr=1";
						}
						if(parseInt(u.agenda) > 0) {
							html += '<li> <a href=\'/taxsUser/?data='+data+'\' class="item-link item-content"> <div class="item-media"><img src="'+((u.foto != null && u.foto != "" ? (API.host + "/images/pics/" + u.foto) : 'img/avatar-default-alt.png'))+'" width="60"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+ name +'</div> <div class="item-after" style=" font-size: 12px;">'+starsRanking(u.puntaje)+' <span style="margin-top: -3px;margin-left: 2px;">('+u.cant+')</span></div> </div> <div class="item-text">'+taxs+'</div> </div> </a> </li>';
						}
                    });
                    $$("#listSearch").html(html);
                }
			}
		}
	}, {
		path: '/taxsUser/',
		url: 'taxsUser.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
				
                var query = app.views.main.router.currentRoute.query;
				if(typeof query.data != "undefined" || typeof query.q != "undefined") {
					var info = {};
					if(typeof query.centr != "undefined" || typeof query.prof != "undefined") {
						professionals.forEach(function(p) {
							if(p.reg_password == query.reg) {
								info = p;
							}
						});
					}
					else {
                        if(typeof query.q != "undefined") {
                            info = JSON.parse(infoTaxsUser);
                        }
                        else {
                            info = JSON.parse(query.data);
                        }
					}
                    
					//info = JSON.parse(query.data);
					var html = "";
					var taxs = "";
					var offer = "";
					
					var nombre = info.nombre;
					if(parseInt(info.es_profesional) > 0) {
						nombre += " " + info.apellidos;
					}
					
					$$("#nameTaxsUser").html(nombre);
                    console.log(info);
                    var centro = "";
                    if(typeof app.views.main.router.currentRoute.query.centr != "undefined") {
                        centro = "&c=1";
                    }
					$$("#rankingTaxsUser").html('<a href="/rankingUser/?u='+info.reg_password+centro+'">'+starsRanking(info.puntaje) + ' <span style=" margin-top: -3px;">('+info.cant+')</span>'+'</a>');
					$$("#locationTaxsUser").html(info.ciudad + " " + (info.calle != null ? info.calle : "") + " " + (info.numero != null ? info.numero : ""));
					
					if(typeof info.imagenes != "undefined") {
						if(info.imagenes.length > 0) {
							info.imagenes.forEach(function(p) {
								html += '<div class="swiper-slide" style="width: 100%;height:  225px;"><img src="'+(API.host + "/images/pics/" + p.foto)+'" style="width: 100%; height: 100%;"> <p style=" margin-left: 15px; font-weight: 600; font-size: 15px; margin-top: 5px;">'+p.texto+'</p></div>';
							});
						}
					}
					$$("#imagesTaxsUser").html(html);
					if(html != "") {
						var swiper = app.swiper.create('.swiperTaxsUser', {
							speed: 400,
							spaceBetween: 100
						});
						html = "";
					}
					
					if(info.tratamientos.length > 0) {
						info.tratamientos.forEach(function(t) {
							offer = "";
							if(typeof t.oferta.precio != "undefined" && t.oferta.precio != "") {
                                offer = '<p>Promoción ';
                                if(moment(t.oferta.fech_fin, "YYYY-MM-DD").isAfter(moment())) {
                                    offer = ' del: ' + moment(t.oferta.fech_ini, "YYYY-MM-DD").format("DD/MM/YYYY") + ' al ' + moment(t.oferta.fech_fin, "YYYY-MM-DD").format("DD/MM/YYYY")  + " de " + moment(t.oferta.hora_ini, "HH:mm:ss").format("HH:mm") + " a " + moment(t.oferta.hora_fin, "HH:mm:ss").format("HH:mm");
                                }
                                if(parseInt(t.oferta.dto) > 0) {
                                    offer += " / " + t.oferta.dto + '% descuento';
                                }
                                if(parseInt(t.oferta.precio) > 0) {
                                    offer += " / " + t.oferta.precio + '&#8364; /';
                                }
								offer += t.oferta.regalo + '</p>';
							}
							html += '<div style=" margin-left: 15px; margin-right: 15px;"><h3>'+t.tratamiento+'</h3><p>Descripción: '+t.explicacion+'</p><p>Precio: '+t.precio+' &#8364; Tiempo: '+t.tiempo+'</p>'+offer+' <a href="'+('/agenda/?i='+info.reg_password+'&esc='+info.es_centro+"&esp="+info.es_profesional+"&t="+t.reg)+'" class="button button-big button-raised button-fill" style=" margin-left: 15px; margin-right: 15px; margin-bottom: 25px;" >Solicitar visita</a> </div>'; //<a class="button button-big button-raised button-fill">Solicitar visita</a>
						});
						//$$("#requestVisit").attr("href", '/agenda/?i='+info.reg_password+'&esc='+info.es_centro+"&esp="+info.es_profesional);
						$$("#requestVisit").css("display", "");
					}
					else {
						$$("#requestVisit").css("display", "none");
						app.dialog.alert("El profesional no posee visitas disponibles.");
					}
					$$("#containerProfessionals").html(html);
				}
			}
		}
	}, {
		path: '/rankingUser/',
		url: 'rankingUser.html',
		on: {
			pageInit: function (e, page) {
				var userInfo = app.data('userInfo');
                var c;
                if(typeof app.views.main.router.currentRoute.query.c != "undefined") {
                    c = 1;
                }
				API.loadInfoUserRanking({
					i: app.views.main.router.currentRoute.query.u,
                    c: c
				}, function(json) {
                    var html = "";
                    var color = "";
                    json.forEach(function(u) {
                        if(parseInt(u.puntaje) >= 4) {
                            color = 'green';
                        }
                        else if(parseInt(u.puntaje) == 2 || parseInt(u.puntaje) == 3) {
                            color = 'yellow';
                        }
                        else {
                            color = 'red';     
                        }
                        html += '<li> <a href="#" class="item-link item-content"> <div class="item-media"><img src="'+((u.foto != null && u.foto != "" ? (API.host + "/images/pics/" + u.foto) : 'img/avatar-default-alt.png'))+'" width="60" style=" border: 2px solid '+color+';"></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title" style=" font-size: 14px !important;">'+moment(u.fechault, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')+" "+ u.nombre + " " + u.apellidos +'</div></div> <div class="item-text" style="overflow:  visible;max-height: none;min-height: 75px;"> '+starsRanking(u.puntaje)+' ('+u.cant+') | '+u.comentario+'</div> </div> </a> </li>';
                    });
                    $$("#listCommentsUsers").html(html);
				}, function(error) {
					//console.log(error);
				});
			}
		}
	}],
	methods: {
		alert: function (messageText) {
			app.dialog.alert(messageText);
		},
		getJSON: function (file, options, success, error) {
			app.request.getJSON(host + directory + '/' + file + '.php', options, success, error);
		}
	},
	on: {
		init: function () {
			this.dataTempLS = {
				service_explore_filters_default: {
					globalSearch: 0,
					page: 20,
					lat: 0,
					lng: 0,
					filter: {
						svc: '',
						country: 0,
						province: 0,
						rating: 0,
						hprice: 0,
						lprice: 0,
						minPrice: 0,
						maxPrice: 500,
						relevant: 0,
						lrelevant: 0,
						nearest: 1
					}
				}
			};

			this.data = function (key, info) {
				var appId = app.id;
				if (typeof key == 'undefined' && typeof info == 'undefined') {
					return Lockr.get(appId);
				} else {
					if (typeof info == 'undefined') {
						var json = Lockr.get(appId);
						return isEmpty(json) ? null : json[key];
					} else {
						var json = Lockr.get(appId);
						if (isEmpty(json)) {
							json = {};
							Lockr.set(appId, json);
						}
						json[key] = info;
						Lockr.set(appId, json);
						return info;
					}
				}
			};

			this.dataTemp = function (key, info) {
				if (typeof info == 'undefined') {
					return this.dataTempLS[key];
				} else {
					this.dataTempLS[key] = info;
					return this.dataTempLS[key];
				}
			};

			var mapReady = true;
			var countSplashDotSecuence = 0;
			var currentSplashDotNumber = 0;
			var intervalSplashDots = setInterval(function () {
				$$('.splash-dots .splash-dot').removeClass('current');
				$$('.splash-dots .splash-dot').eq(currentSplashDotNumber).addClass('current');
				currentSplashDotNumber = currentSplashDotNumber == 3 ? 0 : currentSplashDotNumber + 1;
				countSplashDotSecuence++;
				if (countSplashDotSecuence >= 6 && mapReady) {
					clearInterval(intervalSplashDots);
					app.router.navigate({
						animate: false,
						url: '/login/'
					});
				}
			}, 300);

			addScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCw69wIi6XSBIldqmZdoMnihzi-9pWvjeo&libraries=places&v=3.exp", function () {
                mapReady = true;
			});
            
            

			if (cordovaIfDefined && device.platform == "Android" && parseFloat(device.version) >= 5) {
				$$('.framework7-root').css({
					marginTop: '24px',
					height: 'calc(100% - 24px)'
				});

				$$('body').css('backgroundColor', '#0096a4');
				StatusBar.styleDefault();
				StatusBar.styleBlackOpaque();
				
				setTimeout(function () {
					StatusBar.styleBlackOpaque();
				}, 300);
				setTimeout(function () {
					StatusBar.styleBlackOpaque();
				}, 1000);
				setTimeout(function () {
					StatusBar.styleBlackOpaque();
				}, 500);
				setTimeout(function () {
					StatusBar.styleBlackOpaque();
				}, 1000);
			}

			$$('.panel-left .list .item-content.panel-close').click(function () {
				var btn = this;
				var ds = btn.dataset;
				if (ds.href == '/home/' && (app.views.main.history.lastIndexOf("/home/") + 1 == app.views.main.history.length - 1)) {
					app.router.back('/home/', {
						ignoreCache: false,
						clearPreviousHistory: true
					});
				} else if (ds.href == '/logout/') {
					logout();
				} else {
					app.router.navigate(ds.href);
				}
			});
			
			if (cordovaIfDefined) {
                platform = device.platform.toLowerCase();
				pictureSource = navigator.camera.PictureSourceType;
				destinationType = navigator.camera.DestinationType;
			}
			
			$$(document).on("click", ".sortable-action", function(e) {
                if($$(".sortable").hasClass("sortable-enabled")) {
                    $$(".navbar").trigger("click");
                }
                else {
                    app.sortable.enable(".sortable");
                    $$(".sortable-action").css("display", "none");
                }
            });
                
			$$(document).on("click", "#login-check-access", function() {
				var email = $$("#email").val();
				var password = $$("#password").val();
				document.getElementById('email').checkValidity();
				document.getElementById('password').checkValidity();
				if (!isEmpty(email) && !isEmpty(password)) {
					$$('#login-check-access').addClass('logining');
					API.auth({
						e: email,
						p: password,
						id_movil: id_movil,
						lat: currentLat,
						lng: currentLng,
						f: 0,
                        platform: platform
					}, function (json) {
						$$('#login-check-access').removeClass('logining');
						if (json.msg == "OK") {
							json.info.password = password;
							app.data('userInfo', json.info);
							if(parseInt(json.info.usuario) > 0) {
								/*if(typeof json.info.filtro.reg_ficha != "undefined") {
									app.router.navigate({
										url: '/filtro/'
									});
								}
								else {
									if(typeof json.info.nombre == "undefined") {
										app.router.navigate({
											url: '/my-account/'
										});
									}
									else {
										app.router.navigate({
											url: '/filtro/'
										});
									}
								}*/

								app.router.navigate({
									url: '/home/'
								});

							}
							else if(parseInt(json.info.profesional) > 0) {
								if(typeof json.info.nombre == "undefined") {
									app.router.navigate({
										url: '/my-account/'
									});
								}
								else {
									app.router.navigate({
										url: '/agenda/'
									});
								}
							}
							else if(parseInt(json.info.centrodesalud) > 0) {
								app.router.navigate({
									url: '/home-center/'
								});
							}
						} else {
							app.dialog.alert(json.msg);
						}
					}, function (error) {
						$$('#login-check-access').removeClass('logining');
						//console.log(error);
					});
				}
				else {
					app.dialog.alert("Debe ingresar su usuario y contraseña.");
				}
			});
			
			$$(document).on("click", "#login-check-access-fingerprint", function() {
				var email = $$("#email").val();
				var password = $$("#password").val();
				document.getElementById('email').checkValidity();
				document.getElementById('password').checkValidity();
				if (!isEmpty(email) && !isEmpty(password)) {
					app.customFunctions.showIndicator();
					API.auth({
						e: email,
						p: password,
						id_movil: id_movil,
						lat: currentLat,
						lng: currentLng,
						f: 0,
                        platform: platform
					}, function (json) {
						app.customFunctions.hideIndicator();
						if (json.msg == "OK") {
							json.info.password = password;
							json.info["huellas"] = 0;
							app.data('userInfo', json.info);
							app.router.navigate({
								url: '/fingerprint/'
							});
						} else {
							app.dialog.alert("Por favor tiene que registrase primero en el sistema, después podrá utilizar el registro de la huella");
						}
					}, function (error) {
						app.customFunctions.hideIndicator();
					});
				}
				else {
					app.dialog.alert("Debe ingresar su usuario y contraseña.");
				}
			});
			
			$$(document).on("keyup", "#checkCode", function() {
				var query = app.views.main.router.currentRoute.query;
				
				var name = "";
				var lastName = "";
				var phone2 = "";
				var dni = "";
                
                var em = "";
				
				if(typeof query.update != "undefined") {
					query.registerData = JSON.parse(query.update);
                    if(typeof query.registerData.e != "undefined") {
                        em = query.registerData.email;
                    }
				}
				
				if(typeof query.registerData.name != "undefined") {
					name = query.registerData.name;
					lastName = query.registerData.lastName;
					phone2 = query.registerData.phone2;
					dni = query.registerData.dni;
					//query.registerData = JSON.parse(query.registerData);
				}
                
                if($$("#checkCode").val().length == 6) {
                    var a = moment(dateConfirm, 'YYYY-MM-DD HH:mm:ss');
                    var b = moment(moment());
                    if(a.diff(b, 'minutes') <= 10) {
                        if($$("#checkCode").val() == codeConfirm) {
                            if(typeof query.update != "undefined") {
                                var userInfo = app.data('userInfo');
                                var url = API.host + '/api/operaciones-pruebas.php';
                                app.customFunctions.showIndicator();
                                var acept = "[]";
                                if(typeof query.registerData.acept != "undefined") {
                                    acept = "[1,1]";
                                }
                                app.request.post(url, {
                                    op: 9,
                                    i: userInfo.reg_password,
                                    img: imgMyAccount,
                                    name: name,
                                    lastName: lastName,
                                    code: query.registerData.code,
                                    phone: query.registerData.phone,
                                    phone2: phone2,
                                    dni: dni,
                                    picGallery: picGallery,
                                    acept: acept
                                }, function (json) {
                                    json = JSON.parse(json);
                                    app.customFunctions.hideIndicator();
                                    userInfo = app.data('userInfo');
                                    //console.log(userInfo);
                                    json.info.password = userInfo.password;
                                    if(imgMyAccount != null) {
                                        $$("#imgUser").attr("src", "data:image/png;base64," + imgMyAccount);
                                    }
                                    if(picGallery != null) {
                                        $$("#imgUser").attr("src", $$("#currentPicProfile").attr("src"));
                                    }
                                    $$("#username").html($$("#my-account-name").val() + " " + $$("#my-account-last-name").val());
                                    imgMyAccount = null;
                                    app.data('userInfo', json.info);
                                    userInfo = app.data('userInfo');							
                                    app.dialog.alert("Información actualizada correctamente.");
                                    if(userInfo.usuario > 0) {
                                        app.router.navigate({
                                            url: '/filtro/'
                                        });
                                    }
                                    else {
                                        app.router.navigate({
                                            url: '/complement/'
                                        });
                                    }
                                }, function() {
                                    app.customFunctions.hideIndicator();
                                });
                            }
                            else {
                                API.saveUser({
                                    d: dateConfirm,
                                    info: JSON.stringify(query.registerData),
                                    lat: currentLat,
                                    lng: currentLng
                                }, function(json) {
                                    //console.log(json.info);
                                    logout();
                                    app.dialog.alert("Usuario registrado exitosamente.");
                                    /*app.router.navigate({
                                        url: '/login/'
                                    });*/
                                    /*
                                    json.info.password = query.registerData.password;
                                    app.data('userInfo', json.info);
                                    if(parseInt(json.info.centrodesalud) > 0) {
                                        app.router.navigate({
                                            url: '/center-profile/'
                                        });
                                    }
                                    else {
                                        app.router.navigate({
                                            url: '/my-account/'
                                        });
                                    }*/
                                }, function(error) {
                                    app.customFunctions.hideIndicator();
                                    //console.log(error);
                                });
                            }
                        }
                        else {
                            app.dialog.alert("Código incorrecto.");
                        }
                    }
                    else {
                        app.dialog.alert("El código ha expirado o no es el correcto, solicite enviarlo de nuevo.");
                    }
                }
			});
			
			$$(document).on("click", ".message-image", function() {
				var img = $$(this).find('img');
				
				var myPhotoBrowserStandalone = app.photoBrowser.create({
					photos : [
						$$(img).attr("src")
					],
					theme: 'dark'
				});
				myPhotoBrowserStandalone.open();
			});
			
			$$(document).on("click", ".page[data-name=professionals-center]", function() {
				//console.log(this);
                /*var divider = false;
                $$(".sortable li").each(function(index, value) {
                    if($$($$(this)[0]).hasClass("item-divider")) {
                        divider = true;
                    }
                });
                console.log(divider);
                if(divider) {
                   $$("li").removeClass("item-divider");
                    $$("#containerOtherOptions").hide();
                    $$("#containerFirstOption").css("display", "flex");
                    picSelected = null;
               }*/
                
                if($$(".sortable").hasClass("sortable-enabled")) {
                    app.sortable.disable(".sortable");

                    var sort = [];
                    $$(".selectProfessional").each(function(index, value) {
                        sort.push({
                            id: $$(this).attr("data-id"),
                            index: (index+1)
                        });
                    });

                    API.saveOrderProfessionals({
                        ids: JSON.stringify(sort)
                    }, function(json) {
                        //console.log(json);
                    }, function(error) {
                        //console.log(error);
                    });
                }
				
			});

			$$(document).on('click', '.page-current .panel-toggle', function () {
				$$(".menus").css("display", "none");
				var userInfo = app.data('userInfo');
				if(parseInt(userInfo.reg_password) == 0 || parseInt(userInfo.usuario) > 0) {
					$$("#menuPacientes").css("display", "");
				}
				else {
					if(parseInt(userInfo.profesional) > 0) {
						$$("#menuProfesionales").css("display", "");
					}
					if(parseInt(userInfo.centrodesalud) > 0) {
						$$("#menuCentro").css("display", "");
					}
				}
				
				if (app.panel.left.opened) {
					app.panel.left.close();
				} else {
					app.panel.left.open();
				}
			});
			
			$$(document).on('change', 'input[type=checkbox][name=actionsQuoteProfessional]', function() {
				switch(parseInt(this.value)) {
					case 1:
						app.router.navigate({
							url: '/request-agenda-user/?i='+app.views.main.router.currentRoute.query.i+'&h='+app.views.main.router.currentRoute.query.h+'&d='+app.views.main.router.currentRoute.query.d
						});
						break;
					case 2:
						app.dialog.confirm('Esta seguro que desea bloquear la hora seleccionada?', function () {
							app.customFunctions.showIndicator();
							API.lockQuote({
								i: app.views.main.router.currentRoute.query.d,
								r: app.views.main.router.currentRoute.query.i,
								h: app.views.main.router.currentRoute.query.h,
								d: moment().format('YYYY-MM-DD'),
								reg: app.views.main.router.currentRoute.query.reg,
								l: 2
							}, function (json) {
								app.router.back();
								setTimeout(function() {
									app.views.main.router.refreshPage();
								}, 500);
								app.customFunctions.hideIndicator();
							}, function (error) {
								app.customFunctions.hideIndicator();
								////console.log(error);
							});
						}, function() {
							
						});
						break;
					case 3:
						app.dialog.confirm('Esta seguro que desea bloquear todas las horas del dia seleccionado?', function () {
							app.customFunctions.showIndicator();
							API.lockQuote({
								i: app.views.main.router.currentRoute.query.d,
								r: app.views.main.router.currentRoute.query.i,
								h: app.views.main.router.currentRoute.query.h,
								d: moment().format('YYYY-MM-DD'),
								reg: app.views.main.router.currentRoute.query.reg,
								l: 1
							}, function (json) {
								app.router.back();
								setTimeout(function() {
									app.views.main.router.refreshPage();
								}, 500);
								app.customFunctions.hideIndicator();
							}, function (error) {
								app.customFunctions.hideIndicator();
								////console.log(error);
							});
						}, function() {
							
						});
						break;
				}
				$$("input[type=checkbox][name=actionsQuoteProfessional]:checked").prop("checked", false);
			});

			$$(document).on('keypress', '.form-wrapper input', function (e) {				
				var $$input = $$(this);
				var $$form = $$input.closest('.form-wrapper');				
				if(e.keyCode == 13) {
					$$form.find('#login-check-access').click();
					$$input.blur();
				}
			});
            
            if(screen.availHeight > 480) {
                window.addEventListener('native.keyboardshow', function (e) {
                    var $$pg = app.views.main.$el.find('.page-current .page-content');
                    var h = e.keyboardHeight;

                    if($$pg.hasClass('messages-content')) {
                        $$(".md .toolbar-bottom-md, .md .messagebar").css({
                            bottom: h + 'px'
                        });

                        $$pg.css({
                            maxHeight: (screen.availHeight - h) - 16 + 'px',
                            height: (screen.availHeight - h) - 16 + 'px'
                        });
                        $$pg.scrollTo(0, $$pg[0].scrollHeight);
                    }
                    else {
                        var nh = screen.availHeight - h;
                        //console.log('nh: ', nh);
                        (function($$pg, h) {
                            $$pg.css({
                                maxHeight: h + 'px',
                                overflowY: 'auto'
                            });
                            scrollToActiveElement();
                            //console.log('h: ', h);
                        })($$pg, nh);
                    }
                    
                    if(app.views.main.router.currentRoute.path == "/request-agenda/") {
                        $$pg.css({
                            maxHeight: (screen.availHeight - h) - 50 + 'px',
                            height: (screen.availHeight - h) - 50 + 'px'
                        });
                        $$pg.scrollTo(0, $$pg[0].scrollHeight);
                    }
                    
                });

                window.addEventListener('native.keyboardhide', function (e) {
                    var $$pg = app.views.main.$el.find('.page-current .page-content');

                    if($$pg.hasClass('messages-content')) {
                        $$(".md .toolbar-bottom-md, .md .messagebar").css({
                            bottom: '0px'
                        });
                        $$pg.css({
                            maxHeight: screen.availHeight + 'px',
                            height: screen.availHeight + 'px'
                        });
                    }
                    else {
                        (function($$pg) {
                            $$pg.css({
                                maxHeight: '',
                                overflowY: ''
                            });
                        })($$pg);
                    }
                    
                    if(app.views.main.router.currentRoute.path == "/request-agenda/") {
                        $$pg.css({
                            maxHeight: screen.availHeight + 'px',
                            height: screen.availHeight + 'px'
                        });
                    }
                    
                });
            }

			////console.log('App initialized');
		},
		pageInit: function (e) {
			////console.log('Page initialized: ', e.name);

			$$('.toggle-menu').html('\
				<span class="hamburger-box">\
					<span class="hamburger-inner"></span>\
				</span></a>\
			');

			$$('.toggle-menu').addClass('hamburger hamburger--slider');

			setTimeout(function () {
				$$('.page-current .page-content').css({
					maxHeight: screen.availHeight + parseInt($$('.framework7-root').css('margin-top')) + 'px',
					overflowY: 'auto'
				});

				setTimeout(function () {
					if ($$('.page-current .panel-toggle').length == 0) {
						app.panel.disableSwipe();
					} else {
						app.panel.enableSwipe();
					}
				}, 600);
			}, 400);
		}
	}
}).on('popupOpened', function (popup) {
	
}).on('routeChanged', function (newRoute, previousRoute, router) {
    if(app.views.main.router.currentRoute.path != "/location/" && app.views.main.router.currentRoute.path != "/request-agenda-user/" && app.views.main.router.currentRoute.path != "/my-account/" && app.views.main.router.currentRoute.path != "/complement/") {
        app.views.main.router.refreshPage();
    }
}).on('searchbarEnable', function (searchbar) {
	if (searchbar.$el.hasClass('searchbar-services')) {
		app.popup.open('.popup-home-service-search').$backdropEl.hide();
	}
}).on('searchbarDisable', function (searchbar) {
	if (searchbar.$el.hasClass('searchbar-services')) {
		app.popup.close('.popup-home-service-search');
	}
}).on('smartSelectOpen', function (smartSelect) {
	smartSelect.$containerEl.find('.navbar a.link.popup-close').html('<i class="fal fa-arrow-left"></i>');
}).on('panelOpen', function (panel) {
	$$('.toggle-menu').addClass('is-active');
}).on('panelClose', function (panel) {
	$$('.toggle-menu').removeClass('is-active');
}).on('pickerOpen', function (picker) {
	if (picker.$el.hasClass('sheet-choose-location')) {
		$$('.sheet-choose-location-backdrop').addClass('backdrop-in');
		$$('.sheet-choose-location').addClass('sheet-choose-location-in');
	}
}).on('pickerClose', function (picker) {
	if (picker.$el.hasClass('sheet-choose-location')) {
		$$('.sheet-choose-location-backdrop').removeClass('backdrop-in');
		$$('.sheet-choose-location').removeClass('sheet-choose-location-in').addClass('sheet-choose-location-out');
	}
}).on('lazyError', function (img) {
	img.src = 'data:image/png;base64,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';
}).on('formAjaxSuccess', function (formEl, data, xhr) {
	data = JSON.parse(xhr.response);
	//console.log(data);
	if(data.page == "chat") {
		messagesChat.addMessage({
			text: ('<div class="message-archive-content"><a href="javascript: window.location.assign(\''+API.host+'/files/'+data.archivo+'\');"><i class="fas fa fa-file-alt"></i> '+data.archivo+'</a></div>'),
			type: 'sent',
			textFooter: data.fecha
		});
		$$(".page[data-name=chat] .messages-content").scrollTo(0, $$(".page[data-name=chat] .messages-content")[0].scrollHeight);
	}
	else {
		/*if(data.msg == "OK") {
			addBudgets(data.presupuestos);
			app.preloader.hide();
		}*/
	}
	app.customFunctions.hideIndicator();
});

var taxsArr = [];
var firstTax = true;
function getTaxs() {
	app.customFunctions.showIndicator();
	var userInfo = app.data('userInfo');
	
	API.loadTaxs({
		i: userInfo.reg_password
	}, function (json) {
		
		var html = '<option value="0">Tratamiento</option>';
		if(json.tratamientos.length > 0) {
			taxsArr = json.tratamientos;
			json.tratamientos.forEach(function(t) {
				html += '<option value="'+t.reg+'">'+t.tratamiento+'</option>';
			});
		}
		
		app.customFunctions.hideIndicator();
		
		if(firstTax) {
			$$("#tratamientosTarifas").html(html);
			firstTax = false;
			
			$$("#tratamientosTarifas").change(function() {
				var value = this.value;
				if(value > 0) {
					var band = true;
					taxsArr.forEach(function(t) {
						if(t.reg == value) {
							if(typeof t.info.explicacion != "undefined") {
								$$("#tratamientosTarifas").val(t.info.reg_tratamientos);
								$$("#descripcionTax").val(t.info.explicacion);
								$$("#priceTax").val(t.info.precio);
								$$("#timeTax").val(t.info.tiempo);

								if(t.info.oferta > 0) {
									//$$("#offert").click();
									$$("#offert").prop("checked", true);
								}

								$$("#deleteTaxs").css("display", "");
								$$("#saveTaxs").html("Alta-Modif");
								band = false;
							}
							else {
								$$("#saveTaxs").html("Alta");
							}
						}
					});
					if(band) {
						$$("#descripcionTax").val("");
						$$("#priceTax").val("");
						$$("#timeTax").val("");
						$$("#deleteTaxs").css("display", "none");
						$$("#offert").prop("checked", false);
						$$("#saveTaxs").html("Alta");
					}
				}
				else {
					$$("#descripcionTax").val("");
					$$("#priceTax").val("");
					$$("#timeTax").val("");
					$$("#deleteTaxs").css("display", "none");
					$$("#offert").prop("checked", false);
					$$("#saveTaxs").html("Alta");
				}
			});
		}				
	}, function (error) {
		//console.log(error);
	});
}

var picGallery = null;
function selectPic(element) {
	var pic = $$(element).attr("data-pic");
	picGallery = $$(element).attr("data-id");
	$$("#currentPicProfile").attr("src", API.host + "/images/pics/" + pic);
	app.popup.close('.popup-gallery');
}

app.customFunctions = {
	showIndicator: function(params) {
		var params = params || {};
		app.preloader.show();
		$$('.preloader-modal').html('<div style="width: 36px; height: 30px; display: flex; justify-content: center; align-items: center; "><div class="loading-indicator"></div></div>');
		if(!isEmpty(params)) {
			var style = {
				opacity: 1,
				height: '100%'
			};
			if(params.hasOwnProperty('bgColor')) {
				style.backgroundColor = params.bgColor;
			}
			if(params.hasOwnProperty('offsetTop')) {
				style.maxHeight = 'calc(100% - ' + params.offsetTop + 'px)';
				style.marginTop = params.offsetTop + 'px';
			}
			$$('.preloader-backdrop').css({
				opacity: 1
			}).append('<div class="preloader-backdrop-inner"></div>').find('.preloader-backdrop-inner').css(style);			
			if(params.hasOwnProperty('cb')) {
				params.cb();
			}
		}
	},
	hideIndicator: function(params) {
		var params = params || {};
		app.preloader.hide();
		$$('.preloader-backdrop').css({
			opacity: 0
		}).remove('.preloader-backdrop-inner');
		if(params.hasOwnProperty('cb')) {
			params.cb();
		}
	}
};

function goToBack() {
    var refresh = false;
	if(!push) {
        if ($$(".dialog-buttons-1").hasClass("modal-in")) {
            app.dialog.close();
        }
        else if ($$('.panel-left').hasClass('panel-active')) {
            app.panel.close();
        } else if ($$('.sheet-modal').hasClass('modal-in')) {
            app.sheet.close('.sheet-modal');
        } else if ($$('.popup-map').hasClass('modal-in') || $$('.popup').hasClass('modal-in')) {
            app.popup.close();
        } else if ($$('.popover-gallery').hasClass('modal-in')) {
            app.popover.close();
        } else if ($$('.request-budget-sheet').hasClass('fab-morph-target-visible')) {
            $$('.request-budget-sheet .fab-close').trigger("click");
        } else if($$('.preloader-modal .loading-indicator').length > 0) {
            app.customFunctions.hideIndicator();
        } else if(app.views.main.router.currentRoute.path == "/filtro/") {
			if(typeof app.views.main.router.currentRoute.query.page != "undefined") {
				app.router.back();
                refresh = true;
			}
			else {
				app.router.navigate({
					url: '/home/'
				});
			}
		}
		else {
			if((app.views.main.router.currentRoute.path == "/agenda/" && typeof app.views.main.router.currentRoute.query.i != "undefined") || app.views.main.router.currentRoute.path == "/agenda/" || app.views.main.router.currentRoute.path == "/actionsQuote/") {
				app.router.back();
				//if(!fb) {
					refresh = true;
				//}
			}
			else {
				if (["/home/", "/login/", "/agenda/", "/home-center/"].indexOf(app.views.main.router.url) != -1) {
					var query = app.views.main.router.currentRoute.query;
					if(typeof query.i != "undefined") {
						app.router.back();
						if(app.views.main.router.currentRoute.path == "/planning-center/") {
							if(!fb) {
								refresh = true;
							}
						}
						else if(app.views.main.router.currentRoute.path == "/agenda/") {
							refresh = true;
						}
					}
					else {
						window.plugins.appMinimize.minimize();
					}
				} else {
                    var band = true;
                    /*if(app.views.main.router.currentRoute.path == "/location/") {
                       if(app.views.main.router.history[app.views.main.router.history.length-2].indexOf("request-agenda-user") >= 0) {
                           app.router.back({
                               ignoreCache: false
                           });
                       }
                    }
					if(band) {*/
                        app.router.back();
                    //}
					if(app.views.main.router.currentRoute.path == "/home-center/" || app.views.main.router.currentRoute.path == "/planning-center/" || app.views.main.router.currentRoute.path == "/pics/" || app.views.main.router.currentRoute.path == "/personal/" || app.views.main.router.currentRoute.path == "/professionals/" || app.views.main.router.currentRoute.path == "/home/") {
						if(!fb) {
							refresh = true;
						}
					}
				}
			}
		}
	}
	else {
		backChat();
	}
    /*if(refresh) {
        setTimeout(function() {
            app.views.main.router.refreshPage();
        }, 1000);
    }*/
}

document.addEventListener("backbutton", function () {
	goToBack();
}, false);

document.addEventListener("deviceready", function () {
	pushE = PushNotification.init({
		android: {
		},
		ios: {
			alert: "true",
			badge: "true",
			sound: "true"
		},
		windows: {}
	});

	pushE.on('registration', (data) => {
		id_movil = data.registrationId;
	});

	pushE.on('notification', (data) => {
		// data.message,
		// data.title,
		// data.count,
		// data.sound,
		// data.image,
		// data.additionalData
		
		app.dialog.alert(data.message);
	});

	pushE.on('error', (e) => {
		// e.message
	});
});

window.addEventListener("resize", function () {
	setTimeout(scrollToActiveElement, 200);
	setTimeout(scrollToActiveElement, 1000);

	if (app.views.main.router.currentRoute.path == "/home/") {
		$$('#categories .category-item').css({
			height: ((screen.availWidth / 3) - 10) + 'px',
			width: ((screen.availWidth / 3) - 10) + 'px',
			marginBottom: '5px'
		});
	}
});