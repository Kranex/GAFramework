# GAFramework
If you have come here from the research article, the most interesting files are located as follows:
- /scripts/tsp0.js is the genetic algorithm script used in the research. tsp1 and tsp2 are modified versions of this script that were attempts to beat premature convergance.
- /docs/Sample\ Data/ contains all the distance matrices and coordinate tables that were used in the research.
- /src/GAFramework.js is the framework that the scripts reference to.
- /src/io/github/kranex/gaframework/ contains the sourcecode for the main body of the framework.

Genetic Algorithm Framework

The Genetic Algorithm Framework is part of my Propaedeutic Project on "Genetic Algorithms and the Traveling Salesman Problem".
We needed a GA to analyse and I saw the perfect opportunity to make this. It's currently a work in progress, but I plan to keep working on this after my project is finished.

For the time being, Genetic algorithms are written in Javascript and are passed to the GAFramework with any data they require for the problem, currently in the form of a Database, however this is liable to change in the future. I also plan to add support for other scripting languages such as Ruby and AppleScript.
