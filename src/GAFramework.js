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
 function Chromosome(chromo){
   this.struct = [];
   this.fitness = 0;
   this.probability = 0;
   if(chromo instanceof Chromosome){
     this.struct = chromo.struct.slice();
     this.fitness = chromo.fitness;
     this.probability = chromo.probability;
   }
   /* shuffles the given array */
   this.shuffle = function(){
     /* declare variables */
     var o, r, l;
     for(l =this.struct.length; l; l--){
       /* random number 0 < r < (chromo.length - genes.swapped) */
       r = Math.floor(Math.random() * l);

       /* swap them */
       o = this.struct[l-1];
       this.struct[l-1] = this.struct[r];
       this.struct[r] = o;
     }
   };
   /* the shift mutate function. */
   this.shiftMutate = function(){
     /* declare variables */
     var l, n, m, old;
     l = this.struct.length;

     /* init m and n with random number 0 <= R < l */
     m = Math.floor(Math.random() * l);
     n = Math.floor(Math.random() * l);

     /* shift genes around */
     old = this.struct[m];
     this.struct[m] = this.struct[n];
     this.struct[n] = old;
   };
   this.difference = function(chromo){
     if(!(chromo instanceof Chromosome)){
       return -1;
     }
     var diff = 0;
     for(i = 0; i < this.struct.length; i++){
       diff += Math.abs(this.struct[i]-chromo.struct[i]);
     }
     return diff;
   };
 }
