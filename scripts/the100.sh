
loop(){
  for((i=0;i<100;i++))
  do
    java -jar ../bin/GAFramework*.jar -q tsp0.js ../docs/netherlands\ complex.txt 8500 500 -a[start=GRONINGEN,elitep=5] >> results.txt
  done
}
for((i = 0; i < 3; i++))
do
  loop &
done
