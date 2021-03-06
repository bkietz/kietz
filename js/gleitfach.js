/*****************************

gleitfach © Ben Kietzman, 2011

(Creative Commons Attribution-NonCommercial-ShareAlike —
 http://creativecommons.org/licenses/by-nc-sa/3.0
 I'm not opposed to commercial projects using my software
 but I'd like to be told of them first)


 * gleitfach is a barebones HTML editing system.
 * (German for 'sliding box' - rhymes with kite-Bach)
 *****************************/



gleitfach = {};
/*****************************
 * gleitfach defines a class of DOM element
 * with event bindings for basic
 * mouse interaction with a div:
 * 
 * 		S-drag	= move the div
 * 		C-drag	= crop the div
 * 		S-wheel	= raise/lower DOM precedence
 * 		C-dbclk  = lock/unlock the gleitfach
 * 
 * The gleitfach has subclasses
 * for allowing an img within 
 * to be cropped/scaled/rotated/etc.
 * for allowing nicEdit instantiation
 * for a canvas painter or flash video...
 ******************************/

gleitfach.init = function(editorWindowID,nicEditPanelID){



gleitfach.editorWindowID = editorWindowID;
gleitfach.nicEditManager = new nicEditor();	
gleitfach.nicEditManager.setPanel(nicEditPanelID);


/*****************************
 * RE-POSITION the gleitfach by
 * holding down only shift 
 * during a drag
 * 	The div will track with the mouse
 *****************************/
$('div.gleitfach')
  .drag({	  
      viv:[
		function(e){return  e.shiftKey},
		function(e){return !e.ctrlKey},
		function(e){return !e.altKey}
		],//viv

	  pre:function(e,c){
		c._ = {
		    mouse:	{x:e.pageX,	y:e.pageY,},
			corner:	$(this).offset(),
			};//c._
		},//pre

      inter:function(e,c){
		$(this).offset({
			top: (c._.corner.top  + e.pageY-c._.mouse.y),
			left:(c._.corner.left + e.pageX-c._.mouse.x)
			});//offset
		},//inter

  });//S-drag


/*****************************
 * CROP the gleitfach by
 * holding down only ctrl
 * during a drag
 * 		The lower right corner will track with the mouse
 *****************************/
$('div.gleitfach')
  .drag({
      viv:[
		function(e){return !e.shiftKey},
		function(e){return  e.ctrlKey},
		function(e){return !e.altKey}
		],//viv

	  pre:function(e,c){
		c._.quadrant =	(e.pageY < $(this).corners('center').y? 'T':'B')+
						(e.pageX < $(this).corners('center').x? 'L':'R');
		c._.corner = $(this).corners(c._.quadrant);
		},//pre


	  inter:function(e,c){
		$(this).corners(c._.quadrant,{x:e.pageX,y:e.pageY});
		},//inter

  });//C-drag
  
  
/*****************************
 * Raise/lower the gleitfach by
 * holding down only shift 
 * during mousewheeling
 *****************************/
$(document)
  .on('mousewheel','div.gleitfach',
	function(e){
		if( e.shiftKey && !e.ctrlKey && !e.altKey);
		else return;

		e.stopPropagation();
		e.preventDefault();

		if(e.originalEvent.wheelDelta>0 && $(this).next().length)
			$(this).next().after($(this).detach());

		if(e.originalEvent.wheelDelta<0 && $(this).prev().length)
			$(this).prev().before($(this).detach());
		
  });//S-mousewheel
  
  
/*****************************
 * lock/unlock the gleitfach by
 * holding down only ctrl 
 * during a double click
 *****************************/
$(document)
  .on('dblclick','div.gleitfach,  div.gleitfach_inactive',
	function(e){
		if(!e.shiftKey &&  e.ctrlKey && !e.altKey);
		else return;

		e.stopPropagation();
		e.preventDefault();

		$(this).toggleClass('gleitfach').toggleClass('gleitfach_inactive');
		//add something so that gleitfach_txt's contents can be locked, too
		
  });//C-dblclick


/***************************
 * Now implement the IMAGE functionality
 * (so that the image position remains
 *  absolute even when TL is being cropped) 
 ***************************/
 $('div.gleitfach.gleitfach_img')
 .drag({
      viv:[
		function(e){return !e.shiftKey},
		function(e){return  e.ctrlKey},
		function(e){return !e.altKey}
		],//viv

	  pre:function(e,c){
		c._.quadrant =	(e.pageY < $(this).corners('center').y? 'T':'B')+
						(e.pageX < $(this).corners('center').x? 'L':'R');
		c._.crop= {	x:parseInt($(this).css('background-position-x')),
					y:parseInt($(this).css('background-position-y'))	};
		c._.corner = $(this).corners(c._.quadrant);
		},//pre


	  inter:function(e,c){
		if(c._.quadrant[0] == 'T')
			$(this).css('background-position-y',
				c._.corner.y - e.pageY + c._.crop.y);
		
		if(c._.quadrant[1] == 'L')
			$(this).css('background-position-x',
				c._.corner.x - e.pageX + c._.crop.x);
		},//inter

  });//C-drag

  
};//gleitfach.init


gleitfach.src = function(src,srcDimensions){
// auto-create a gleitfach with an image in it

var generateDiv = function(size){	
	return $("<div />")
	.appendTo('#'+gleitfach.editorWindowID)
	.addClass('gleitfach')
	.addClass('gleitfach_img')
	.css({

		'z-index'	: 0,

	'background-size'		: size.width+' '+size.height,
	'background-image'		:'url(images/airgear.jpg)',
	'background-position'	:'0 0',

		left		: 0,
		top			: 0,
		position	: 'absolute',
		height		: size.height,
		width		: size.width,
		
		})//css
	.attr({
		height_0	: size.height,
		width_0		: size.width,
		
		});//attr
};//generateDiv

if(srcDimensions == undefined) {
	// find the dimensions of the image @ src
	var ret;//how do I *not* use ret?
	$('<img src="'+src+'" />')
			.appendTo('body')
			.load(function(){
				ret = generateDiv({
						height:	$(this).height(),
						width:	$(this).width()
						});
				$(this).remove();
				});//load
	 return ret;	}//if
else return generateDiv(srcDimensions);
};//gleitfach.src()


gleitfach.txt = function(txt,txtDimensions){
// auto-create a gleitfach with a text editability in it

if(txtDimensions == undefined) {
	var l = Math.floor(Math.sqrt(txt.length)*10);
	var txtDimensions = {height:Math.max(100,l),width:Math.max(100,l)};
}



/*****************************
 *  This method is chainable-
 *  it returns a jQuery to the
 *  fresh gleitfach:
 *****************************/
var d = $("<div />")
  .appendTo('#'+gleitfach.editorWindowID)
  .addClass('gleitfach')
  .addClass('gleitfach_txt')
  .attr({
      height_0	: txtDimensions.height,
      width_0	: txtDimensions.width,
    })//attr
  .css({

	  'z-index'	: 0,
	  
	  left		: 0,
	  top		: 0,
      height	: txtDimensions.height,
      width		: txtDimensions.width,
	  position	: 'absolute',

	  'overflow-y': 'auto',
	  'overflow-x': 'hidden'
	})//css
  .html(txt);
  
  
/***************************
 * Now implement the TEXT functionality
 * 
 * This nicEdit instantiatiation is
 * too hacky by half for my taste.
 ***************************/

  var tempID = 'nicEditInstantiationTemporaryID_' + $.Event().timeStamp;
  d.attr('id',tempID);
  gleitfach.nicEditManager.addInstance(tempID);
  d.removeAttr('id');
  
  return d;
};




