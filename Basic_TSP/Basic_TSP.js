/*
 *  A Framework for writing Genetic Algorithms in Javascript using data stored in a Derby database.
 *  Copyright (C) 1997 Oliver Strik
 *
 *  This file is part of GAFramework
 *
 *  GAFramework is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  GAFramework is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with GAFramework.  If not, see <http://www.gnu.org/licenses/>.
 */
 
//statement and table initalisations.
var statement;
var VERTS;

/* script variables */
var children = 2;
var pool = [];
var verts = [];
var x = [];
var y = [];

var elites;
var leet = [];
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

/* the shift mutate function. */
function shiftMutate(chromo){
  /* declare variables */
  var l, n, m, old;
  l = verts.length;

  /* init m and n with random number 0 <= R < l */
  m = Math.floor(Math.random() * l);
  n = Math.floor(Math.random() * l);

  /* shift genes around */
  old = chromo[m];
  chromo[m] = chromo[n];
  chromo[n] = old;
}

/* shuffles the given array */
function shuffle(array){
  /* declare variables */
	var o, r, l;
  if(array.length >= verts.length){
    l = verts.length;
  }else{
    l = array.length;
  }
  /* reverse itterate over the genes swapping randomly with any genes before it
   * ie:
   *   1      2
   * -----v ----v
   * 067231 017236
   *
   * in itteration 1, swap the gene [1] with any other gene before it. For example [6].
   * in itteration 2 swap the gene [3] with any other gene before it, therefore [6] can NEVER be re-swapped.
   *
   * Note a gene can be swapped with its self. In itteration 2 gene [3] could be swapped with itself. thus
   * not actually changing location.
   */
	for( ; l; l--){
    /* random number 0 < r < (chromo.length - genes.swapped) */
		r = Math.floor(Math.random() * l);

    /* swap them */
		o = array[l-1];
		array[l-1] = array[r];
		array[r] = o;
	}
}

/* calculates distance between two verts using pythagoras */
function distance(a, b){
	var dx = x[a] - x[b];
	var dy = y[a] - y[b];
	return Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
}
function getParent(prob){
  var rand = Math.random();
  for(i = 0; i < pool.length; i++){
    rand-=prob[i];
    if(rand <=0){
      return i;
    }
  }
  return pool.length-1;
}

function chromo2text(chromo){
  var str = "";
  for(var i = 0; i < verts.length-1; i++){
    str += verts[chromo[i]] + "-";
  }
  str+=verts[chromo[verts.length-1]] + ":" + chromo[verts.length];
  return str;
}

// validity function.
function validate(chromo){
  /* indexof requests the index of first occurance of the value given, else it returns -1;
   * as a chromosome must contain all the verts to be valid; it should never return -1.
   * if it does, it's invalid.
   */
  for(var j = 0; j < chromo.length-1; j++){
    if(chromo.indexOf(j) == -1){
      return false;
    }
  }
  return true;
}

// init pool function.
function initPool(poolSize){
  /* generate the chromosome pool by creating an array of all the cities then shuffling them. */
	for(var i = 0; i < poolSize; i++){
		//TODO check.
		var genes = [];
		for(var j = 0; j < verts.length; j++){
			genes.push(j);
		}
		//TODO check.
		var chromo = [];
		shuffle(genes);
		for(j = 0; j < genes.length; j++){
			chromo.push(genes[j]);
		}
    fitness(chromo);
		pool.push(chromo);
	}
  //
  elites = Math.floor(((5/100)*poolSize));
  if(elites == 0)elites++;
  var tFit = 0.0;
  for(var i = 0; i < poolSize; i++){
		tFit += pool[i][verts.length];
	}
  avPool = tFit/poolSize;
}

/* fitness function.
 * fitness is simply the total of the chromosomes suggested solution. if the chromosome
 * is invaid, rather than removing it, increase its total distance to ///twice/// the average of the inital pool.
 */
