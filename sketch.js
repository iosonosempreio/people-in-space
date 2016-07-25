var positions = [],
    img,
    myFontSize = 14,
    palette = ['4882CC','FFFFC4','9F4B26','F3B404','C7578E'],
    introText = '<div class="only-big"><p>This experiment is realised thanks to the awesome <a href="https://p5js.org">p5js</a> library.</p><p>The application connects with a <a href="https://api.open-notify.org/">service</a> that provides in real time the number of astronauts that are on some galactic mission in this precise moment and plot them as floating dots scattered across the space of the window.</p></div><p>Discover more on the <a href="Github Repo">GitHub repo</a>.</p>',
    title = 'How many people are there in the Outer Space, <b>NOW</b>?',
    textBoxHeight,
    speed = 3,
    maxSize = 80,
    realMax= 0;

function preload() {
  // var someText = createDiv('<h1>'+title+'</h1><p>'+introText+'</p>');
  // someText.id('text-box')

  var people = 'https://peopleinspace.herokuapp.com/'
  loadJSON(people, doThings, manageErrors, 'json');
  
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

function unHexColours(hex) {
  hex = hex.match(/.{1,2}/g)
  hex = unhex(hex)
  return hex
}

function setup() {

  textBoxHeight = parseInt(window.getComputedStyle(document.getElementById("text-box"), null).height)

  if (window.innerWidth<768) {
    canvas = createCanvas(window.innerWidth, window.innerHeight*0.75)
    speed = 2
  } else {
    canvas = createCanvas(window.innerWidth,(window.innerHeight-textBoxHeight))
  }
  canvas.position(0, textBoxHeight);
  // frameRate(30)
  var today = moment();
  var colNum = 0;


  for(var i = 0; i < people.number; i = i + 1){

      //speed of each circle (x and y)
      var spedx = random(-speed,speed);
      var spedy = random(-speed,speed);

      //assign values
    positions.push({
      x:random(width*0.2,width*0.8),
      y:random(height*0.2,height*0.8),
      size: today.diff(moment(people.people[i].launchdate),'days'), //just for now, later this will be mapped to constrain the size according to a mazimum limit
      myspeedx : spedx,
      myspeedy : spedy,
      speedx:spedx,
      speedy:spedy,
      colour: unHexColours(palette[colNum])
    })
    colNum++;
    if (colNum >= palette.length) {
      colNum = 0;
    }

    //update the maximum value found for now
    if(positions[i].size > realMax) {
        realMax = positions[i].size;
    }
  }

    //assign the mapped size for each circle
    positions.forEach(function(d){
        d.size = map(d.size, 0, realMax, 0, maxSize);
    })

}

function draw() {

  background(26,23,40)

  positions.forEach(function(d,i){
    noStroke();
    fill(d.colour)
    ellipse(d.x,d.y,d.size,d.size)

    fill(255); 
    textFont("Droid Sans");
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(myFontSize);
    text(people.people[i].name.toUpperCase(), d.x, d.y+d.size*0.5+myFontSize+2); // Text wraps within text box


      //update position according to velocity
      d.x = d.x + d.speedx
      d.y = d.y + d.speedy

   //create vectors to compute distance (using the dist function)
    var currPoint = createVector(d.x, d.y);
    var mousePoint = createVector(mouseX, mouseY);


      //update coordinates relative to the distance from the mouse pointer
      if (currPoint.dist(mousePoint) <= 50) {

          //slow down speed according to mouse pointer
          d.speedx = d.speedx >= 0 ? d.speedx - .3*Math.abs(d.myspeedx)*(1 / currPoint.dist(mousePoint)) :d.speedx + .3*Math.abs(d.myspeedx)*(1 / currPoint.dist(mousePoint));
          d.speedy = d.speedy >= 0 ? d.speedy - .3*Math.abs(d.myspeedy)*(1 / currPoint.dist(mousePoint)) :d.speedy + .3*Math.abs(d.myspeedy)*(1 / currPoint.dist(mousePoint));
      }
      else {


          //check collision with borders, handle special cases for the X axis
          if((d.x+(d.size/2))+36 > width && d.speedx >= 0 )
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

          //check collision with borders, handle special cases for the Y axis
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


function mousePressed() {

//loop through all circles
 for(var i = 0; i< positions.length; i++){
    var d = positions[i];

     //look for the first circle that eventually contains the mouse pointer
    if(mouseX > (d.x - d.size/2) && mouseX < (d.x + d.size/2) && mouseY > (d.y - d.size/2) && mouseY < (d.y + d.size/2) ) {
      console.log(people.people[i]);

      //break the loop when the first circle is found (to avoid multiple selections on overlaps)
      break;
    }
  }
}
