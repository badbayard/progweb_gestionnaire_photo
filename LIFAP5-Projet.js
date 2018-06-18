/* global downloadPromise uploadPromise resetPromise updatePromise */
/* see http://eslint.org/docs/rules/no-undef */

/************************************************************** */
/* constants */
/************************************************************** */






const base_url = "http://134.214.200.137/index.php/photos/";
const base_img = "http://134.214.200.137/images/";

const all_albums_id = "all-albums";
const album_prefix_id = "album-";


/************************************************************** */
/* event managers */
/************************************************************** */
/* albums_onclick */
let albums_onclick = state => id => {
  console.log("albums_onclick(", id, ")" );

  $("#" + id).toggleClass("active");

  return state; 
}
/************************************************************** */
/** MAIN PROGRAM */

let affiche_photo = function(photo) {  //Affichage de la photo lorsqu'on clique dessus, on créer une fonction  pour chaque photo
	return function() {
		let sourcephoto=`<img src=${base_img+photo._id.$id+"/"+photo.name} class="img-responsive" alt="${photo.name}">
							<h4>${photo.name}</h4>
							<span class="text-muted">${photo.name}</span><br>
							<span class="text-muted">${photo.albums}</span><br>
							<button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#photoModal">Edit</button>
							<div id="photoModal" class="modal fade" role="dialog">
	            				<div class="modal-dialog">
						        	<div class="modal-content">
						                <div class="modal-header">
						                  	<button type="button" class="close" data-dismiss="modal">×</button>
						                 	<h4 class="modal-title">Edit photo ${photo.name}</h4>
						                </div>
						                <div class="modal-body">
						                  <div class="form-group">
						                    <label for="new-desc">Description:</label>
						                    <input class="form-control" id="new-desc" value="${photo.name}" type="text">
						                  </div>
						                  <div class="form-group">
						                    <label for="new-name">Albums:</label>
						                    <input class="form-control" id="new-albums" value="${photo.albums}" type="text">
						                  </div>
						                </div>
						                <div class="modal-footer">
						                  <button id="photo-edit" type="button" class="btn btn-default"  data-dismiss="modal">Update</button>
						                </div>
						            </div>
						        </div>
						    </div> `
		document.getElementById("panel-photo").innerHTML=sourcephoto; //On place la photo

		$("#photo-edit").click(function() { //Mise en place de la fonction d'édition de la photo
			//get values from the modal modal box	
			let desc = $("#new-desc").val();
			let albums = new Array ();
			$("#new-albums").val().split(",").map(x=>albums.push(x));
			console.log(desc, albums);
			photo.desc=desc;
			photo.albums=albums;
			console.log(photo);
			//update then reload based on new collection
			updatePromise(base_url,photo)
			  .catch(reason => console.error(reason));
});
	};
}

let changeTaille = function(coll,id){ //Fonction pour réafficher la galerie avec un nouveau nombre d'élément
	return function(){
		collec = filtredate(coll,id)();
	};
};

let filtretableau = function(coll,tag,id){ //Fonction de filtrage du tableau en fonction des tags sélectionné
	let collection=new Array();
	for (let i=0;i<coll.length;i++)
	{
		for (let j=0;j<coll[i].albums.length;j++)
		{
			if (coll[i].albums[j]==tag)
			{
				collection.push(coll[i]);
			}
		}
		
	}
	galerie(collection,id);
};

function tri(a,b) //Fonction de trie par date, les dates undefini sont placé à la fin
{
	if ((a.date==undefined)||(b.date==undefined)){return -1;}
return (a.date > b.date)?1:-1;
}

