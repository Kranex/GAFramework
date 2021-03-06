/* Modified Tournement selection. This is tsp1 with better time analysis */
/* script variables */
var POOLSIZE;
var quit = 0;

var start;
var elites;
var elitep = 10;
var torSize = 10;
var fitnessOnly = false;

var pool = [];
var verts = [];
var cords = false;

var leet;
var leetChanges = 0;
var leetSince=0;
var gen = 0;

var startTime;
var timeLeet;
var finishTime;

// init data function.
function init(args){
  /* init the SQL statement object */

  /* itterate through the table, adding verts, x and y to the respective arrays */
  verts = table.getColumns();
  if(table.getColumns().size() != table.getRows().size()){
    cords = true;
  }
  args = (args.slice(1,args.length-1)).split(",");
  for(var i in args){
    if(args[i].startsWith("start=")){
      start = args[i].replace("start=", "");
      if(!verts.contains(start)){
        start = undefined;
      }
      continue;
    }
    if(args[i].startsWith("elites=")){
      elites = parseInt(args[i].replace("elites=", ""));
      continue;
    }
    if(args[i].startsWith("elitep=")){
      elitep = parseFloat(args[i].replace("elitep=", ""));
      continue;
    }
    if(args[i].startsWith("torSize=")){
      torSize = parseInt(args[i].replace("torSize=", ""));
      continue;
    }
    if(args[i].startsWith("fitnessOnly")){
      fitnessOnly = true;
      continue;
    }
  }
}

// init pool function.
function initPool(poolSize){
  /* generate the chromosome pool by creating an array of all the cities then shuffling them. */
  POOLSIZE = poolSize;
  startTime = Date().now;
  for(var i = 0; i < POOLSIZE; i++){
    var chromo = new Chromosome();
    for(var j = 0; j < verts.length; j++){
      chromo.struct.push(j);
    }
    chromo.shuffle();
    fitness(chromo);
    pool.push(chromo);
  }

  /* Calculate number of elites, must be more than 0 */
  if(elites === undefined){
    elites = Math.floor(((elitep/100)*POOLSIZE));
    if(elites === 0)elites++;
  }

  /* Calculate the inital average pool fitness */
  var tFit = 0.0;
  for(i = 0; i < POOLSIZE; i++){
    tFit += pool[i].fitness;
  }
  avPool = tFit/POOLSIZE;
}

// loop function
function loop(){
  gen++;
  /* sort the pool lowest to highest */
  pool.sort(function(a, b){return a.fitness-b.fitness;});
  leetSince++;
  ////
  if(leet === undefined){
    leet = pool[0];
    leetSince--;
    timeLeet = Date().now;
  }
  else if(leet.fitness != pool[0].fitness){

    leet = pool[0];
    leetChanges++;
    leetSince = 0;
    timeLeet = Date().now;
  }
  ////

  var tFit = 0.0;
  var inv = pool[0].fitness+pool[pool.length-1].fitness;
  /* Calculate total fitness */
  for(var i = 0; i < pool.length; i++){
    //  print(pool[i].struct);
    tFit += inv-pool[i].fitness;
  }
  /* calculate the inverse probability */
  for(i = 0; i < pool.length; i++){
    pool[i].probability = (inv-pool[i].fitness)/tFit;
  }
  //preselection();
  /* init the pool to replace the nleets. */
  var nPool = crossover();
  /* run mutate, fitness, then push the npool chromosomes to the pool */
  for(i = 0; i < pool.length-elites; i++){
    chromo = nPool[i];
    mutate(chromo);
    fitness(chromo);
    pool[i+elites] = chromo;
  }
}
/* crossover function */
function crossover(){
  var nPool = [];
  while(nPool.length < POOLSIZE-elites){
    /* init parents and chidren */
    var parentA = selectParent();
    var parentB = torSelect(parentA);
    var childA =  new Chromosome(parentA);
    var childB = new Chromosome(parentB);
    /* get two random indexes for the route part of the chromosome, sort them lowest to highest */
    rand = [Math.floor(Math.random()*parentA.struct.length), Math.floor(Math.random()*parentA.struct.length)];
    rand.sort(function(a, b){return a-b;});

    /* then crossover ;) */
    var x, y;
    for(var r = rand[0]; r <= rand[1]; r++){
      x = parentB.struct[r];
      y = parentA.struct[r];
      childA.struct.splice(childA.struct.indexOf(x), 1);
      childB.struct.splice(childB.struct.indexOf(y), 1);
    }
    for(r = rand[0]; r <= rand[1]; r++){
      x = parentB.struct[r];
      y = parentA.struct[r];
      childA.struct.splice(r, 0, x);
      childB.struct.splice(r, 0, y);
    }
    /* double check there's enough room in the npool */
    if(nPool.length < POOLSIZE-elites){
      nPool.push(childA);
    }
    if(nPool.length < POOLSIZE-elites){
      nPool.push(childB);
    }
  }
  return nPool;
}
/* returns the index of the parent give the probability. */
function torSelect(parentA){
  for(var j = 0; j < 5; j++){
    var parentB, diff = 0;
    for(var i = 0; i < torSize; i++){
      var rand = selectParent();
      var ndiff = parentA.difference(rand);
      if(ndiff > diff){
        parentB = rand;
        diff = ndiff;
      }
    }
    if(diff != 0){
      return parentB;
    }
    print("incest strike: " + j);
  }
}
function selectParent(){
  var rand = Math.random();
  for(var i = 0; i < pool.length; i++){
    rand-=pool[i].probability;
    if(rand <0){
      return pool[i];
    }
  }
  return pool[pool.length-1];
}
// mutate function.
function mutate(chromo){
  var r = Math.random();
  var mut = [0.5,0.339643,0.0801787,0.0495531,0.0306255];
  for(var i = 0; i < mut.length; i++){
    r-=mut[i];
    if(r<0){
      for(j = 0; j < i; j ++){
        chromo.shiftMutate();
      }
      break;
    }
  }
}

