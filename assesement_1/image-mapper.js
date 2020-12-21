const svg = d3.select('svg');
const inputButton = d3.select('#save');
const cancelButton = d3.select('#cancel')
const dialogue = d3.select('#dialogue');
const table = d3.select('#descriptionTable');
const tooltip = d3.select("#tooltip");

/*Get the file input button*/
const imageUploader = document.getElementById("imageUploader");
/*Get the image display area*/
const imageContainer = document.getElementById("imageContainer");
/*Get the image overlay*/
const imageOverlay = document.getElementById("imageOverlay");
/*Find the width of web page*/
const viewportWidth = document.getElementById("leftPanel").offsetWidth;
/*Find the height of web page*/
const viewportHeight = document.getElementById("leftPanel").offsetHeight;
/*Create a new file reader*/
var fileReader = new FileReader();
/*Create a new image element in the page*/
var uploadedImage = new Image();

count = 0;
store = {};

const getRelativeClickCoordinates =  function(svgNode, event) {
	var point = svgNode.createSVGPoint();
	point.x = event.clientX, point.y = event.clientY;
	point = point.matrixTransform(svgNode.getScreenCTM().inverse());
	return [point.x, point.y];
}
const overlayClickHandler = function(event) {

		/*Create the marker*/
		let marker = svg.append('circle');

		/*Create markerId*/
		let markerId = "circle" + count;

		relativeClickCoordinates = getRelativeClickCoordinates(this, event);
		
		marker
			.attr('id', markerId)
			.attr('r', 6)
			.attr('cx', relativeClickCoordinates[0])
			.attr('cy', relativeClickCoordinates[1]);		

		d3.select('#descriptiontext').property('value', '')
		/*Show the input dialog*/
		dialogue
			.style('opacity', 1)
			.style('left', (relativeClickCoordinates[0] + 10) + 'px')
			.style('top', (relativeClickCoordinates[1] + 10) + 'px')

		/*Bring focus on text box*/
		document.getElementById('descriptiontext').focus();

		imageOverlay.removeEventListener("click", overlayClickHandler);

		/*Save the marker*/
		inputButton
			.on('click', function(event) {
				/*save this data into store as value of circle key*/
				let markerDescription = d3.select('#descriptiontext').property("value");
				let xcoord = d3.event.pageX
				store[markerId] = {description:markerDescription, x:relativeClickCoordinates[0], y:relativeClickCoordinates[1]}

				var row = table.append('tr')
				row
					.append('td')
					.html(store[markerId]['x'])
					.attr('class', 'datacolumn')
				row
					.append('td')
					.html(store[markerId]['y'])
				row
					.append('td')
					.html(store[markerId]['description'])

				/*Attach the events to the marker*/
				marker
					.on('mouseover', function(d) {
						tooltip
							.style('opacity', 1)
							.text(markerDescription);
					})
					.on('mousemove', function(d) {  
						tooltip
							.style('left', (d3.event.pageX+10) + 'px')
							.style('top', (d3.event.pageY+10) + 'px');
					})
					.on('mouseout', function(d){
						tooltip
							.style('opacity', 0);
					});

				/*Incrment the count for next circle*/		
				count = count + 1;
				
				/*Hide the dialogue*/
				dialogue
					.style('opacity', 0);
				
				imageOverlay
					.addEventListener('click', overlayClickHandler);				
			})

		/*Cancel the marker*/
		cancelButton 
			.on('click', function(event) {
				d3.select("#" + markerId).remove();
				/*Hide the dialogue*/
				dialogue
					.style('opacity', 0);
				imageOverlay
					.addEventListener('click', overlayClickHandler);
			})
	}
imageOverlay
	.addEventListener('click', overlayClickHandler);

/*Defines the flow when new file/image is uploaded*/
imageUploader.addEventListener("change", function(event) {
	
	/*reset all the image containers*/
	imageContainer.removeChild(imageContainer.firstChild);
	uploadedImage.removeAttribute("width");
	uploadedImage.removeAttribute("height");

	/*Load the data url*/
	var imageFile = event.target.files[0];

	/*Check if file is an image type*/
	if (imageFile.type.includes("image/")) {
		/*Find the name of the file and set it in DOM*/
		document.getElementById("filename").innerHTML = imageFile.name;
		/*Find the type of the file and set it in DOM*/
		document.getElementById("filetype").innerHTML = imageFile.type;
		/*Read the image file as source*/
		fileReader.readAsDataURL(imageFile);
	} else {
		return false;
	}
	
});

/*Defines the flow when ne file/image is read from the input*/
fileReader.addEventListener("load", function(event) {
	/*Set the result as source of image*/
	uploadedImage.src = fileReader.result;
	/*attach the new image in container*/
	imageContainer.appendChild(uploadedImage);
});

/*Define the flow when image source is changed*/
uploadedImage.addEventListener("load", function(event) {

	/*Scale the image*/
	var width = uploadedImage.width;
	var height = uploadedImage.height;
	var aspectRatio = width/height;

	document.getElementById("dimensions").innerHTML = width + " X " + height;

	uploadedImage.width = viewportWidth - 20;
	uploadedImage.height = uploadedImage.width / aspectRatio;
	
	if(uploadedImage.height > viewportHeight) {
		uploadedImage.height = viewportHeight;
		uploadedImage.width = uploadedImage.height * aspectRatio;
	}

	imageOverlay.setAttribute("style", "width:" + uploadedImage.width + "px;height:" + uploadedImage.height + "px;");


});
		