let filtredate = function(coll,id){ //Fonction de filtrage par date, récupere toute la collection a chaque execution
	return function(){
		downloadPromise(base_url)
	.then(function(coll){


	
	 	let objetdate = ["2012","2013","2014","2015","2016","2017"];
	 	let collection=new Array();
	 	//On test pour chaque date si elle est selectionné
	 	for (let i=1;i<objetdate.length;i++)
	 	{
			$('#'+objetdate[i]+'.list-group-item.list-group-item-primary.active').each(function(){
				for (let w=0;w<coll.length;w++)
				{
					if(coll[w].date)
					{
					let datatempo=coll[w].date.substr(0,4);

					if(datatempo==objetdate[i])
					{
						collection.push(coll[w]);
					}
				}
			}
				
			});
		
		}
		//Ligne spécial pour traiter les photos de 2012 ou avant
		$('#'+objetdate[0]+'.list-group-item.list-group-item-primary.active').each(function(){
			for (let w=0;w<coll.length;w++)
				{
					if (!coll[w].date)
					{
						collection.push(coll[w]);
					}
					else{
						let datatempo=coll[w].date.substr(0,4);
						if (datatempo<=objetdate[0])
						{
							collection.push(coll[w]);

						}
					}
				}				
			});

		galerie(collection,id);
	});
		return coll;
		
	};
}




 function galerie(coll,id){ // Affichage dans la galerie des photos en fonction du nombre d'élément par ligne demandé

			coll.sort(tri); //On effectue le tri par date
			//Initialisation des objets nécessaire,un texte vide, un tag pour toute les photo et un tableau
			let text="";
			let tag='<a href="#" id="album-all" class="list-group-item active">All photos</a>';
			let objet=new Array("all");
			for (let i=0;i<coll.length;i++) //Action effectué pour chaque photo
			{
				//On mets en place le code HTML qui va affiché la photo dans la galerie a la bonne dimension
				let source=base_img+coll[i]._id.$id+"/"+coll[i].name;
				let id_photo="photo-"+i;
				let tailleCol="col-sm-"+id;
				let liste_albums = coll[i].albums;
				let string3=`<div class="${tailleCol}" style="margin-bottom: 30px;" >
							<img src=${source} class="img-thumbnail" style=" height: ${id}0%; max-width:100%" data-toggle="tooltip" title="${liste_albums}" id="${id_photo}" alt=${coll[i].desc}
							<h4>${coll[i].name}</h4>
							<span class="text-muted">${coll[i].desc}</span>
							<span class="text-muted">${coll[i].date}</span>
							</div>
							`
				text+=string3;
				//Pour chaque tag associé a la photo, on regarde si on ne l'a pas deja dans le tableau,on parcours chauqe tag et on le compare a tout le tableau

				let bool=true;
				for (let j=0;j<coll[i].albums.length;j++)
				{	
					tagEnCours=coll[i].albums[j];
					
					for (let z of objet)
					{
						if (z == tagEnCours)
						{
							bool=false;							
						}
					}
					if (bool)
					{
						objet.push(tagEnCours);
						let gestionTag=`<a href="#" id='album-${coll[i].albums[j]}' class="list-group-item">${coll[i].albums[j]}</a>`
						tag+=gestionTag;	

					}
					bool=true;					
				}
			}
			document.getElementById("tableau").innerHTML=text;
			console.log("galerie: rendu tableau terminé");

			//On associe la fonction affiche_photo a chaque photo que l'on vient de créer
			for (let i=0;i<coll.length;i++) {
				let id_photo="photo-"+i;
				let elt_photo = document.getElementById(id_photo);
				elt_photo.onclick = affiche_photo(coll[i]);
			}			
			
			
			//On associe a chaque tag une fontion de filtre
			document.getElementById("panel-menu").innerHTML=tag;
			for (let w=1;w<objet.length;w++)
			{
					
					$("#album-" + objet[w]).click(function(){
					filtretableau(coll,objet[w],id); //this.id is the selected album's identifier
					});
			}
			
			//Si on clique sur all photo, on relance l'affichage de toute la galerie
			$("#album-all").click(function()
			{
					downloadPromise(base_url)
					.then(coll=>galerie(coll,2))
					.then(function(coll)
					{
							["6","4","3","2","1"].forEach(function(id)
							{
					document.getElementById(id).onclick = changeTaille(coll,id);
							});
					});
			});

			//On affiche la premiere photo de la collection en premier
			affiche_photo(coll[0])();		
			return coll;
 }	
 

