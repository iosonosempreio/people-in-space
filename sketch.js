var positions = [],
    img,
    myFontSize = 14;


function preload() {

  var people = 'http://api.open-notify.org/astros.json?callback=CALLBACK'

  loadJSON(people, doThings, manageErrors, 'jsonp');

  img = loadImage("assets/sky.jpg");

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

function setup() {

  createCanvas(window.innerWidth,window.innerHeight)
  frameRate(30)

  for(var i = 0; i < people.number; i = i + 1){
    positions.push({
      x:random(width*0.1,width*0.9),
      y:random(height*0.1,height*0.9),
      size:random(50,50),
      speedx:random(-3,3),
      speedy:random(-3,3)
    })
  }

}

function draw() {

  image(img, (window.innerWidth-img.width)/2, (window.innerHeight-img.height)/2);

  positions.forEach(function(d,i){
    fill(140,253,200)
    ellipse(d.x,d.y,d.size,d.size)
    fill(255);
    textFont("Droid Sans");
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(myFontSize);
    text(people.people[i].name.toUpperCase(), d.x, d.y+d.size*0.5+myFontSize+2); // Text wraps within text box
      
    d.x = d.x + d.speedx
    if ((d.x+(d.size/2)) > width || (d.x-(d.size/2)) < 0 ) {
      d.speedx = d.speedx * -1
    }
    
    d.y = d.y + d.speedy
    if ((d.y+(d.size/2))+myFontSize > height || (d.y-(d.size/2)) < 0 ) {
      d.speedy = d.speedy * -1
    }
    
  })

}