function fitness(chromo){
  if(!validate(chromo)){
    var penalty = 2;
    chromo.push(Math.floor(penalty*avPool));
  }
  var dist = distance(chromo[0], chromo[chromo.length-1]);
  for(var i = 0; i < chromo.length-1; i++){
    dist += distance(chromo[i], chromo[i+1]);
  }
  chromo.push(dist);


	/*fit.length = 0;
	var penalty = 1;
	for(var j = 0; j < pool.length; j++){
		var chromo = pool[j];
		if(!validate(chromo)){
      var penalty = 2;
			fit.push(Math.floor(penalty*avPool));
		}
		var dist = distance(chromo[0], chromo[chromo.length-1]);
		for(var i = 0; i < chromo.length-1; i++){
			dist += distance(chromo[i], chromo[i+1]);
		}
		fit.push(dist);
	}*/
  /* sort lowest to highest */
}

// breed function.
function breed(){
  pool.sort(function(a, b){return a[verts.length]-b[verts.length]});
  if(leet.length == 0){
    leet = pool[0];
  }
  else if(leet[verts.length] != pool[0][verts.length]){
    leet = pool[0];
    leetChanges++;
  };
  var l = pool.length;
  var prob = [];
	var tFit = 0.0;
	for(var i = 0; i < l; i++){
		tFit += pool[i][verts.length];
	}
	for(i = 0; i < l; i++){
    prob.push((pool[i][verts.length]/tFit));
  }
  prob.sort(function(a, b){return b[verts.length]-a[verts.length]});
  nPool = [];
  while(nPool.length < pool.length-elites){
    var parentA, parentB;
    //
    parentA = pool[getParent(prob)];
    parentB = pool[getParent(prob)];
    //

    var childA = [];
    var childB = [];

    rand = [Math.floor(Math.random()*verts.length), Math.floor(Math.random()*verts.length)];
    rand.sort(function(a, b){return a-b});
    childA = parentA.slice(0, verts.length);
    childB = parentB.slice(0, verts.length);
    var x, y;
    for(var r = rand[0]; r <= rand[1]; r++){
      x = parentB[r];
      y = parentA[r];
      childA.splice(childA.indexOf(x), 1);
      childB.splice(childB.indexOf(y), 1);
    }
    for(r = rand[0]; r <= rand[1]; r++){
      x = parentB[r];
      y = parentA[r];
      childA.splice(r, 0, x);
      childB.splice(r, 0, y);
    }
    if(nPool.length < pool.length-elites){
      nPool.push(childA);
    }
    if(nPool.length < pool.length-elites){
      nPool.push(childB);
    }
  }
  for(i = 0; i < pool.length-elites; i++){
    chromo = nPool[i];
    mutate(chromo);
    fitness(chromo);
    pool[i+elites] = chromo;
  }
}
// mutate function.
function mutate(chromo){
  var r = Math.random();
  if(0.2-r>=0){
    shiftMutate(chromo);
  }
}
function loop(){
    breed();
}

// end function for output.
function output(){
    bob();
    pool.sort(function(a, b){return a[verts.length]-b[verts.length]});
    print("Optimum changed: " + leetChanges + " times.");
    print(chromo2text(pool[0]));
}

/*
ABC
ACB
BAC
BCA
CAB
CBA

/*

/*
for(var j = 0; j < verts.length; j++){
  genes.push(j);
}

var skipped = [];
for(j = 0; j < verts.length; j++){
  var a = pool[parentA][j];
  var b = pool[parentB][j];
  r = Math.random() * 2;
  if((genes.indexOf(a)>=0) && (genes.indexOf(b)>=0)){
    if(r < 1){
      child.push(a);
      genes.splice(genes.indexOf(a),1);
    }else{
      child.push(b);
      genes.splice(genes.indexOf(b),1);
    }
    continue;
  }
  if(genes.indexOf(a)>=0){
    child.push(a);
    genes.splice(genes.indexOf(a),1);
    continue;
  }
  if(genes.indexOf(b)>=0){
    child.push(b);
    genes.splice(genes.indexOf(b),1);
    continue;
  }
  skipped.push(j);
  child.push(0);
}
shuffle(genes);
for(j = 0; j < skipped.length; j++){
  child[skipped[j]] = genes[j];
}
if(child.length != verts.length){
  print("ERROR CHILD: " + child);
  BREAK = true;
}
*/