/************************************************************** */


//jquery call for ready
$(document).ready(function(){
  
  let state = {};

  // associate an update function to each album in the menu
  $("#" + all_albums_id).click(function(){
    albums_onclick(state)(this.id); //this.id is the selected album's identifier
  });
  
  ["all", "keyboard", "composition", "2017"].forEach((x) => 
    $("#" + album_prefix_id + x).click(function() {
        albums_onclick(state)(this.id); //bind a closure to the handler
      })
  );

  $('#reset-button').click(function() {
    console.log('reset');
    let formElt = $('#reset-form');
    resetPromise(base_url, formElt)
      .catch(reason => console.error(reason));
  });

  $("#upload-button").click(function() {
    let formElt = $("#upload-form")[0];
	console.log(formElt);
    uploadPromise(base_url,formElt)
      .catch(reason => console.error(reason));
  });

  $("#photo-edit").click(function() {
    //get values from the modal modal box
    let desc = $("#new-desc").val();
    let albums = $("#new-albums").val();
    console.log(desc, albums);
    //update then reload based on new collection
    updatePromise(base_url, {})
      .catch(reason => console.error(reason));
  });

  //the collection is propagated in all calls and on the handlers generated by render functions
  /*staticPromise()
  .then(coll => {console.log(coll); return coll;})
  .catch(reason => console.error(reason));*/
  


});



$(function () {
    $('.list-group.checked-list-box .list-group-item').each(function () 
    {
        
        // Settings
        var $widget = $(this),
            $checkbox = $('<input type="checkbox" class="hidden" />'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };
            
        $widget.css('cursor', 'pointer')
        $widget.append($checkbox);

        // Event Handlers
        $widget.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });
          

        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $widget.addClass(style + color + ' active');
            } else {
                $widget.removeClass(style + color + ' active');
            }
        }

        // Initialization
        function init() {
            
            if ($widget.data('checked') == true) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }
            
            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
                $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
            }
        }
        init();
    });
    
   
});

 $('#get-checked-data').on('click', function(event) {
        event.preventDefault(); 
        var checkedItems = {}, counter = 0;
        $("#check-list-box li.active").each(function(idx, li) {
            checkedItems[counter] = $(li).id;
            console.log(checkedItems[counter]);
            counter++;

        });
        $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
    });


 //Connexion
var api_key = '';

let connexion = function(){
    api_key = $("#cle").val();
    if (api_key.length==8)
    {
    	SuiteConnexion();
    }
    else{
    	$('#myModal').modal('show') 
    }
    
};

let deconnexion = function(){
    api_key = '';    
    eraseCookie("cle");
    $("#cle").val('');
}; 

let SuiteConnexion = function(){
        console.log("connexion reussi");
        createCookie("cle",api_key,8)

          //Promesse et fonction
  downloadPromise(base_url)
	.then(coll=>galerie(coll,2))
	.then(function(coll){
		["2012","2013","2014","2015","2016","2017"].forEach(function(annee){
			document.getElementById(annee).onclick = filtredate(coll,2);

		});
		return coll;	
	})
	.then(function(coll){
		["6","4","3","2","1"].forEach(function(id){
			document.getElementById(id).onclick = changeTaille(coll,id);
		});});
    
}

 //Cookies
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}


function eraseCookie(name) {
	createCookie(name,"",-1);
}

$(document).ready(function(){
	if(readCookie("cle")==null)
	{}
	else{
		if(readCookie("cle").length==8)
		{	
			api_key=readCookie("cle");
			SuiteConnexion();
		}
	}
});