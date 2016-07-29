var positions = [],
    myFontSize = 14,
    palette = ['4882CC','FFFFC4','9F4B26','F3B404','C7578E'],
    textBoxHeight,
    speed = 3,
    minSize = 30,
    maxSize = 100,
    realMax= 0,
    today = moment(),
    sidebarClosed=true,
    availableWidth,
    maxdist = 50,
    thisAstronaut;

function unHexColours(hex) {
  hex = hex.match(/.{1,2}/g)
  hex = unhex(hex)
  return hex
}

function doThings(data){
  if (data) {
    people = data
  }
}

function manageErrors(data){
  console.log("I got some errors")
  console.log(data)
}

// preload data
function preload() {
  var people = 'https://peopleinspace.herokuapp.com/'
  loadJSON(people, doThings, manageErrors, 'json')
}

function setup() {

  textBoxHeight = int(select('#text-box').style('height'))

  if (window.innerWidth<768) {
    speed = 2
    minSize = 15
    maxSize = 70
  } else if (window.innerWidth>=1200) {
    toggleSidebar('about')
  }

  // create canvas
  canvas = createCanvas(windowWidth,(windowHeight-textBoxHeight))
  canvas.position(0, textBoxHeight);
  frameRate(60)
  var colNum = 0

  for(var i = 0; i < people.astronauts.length; i = i + 1){

    //speed of each circle (x and y)
    var spedx = random(-speed,speed)
    var spedy = random(-speed,speed)

    //assign values
    positions.push({
      x:random(width*0.2,width*0.8),
      y:random(height*0.2,height*0.8),
      size: today.diff(moment(people.astronauts[i].launchdate),'days'),
      refSpeedX : spedx,
      refSpeedY : spedy,
      speedX:spedx,
      speedY:spedy,
      colour: (people.astronauts[i].role == 'Commander') ? unHexColours(palette[3]) : unHexColours(palette[0])
    })

    colNum++

    if (colNum >= palette.length) {
      colNum = 0
    }

    //update the maximum value found for now
    if(positions[i].size > realMax) {
      realMax = positions[i].size
    }
  }

  //assign the mapped size for each circle
  positions.forEach(function(d){
      d.size = map(d.size, 0, realMax, minSize, maxSize)
  })

}

function draw() {

  background(26,23,40)

  availableWidth = sidebarClosed ? windowWidth : (windowWidth-int(select('#sidebar').style('width')))

  //cycle through each astronaut
  positions.forEach(function(d,i){

    // Draw circles
    stroke(26,23,40)
    fill(d.colour)
    ellipse(d.x,d.y,d.size,d.size)

    // Draw texts
    fill(255) 
    textFont("Droid Sans")
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(myFontSize);
    text(people.astronauts[i].name.toUpperCase(), d.x, d.y+d.size*0.5+myFontSize+2) // Text wraps within text box

    // Update position according to speed and space available when sidebar is open
    d.x = d.x + d.speedX
    d.y = d.y + d.speedY
    if (availableWidth < 1) {
      select('canvas').style('left', -windowWidth+'px')
    } else {
      select('canvas').style('left', '0px')
    }
  

    // Create vectors to compute distance (using the dist function)
    var currPoint = createVector(d.x, d.y);
    var mousePoint = createVector(mouseX, mouseY);
    var currDist = currPoint.dist(mousePoint);


    // check if circles are near the pointer
    if (currDist <= maxdist) {

      // Slow down speed according to mouse pointer proximity
      d.speedX = d.speedX >= 0 ? abs(d.refSpeedX) * (1 - (maxdist - currDist)/maxdist) : abs(d.refSpeedX) * (-1 + (maxdist - currDist)/maxdist);
      d.speedY = d.speedY >= 0 ? abs(d.refSpeedY) * (1 - (maxdist - currDist)/maxdist) : abs(d.refSpeedY) * (-1 + (maxdist - currDist)/maxdist);
    }

    // If far from pointer, check collision with borders
    else {

      // Handle X axis cases
      if((d.x+(d.size/2))+36 > availableWidth && d.speedX >= 0 )
      {
        d.speedX =  Math.abs(d.refSpeedX) * -1;
      }
      else if((d.x-(d.size/2))-36 < 0 && d.speedX < 0){
        d.speedX =  Math.abs(d.refSpeedX);
      }
      else {
        d.speedX = d.speedX >= 0 ?  Math.abs(d.refSpeedX) :  Math.abs(d.refSpeedX) * -1;
      }

      // Handle X axis cases
      if ((d.y+(d.size/2))+myFontSize > height && d.speedY >= 0){
        d.speedY =  Math.abs(d.refSpeedY) * -1;
      }
      else if  ((d.y-(d.size/2)) < 0 && d.speedY < 0) {
        d.speedY =  Math.abs(d.refSpeedY);
      }
      else {
        d.speedY = d.speedY >= 0 ?  Math.abs(d.refSpeedY) :  Math.abs(d.refSpeedY) * -1;
      }
    }
  })

}


