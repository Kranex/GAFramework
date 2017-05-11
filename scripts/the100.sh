for((i=0;i<10;i++))
do
   java -jar GAFramework-v0.3.0.jar -q ../scripts/tsp0.js ../docs/netherlands\ complex.txt 6500 1000 -a[start=GRONINGEN] >> results.txt &
   java -jar GAFramework-v0.3.0.jar -q ../scripts/tsp0.js ../docs/netherlands\ complex.txt 6500 1000 -a[start=GRONINGEN] >> results.txt
done
