
loop(){
  for((i=0;i<30;i++))
  do
    java -jar ../bin/GAFramework*.jar -q tsp1.js ../docs/netherlands-simple.txt 6500 500 -a[start=GRONINGEN,elitep=5,fitnessOnly] >> results.txt
  done
}
for((i = 0; i < 3; i++))
do
  loop &
done
