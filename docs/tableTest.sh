for((i=0;i<=400;i=i+4))
do
java -jar ../bin/GAFramework*.jar -q -t ../scripts/tsp0.js netherlands-simple.txt 800 $i >> table.txt
done
