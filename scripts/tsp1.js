//statement and table initalisations.
var statement;
var VERTS;

/* script variables */
var pool = [];
var verts = [];
var x = [];
var y = [];

var elites;
var leet;
var leetChanges = 0;

// init data function.
function init(){
  /* init the SQL statement object */
	statement = db.createStatement();
  /* init the data table */
	VERTS = statement.executeQuery("SELECT * FROM VERTS");
  /* itterate through the table, adding verts, x and y to the respective arrays */
	while(VERTS.next()){
		verts.push(VERTS.getString(1));
		x.push(VERTS.getDouble(2));
		y.push(VERTS.getDouble(3));
	}
}

// init pool function.
function initPool(poolSize){
  /* generate the chromosome pool by creating an array of all the cities then shuffling them. */
	for(var i = 0; i < poolSize; i++){
		var chromo = new Chromosome();
		for(var j = 0; j < verts.length; j++){
			chromo.struct.push(j);
    }
		chromo.shuffle();
    fitness(chromo);
		pool.push(chromo);
	}

  /* Calculate number of elites, must be more than 0 */
  elites = Math.floor(((5/100)*poolSize));
  if(elites == 0)elites++;

  /* Calculate the inital average pool fitness */
  var tFit = 0.0;
  for(var i = 0; i < poolSize; i++){
		tFit += pool[i].fitness;
	}
  avPool = tFit/poolSize;
}

// loop function
function loop(){
  /* sort the pool lowest to highest */
  pool.sort(function(a, b){return a.fitness-b.fitness});

  ////
  if(leet === undefined){
    leet = pool[0];
  }
  else if(leet.fitness != pool[0].fitness){
    leet = pool[0];
    leetChanges++;
  };
  ////


  var l = pool.length;
  var tFit = 0.0;
  var inv = pool[0].fitness+pool[l-1].fitness;
  /* Calculate total fitness */
  for(var i = 0; i < l; i++){
//  print(pool[i].struct);
    tFit += pool[i].fitness;
  }
  /* calculate the inverse probability */
  for(i = 0; i < l; i++){
    pool[i].probability = (inv-pool[i].fitness)/tFit;
  }
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
  while(nPool.length < pool.length-elites){
    /* init parents and chidren */
    var parentA = pool[selectParent()];
    var parentB = pool[selectParent()];
    var childA =  new Chromosome(parentA);
    var childB = new Chromosome(parentB);
    /* get two random indexes for the route part of the chromosome, sort them lowest to highest */
    rand = [Math.floor(Math.random()*verts.length), Math.floor(Math.random()*verts.length)];
    rand.sort(function(a, b){return a-b});

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
    if(nPool.length < pool.length-elites){
      nPool.push(childA);
    }
    if(nPool.length < pool.length-elites){
      nPool.push(childB);
    }
  }
  return nPool;
}
// mutate function.
function mutate(chromo){
  var r = Math.random();
  if(0.2-r>=0){
    	chromo.shuffle();
  }
}
// end function for output.
function output(){
    pool.sort(function(a, b){return a.fitness-b.fitness});
    print("Optimum changed: " + leetChanges + " times.");
    print(chromo2text(pool[0]));
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
/* returns the index of the parent give the probability. */
function selectParent(){
  var rand = Math.random();
  for(i = 0; i < pool.length; i++){
    rand-=pool[i].probability;
    if(rand <=0){
      return i;
    }
  }
  return pool.length-1;
}
/* returns the chromosome with verts indexes replaced with the names from verts */
function chromo2text(chromo){
  var str = "";
  for(var i = 0; i < verts.length-1; i++){
    str += verts[chromo.struct[i]] + "-";
  }
  str+=verts[chromo.struct[verts.length-1]] + ":" + chromo.fitness;
  return str;
}

/* calculates distance between two verts using pythagoras */
function distance(a, b){
	var dx = x[a] - x[b];
	var dy = y[a] - y[b];
	return Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
}
