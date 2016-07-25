var positions = [],
    img,
    myFontSize = 14,
    palette = ['4882CC','FFFFC4','9F4B26','F3B404','C7578E'],
    introText = '<div class="only-big"><p>This experiment is realised thanks to the awesome <a href="https://p5js.org">p5js</a> library.</p><p>The application connects with a <a href="https://api.open-notify.org/">service</a> that provides in real time the number of astronauts that are on some galactic mission in this precise moment and plot them as floating dots scattered across the space of the window.</p></div><p>Discover more on the <a href="Github Repo">GitHub repo</a>.</p>',
    title = 'How many people are there in the Outer Space, <b>NOW</b>?',
    textBoxHeight,
    speed = 3;

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
  
  var colNum = 0;
  for(var i = 0; i < people.number; i = i + 1){
    positions.push({
      x:random(width*0.2,width*0.8),
      y:random(height*0.2,height*0.8),
      size:random(30,50),
      speedx:random(-speed,speed),
      speedy:random(-speed,speed),
      colour: unHexColours(palette[colNum])
    })
    colNum++;
    if (colNum >= palette.length) {
      colNum = 0;
    }
  }

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
      
    d.x = d.x + d.speedx
    if ((d.x+(d.size/2))+36 > width || (d.x-(d.size/2))-36 < 0 ) {
      d.speedx = d.speedx * -1
    }
    
    d.y = d.y + d.speedy
    if ((d.y+(d.size/2))+myFontSize > height || (d.y-(d.size/2)) < 0 ) {
      d.speedy = d.speedy * -1
    }
    
  })

}