// end function for output.
function output(){
  if(fitnessOnly){
    print(pool[0].fitness);
    return;
  }
  pool.sort(function(a, b){return a.fitness-b.fitness;});
  var eliteProb = 0;
  for(i = 0; i < elites; i++){
    eliteProb += pool[i].probability;
  }
  eliteProb = eliteProb * 100;
  print("Optimum changed: " + leetChanges + " times. Last change: " + leetSince + " Generations ago. Probability of an elite being selected: " + eliteProb);
  print(chromo2text(pool[0]));
  //print();
  //for(var i in pool){
  //  print(pool[i].struct + ":" + pool[i].fitness);
  //}
}
function tableOutput(totalTimeMillis){
  var finishTime = Date().now - startTime;
  print(finishTime + " " + (timeLeet-startTime) + " " + elitep + " " + POOLSIZE + " " + gen + " " + pool[0].fitness);
}

/* fitness function.
* fitness is simply the total of the chromosomes suggested solution. if the chromosome
* is invaid, rather than removing it, increase its total distance to ///twice/// the average of the inital pool.
*/
function fitness(chromo){
  var dist = distance(chromo.struct[0], chromo.struct[chromo.struct.length-1]);
  for(var i = 0; i < chromo.struct.length-1; i++){
    dist += distance(chromo.struct[i], chromo.struct[i+1]);
  }
  chromo.fitness = dist;
}

/* calculates distance between two verts using pythagoras */
function distance(a, b){
  if(cords){
    var dx = table.getFloat(a,0) - table.getFloat(b,0);
    var dy = table.getFloat(a,1) - table.getFloat(b,0);
    return Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
  }else{
    return table.getFloat(a,b);
  }
}
/* returns the chromosome with verts indexes replaced with the names from verts */
function chromo2text(chromo){
  var str = "";
  if(start !== undefined){
    rotate(chromo.struct, chromo.struct.indexOf(verts.indexOf(start)));
  }
  for(var i = 0; i < chromo.struct.length-1; i++){
    str += verts[chromo.struct[i]] + "-";
  }
  str+=verts[chromo.struct[chromo.struct.length-1]] + ":" + chromo.fitness;
  return str;
}
/* Rotates an array a by a given number of places */
function rotate( array , places ){
  while( places-- ){
    var temp = array.shift();
    array.push( temp );
  }
}
function getLeet(){
  if(leet === undefined){
      return 0;
  }else{
    return leet.fitness;
  }
}
function bob(){
  return quit;
}