// resize canvas on window resize
function windowResized() {
  textBoxHeight = int(select('#text-box').style('height'))
  resizeCanvas(windowWidth,(windowHeight-textBoxHeight))
  canvas.position(0, textBoxHeight)
}

// handle click events
function mousePressed() {

// Loop through all circles
 for(var i = 0; i< positions.length; i++){
    var d = positions[i];
    
    // Look for the first circle that eventually contains the mouse pointer
    if( mouseX > (d.x - d.size/2) && mouseX < (d.x + d.size/2) && mouseY > (d.y - d.size/2) && mouseY < (d.y + d.size/2) ) {
      thisAstronaut = i
      changeInformation(people.astronauts[i])

      // Open the sidebar
      select("#sidebar").elt.className = ''
      sidebarClosed = false

      // Break the loop when the first circle is found (to avoid multiple selections on overlaps)
      break;
    }
  }

}

function switchAstronaut(position){
  console.log(position)

  if (position > 5) {
    position = 0;
  } else if (position < 0) {
    position = 5;
  }

  console.log(position)

  thisAstronaut = position;
  changeInformation(people.astronauts[thisAstronaut])
}

// toggles the sidebar
function toggleSidebar(myClass) {
  if (myClass != 'closed') {
    sidebarClosed = false
  } else {
    sidebarClosed = true
  }
  select("#sidebar").elt.className = myClass;
}

function toggleTimePassed(element,kind){
  console.log(element)
  if (kind =='elapsed') {
    select('#icon-elapsed').class('').addClass('icon-attributes').addClass('left-off')
    select('#astro-elapsed').style('display','none')
    select('#icon-launch-date').class('').addClass('icon-attributes')
    select('#astro-launch-date').style('display','block')
  } else if (kind == 'launch') {
    select('#icon-elapsed').class('').addClass('icon-attributes')
    select('#astro-elapsed').style('display','block')
    select('#icon-launch-date').class('').addClass('icon-attributes').addClass('right-off')
    select('#astro-launch-date').style('display','none')
  }
  console.log(select('#icon-elapsed').class())
  console.log(select('#icon-launch-date').class())
}

// updates information on sidebar
function changeInformation(astro){

  // Fill elements with the correct information
  select("#astro-name").html(astro.name)
  select('img',"#astro-img").elt.setAttribute('src','')
  select('img',"#astro-img").elt.setAttribute('src',astro.img)
  select("#astro-role").html(astro.role)
  select("#astro-elapsed").html(today.diff(moment(astro.launchdate),'days') + ' days')
  select("#astro-launch-date").html('Launch: '+ moment(astro.launchdate).format("MMM D YYYY"))
  select("#astro-ship").html(astro.location)
  select('span','#astro-flag').elt.className = 'flag-icon flag-icon-'+astro.countryIso.toLowerCase()
  if (astro.biolink != '') {
    select('a',"#astro-bio").elt.setAttribute('href',astro.biolink)
    selectAll(".astro-bio").forEach(function(element){
      element
        .style('display','')
        .style('opacity','1')
    })
  } else {
    selectAll(".astro-bio").forEach(function(element){
      element
        .style('display','none')
        .style('opacity','0')
    })
  }
  if (astro.twitter != '') {
    select('a',"#astro-twitter").elt.setAttribute('href',astro.twitter)
    select('a','#astro-twitter')
      .html(astro.twitter.replace('http://twitter.com/',''))
      .elt.setAttribute('href',astro.twitter)
    selectAll(".astro-twitter").forEach(function(element){
      element
        .style('display','')
        .style('opacity','1')
    })
  } else {
    selectAll(".astro-twitter").forEach(function(element){
      element
        .style('display','none')
        .style('opacity','0')
    })
  }
}
