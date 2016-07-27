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
    availableWidth;

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

  canvas = createCanvas(windowWidth,(windowHeight-textBoxHeight))
  canvas.position(0, textBoxHeight);
  frameRate(60)
  var colNum = 0

  for(var i = 0; i < people.number; i = i + 1){

    //speed of each circle (x and y)
    var spedx = random(-speed,speed)
    var spedy = random(-speed,speed)

    //assign values
    positions.push({
      x:random(width*0.2,width*0.8),
      y:random(height*0.2,height*0.8),
      size: today.diff(moment(people.people[i].launchdate),'days'),
      myspeedx : spedx,
      myspeedy : spedy,
      speedx:spedx,
      speedy:spedy,
      colour: (people.people[i].title == 'Commander') ? unHexColours(palette[3]) : unHexColours(palette[0])
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
    text(people.people[i].name.toUpperCase(), d.x, d.y+d.size*0.5+myFontSize+2) // Text wraps within text box

    // Update position according to speed and space available when sidebar is open
    d.x = d.x + d.speedx
    d.y = d.y + d.speedy
    if (availableWidth < 1) {
      select('canvas').style('left', -windowWidth+'px')
    } else {
      select('canvas').style('left', '0px')
    }
  

    // Create vectors to compute distance (using the dist function)
    var currPoint = createVector(d.x, d.y);
    var mousePoint = createVector(mouseX, mouseY);


    // Update coordinates relative to the distance from the mouse pointer
    if (currPoint.dist(mousePoint) <= 50) {
        // Slow down speed according to mouse pointer
        d.speedx = d.speedx >= 0 ? d.speedx - .3*Math.abs(d.myspeedx)*(1 / currPoint.dist(mousePoint)) :d.speedx + .3*Math.abs(d.myspeedx)*(1 / currPoint.dist(mousePoint));
        d.speedy = d.speedy >= 0 ? d.speedy - .3*Math.abs(d.myspeedy)*(1 / currPoint.dist(mousePoint)) :d.speedy + .3*Math.abs(d.myspeedy)*(1 / currPoint.dist(mousePoint));
    } else {
      // Check collision with borders, handle special cases for the X axis
      if((d.x+(d.size/2))+36 > availableWidth && d.speedx >= 0 )
      {
        d.speedx =  Math.abs(d.myspeedx) * -1;
      }
      else if((d.x-(d.size/2))-36 < 0 && d.speedx < 0){
        d.speedx =  Math.abs(d.myspeedx);
      }
      else {
        d.speedx = d.speedx >= 0 ?  Math.abs(d.myspeedx) :  Math.abs(d.myspeedx) * -1;
      }
      //----------------

      // Check collision with borders, handle special cases for the Y axis
      if ((d.y+(d.size/2))+myFontSize > height && d.speedy >= 0){
        d.speedy =  Math.abs(d.myspeedy) * -1;
      }
      else if  ((d.y-(d.size/2)) < 0 && d.speedy < 0) {
        d.speedy =  Math.abs(d.myspeedy);
      }
      else {
        d.speedy = d.speedy >= 0 ?  Math.abs(d.myspeedy) :  Math.abs(d.myspeedy) * -1;
      }
      //----------------
    }
  })

}

function windowResized() {
  textBoxHeight = int(select('#text-box').style('height'))
  resizeCanvas(windowWidth,(windowHeight-textBoxHeight))
  canvas.position(0, textBoxHeight)
}

function mousePressed() {
// Loop through all circles
 for(var i = 0; i< positions.length; i++){
    var d = positions[i];
    
    // Look for the first circle that eventually contains the mouse pointer
    if( mouseX > (d.x - d.size/2) && mouseX < (d.x + d.size/2) && mouseY > (d.y - d.size/2) && mouseY < (d.y + d.size/2) ) {
      changeInformation(people.people[i])

      // Open the sidebar
      select("#sidebar").elt.className = ''
      sidebarClosed = false

      // Break the loop when the first circle is found (to avoid multiple selections on overlaps)
      break;
    }
  }

}

function toggleSidebar(myClass) {
  if (myClass != 'closed') {
    sidebarClosed = false
  } else {
    sidebarClosed = true
  }
  select("#sidebar").elt.className = myClass;
}

function changeInformation(astro){
  // Fill elements with the correct information
  select("#astro-name").html(astro.name)
  select('img',"#astro-img").elt.setAttribute('src',astro.biophoto)
  select("#astro-role").html(astro.title)
  select("#astro-elapsed").html(today.diff(moment(astro.launchdate),'days') + ' days')
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
