/* Author: Iván Cruces

*/
var $utils = {
  /**
   * Get url parameters
   */
  getURLParameter: function (name) {
    return decodeURI(
      (RegExp(name + "=" + "(.+?)(&|$)").exec(location.search) || [, null])[1]
    );
  },
};

var $carrusel = {
  config: {
    urlJSON: "data/carrusel.json",
    imgPath: "img/carrusel/",
  },

  init: function (config) {
    $.extend(this.config, config);
    this.loadJSON();
  },

  loadJSON: function () {
    $.getJSON(this.config.urlJSON, function (data) {
      $carrusel.loadCarrusel(data);
    });
  },

  loadCarrusel: function (data) {
    var carrusel = $("#content ul");
    for (var i = 0; i < data.length; i++) {
      carrusel.append(
        '<li><p><a href="galerias.html?id=' +
          data[i].galeria.replace(/\s/g, "_") +
          '"><img src="' +
          $carrusel.config.imgPath +
          data[i].fichero +
          '.jpg"></a></p><p><a class="transparent" href="galerias.html?id=' +
          data[i].galeria.replace(/\s/g, "_") +
          '">' +
          data[i].galeria +
          "</a></p>"
      );
    }
  },
};

var $gallery = {
  config: {
    //Default configuration
    width: 698,
    height: 525,
    transition: isIE() ? "none" : "fade",
    transitionSpeed: 500,
    maxScaleRatio: 1,
    minScaleRatio: 1,
    clicknext: true,
    showImagenav: false,
    urlJSON: "data/galerias.json",
    galleryDOMId: "gallery",
    imgPath: "img/",
    galleryId: null,
    isPortfolio: false,
    playTimeOut: 4, //seconds
  },

  init: function (config) {
    $.extend(this.config, config);
    this.loadJSON();
  },

  loadJSON: function () {
    $.getJSON(this.config.urlJSON, function (data) {
      if ($gallery.loadGallery(data) == -1) $carrusel.init();
      //$gallery.loadNav(data);
      $gallery.setSelectedGallery();
    });
  },

  loadGallery: function (data) {
    var galleryId = $utils.getURLParameter("id");
    if (galleryId == "null") {
      // select first gallery
      var firstGallery = $("#sidebar-menu ul > li:first").text();
      galleryId = firstGallery;
      // load portfolio
      // galleryId = data[0].nombre.replace(/\s/g, "_");
      // $gallery.config.isPortfolio = true;
    }

    // select gallery in DOM
    $("#" + galleryId).addClass("is-active");

    $gallery.config.galleryId = galleryId;
    Galleria.loadTheme("js/themes/classic/galleria.classic.min.js");
    this.keyControls();
    var gallery;

    //Search gallery
    for (var i = 0; i < data.length; i++) {
      if (data[i].nombre.replace(/\s/g, "_") == galleryId) {
        gallery = data[i];
        break;
      }
    }

    if (gallery == null) {
      window.location.replace("galerias.html");
      return;
    }

    //Load Gallery in DOM
    for (var i = 0; i < gallery.fotos.length; i++) {
      $("#" + $gallery.config.galleryDOMId).append(
        '<img src="' +
          $gallery.config.imgPath +
          gallery.nombre +
          "/" +
          gallery.fotos[i].fichero +
          '.jpg" >'
      );
    }
    //Init Gallery plugin
    $("#" + $gallery.config.galleryDOMId).galleria({
      width: $gallery.config.width,
      height: $gallery.config.height,
      transition: $gallery.config.transition,
      transitionSpeed: $gallery.config.transitionSpeed,
      maxScaleRatio: $gallery.config.maxScaleRatio,
      minScaleRatio: $gallery.config.minScaleRatio,
      clicknext: $gallery.config.clicknext,
      showImagenav: $gallery.config.showImagenav,
      thumbnails: false,
      showCounter: false,
    });
    var playOff = !$gallery.config.isPortfolio;
    //Load gallery title
    $("#photo-nav span#nav-title").html(gallery.nombre);

    //Load gallery text
    // $('#content #info-gallery').html(gallery.texto);

    //Load events
    Galleria.get(0).bind("loadstart", function (e) {
      //Load title of the image loaded
      $("#photo-info #photo-title").html(gallery.fotos[e.index].texto);
      //Update counter
      $("#photo-nav #photo-counter").html(
        "(" + (e.index + 1) + "/" + gallery.fotos.length + ")"
      );
      //Show gallery controls
      //$('#photo-nav #img-next').show();
      //$('#photo-nav #img-prev').show();
      //Hack to fix the thumbnails click problem
      if (!playOff) {
        Galleria.get(0).play($gallery.config.playTimeOut * 1000);
        $("#play-button").addClass("play-button-enabled");
      }
    });
    //Gallery navigation controls
    $("#photo-nav span#img-prev").click(function () {
      Galleria.get(0).prev();
    });
    $("#photo-nav span#img-next").click(function () {
      Galleria.get(0).next();
    });
    //Gallery thumb control
    /*var visible = false;
		
		$('#thumb-button').click(function(){
			if (visible){				
				$('.galleria-thumbnails-container').hide();
				$(this).addClass('thumb-button-disabled');
				$(this).removeClass('thumb-button-enabled');
				visible=false;	
			}else{
				$('.galleria-thumbnails-container').show();
				$('.galleria-thumbnails-container').css({'opacity':1});
				$(this).addClass('thumb-button-enabled');
				$(this).removeClass('thumb-button-disabled');
				visible=true;
			}			
		});	*/
    //Gallery play button
    $("#play-button").click(function () {
      if (playOff) {
        Galleria.get(0).play($gallery.config.playTimeOut * 1000);
        $(this).addClass("play-button-enabled");
        $(this).removeClass("play-button-disabled");
        playOff = false;
      } else {
        Galleria.get(0).pause();
        $(this).addClass("play-button-disabled");
        $(this).removeClass("play-button-enabled");
        playOff = true;
      }
    });

    // gallery text button
    var textPath = "img/" + galleryId + "/texto.jpg";
    // check if display info button
    var textImg = new Image();
    var elemTextImg = document.getElementById("gallery-text-img");
    textImg.onload = function () {
      var galleryTextButton = $("#gallery-text-button");
      galleryTextButton.show();
      galleryTextButton.click(function () {
        $("#gallery-text").toggle();
        $(this).toggleClass("is-active");
      });
      elemTextImg.src = this.src;
    };
    textImg.src = textPath;
  },

  /*loadNav: function(data){
		$('#header-menu').append("<ul>");
		var nav	= $('#header-menu ul');	
		var classSelected = '';
		for (var i=0; i<data.length; i++){
			if (!data[i].padre){
				if (data[i].nombre.replace(/\s/g, "_") == $gallery.config.galleryId)
					classSelected = 'class="gallery-selected"';		
				else
					classSelected = '';		
				if (data[i].fotos)
					nav.append('<li id="' + data[i].nombre +'"><a ' + classSelected  + ' href="galerias.html?id=' + data[i].nombre.replace(/\s/g, "_") + '">' + data[i].nombre + '</a><ul>');
				else
					nav.append('<li id="' + data[i].nombre +'" class="parent-gallery">' + data[i].nombre + '<ul>');
			}else{			
				if (data[i].nombre.replace(/\s/g, "_") == $gallery.config.galleryId){						
					classSelected = 'class="gallery-selected"';	
					//select parent too				
					$('#header-menu ul li#' + data[i].padre).addClass('gallery-selected');						
				}else
					classSelected = '';					
				$('#header-menu ul li#' + data[i].padre + ' ul').append('<li><a ' + classSelected  + ' href="galerias.html?id=' + data[i].nombre.replace(/\s/g, "_") + '">' + data[i].nombre);
			}				
		}	
	},*/

  /*loadNav: function(data){
		$('#sidebar-menu').append("<ul>");
		var nav	= $('#sidebar-menu ul');	
		var classSelected = '';
		for (var i=0; i<data.length; i++){			
			if (data[i].nombre.replace(/\s/g, "_") == $gallery.config.galleryId)
				classSelected = 'class="gallery-selected"';		
			else
				classSelected = '';	
			
			nav.append('<li id="' + data[i].nombre +'"><a ' + classSelected  + ' href="galerias.html?id=' + data[i].nombre.replace(/\s/g, "_") + '">' + data[i].nombre + '</a><ul>');
				
		}	
	},*/

  setSelectedGallery: function () {
    var galleryId = $gallery.config.galleryId;
    var nav = $("#" + galleryId + " a");
    nav.addClass("gallery-selected");
  },

  //Keyboard events
  keyControls: function () {
    var idle = false;
    var t;
    //timeout to fix no image when next/prev is executed too fast
    timeoutevent = function () {
      idle = false;
    };
    $("html").keydown(function (event) {
      if (!idle) {
        if (event.keyCode == 37) {
          Galleria.get(0).prev();
          idle = true;
          t = setTimeout("timeoutevent()", 100);
        } else if (event.keyCode == 39) {
          Galleria.get(0).next();
          idle = true;
          t = setTimeout("timeoutevent()", 100);
        }
      }
    });
  },
};

function isIE() {
  var rv = false;
  if (navigator.appName == "Microsoft Internet Explorer") {
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
  } else if (navigator.appName == "Netscape") {
    var ua = navigator.userAgent;
    var re = new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
  }
  return rv;
}

/**
 * Main JQuery function
 */
$(document).ready(function () {
  $gallery.init();
});
