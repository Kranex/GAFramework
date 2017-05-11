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

/* TODO Problems/other
 * Probabilities for breeding/mutation/other maybe required in db
 * 
 */

package io.github.kranex.gaframework;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import javax.script.ScriptException;

import io.github.kranex.gaframework.data.Table;
import io.github.kranex.gaframework.engine.Engine;

/**
 * @author Oliver Strik oliverstrik@gmail.com
 * 
 * @version v0.3.0
 * @since v0.1.0
 */
public class GAFramework {

	/* constants for debugging and verbose output. */
	public static boolean VERBOSE = true;
	public static boolean DEBUG = false;
	public static int OUTPUT = 0;
	private static Engine engine;
	/* declaration for the database. */
	//public static Connection database;
	public static Table table;
	/* initialization of the framework script break boolean. */
	public static int BREAK = 0;
	
	/* start of the java program. */
	public static void main(String[] args) throws NumberFormatException, ScriptException,
			ClassNotFoundException, SQLException, NoSuchMethodException, IOException {
		List<String> arguments;
		String scriptArgs = "";
		/* Deal with arguments */
		if(args.length == 1){
			arguments = new LinkedList<String>(Arrays.asList(args[0].split(" ")));
		}else{
			arguments = new LinkedList<String>(Arrays.asList(args));
		}

		if(!arguments.contains("-q"))printLicense();
		
		List<Integer> remove = new ArrayList<Integer>();
		
		for (int i = 0; i < arguments.size(); i++) {
			debug(arguments.get(i));
			if(arguments.get(i).startsWith("-a")){
				scriptArgs = arguments.get(i).replaceFirst("-a", "");
				remove.add(i);
				continue;
			}
			switch (arguments.get(i)) {
			case "-w":
				System.out.println(
						"This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.");
				return;
			case "-c":
				System.out.println(
						"This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.");
				return;
			case "-h":
				printHelp();
				return;
			case "-q":
				VERBOSE = false;
				break;
			case "-d":
				DEBUG = true;
				debug("enabled.");
				break;
			case "-t":
				OUTPUT = 1;
				VERBOSE = false;
				debug("using table output...");
				break;
			default:
				continue;
			}
			debug("removing argument: " + arguments.get(i));
			remove.add(i);
		}
		Collections.sort(remove);
		Collections.reverse(remove);
		for(int i : remove){
			arguments.remove(i);
		}
		try {
			/* initialize database. */
			//debug("starting database...");
			//database = DatabaseUtils.createDatabaseConnection(arguments.get(1));
			if(arguments.get(1).endsWith(".txt")){
				table = new Table(new File(arguments.get(1)));
				verbose("Table Loaded.");
			}else{
				System.out.println("Error, please supply txt table");
			}
			/* starts the GASolver program. */
			verbose("Initalising GAFramework...");
			new GAFramework(new File(arguments.get(0)), Integer.parseInt(arguments.get(2)), Integer.parseInt(arguments.get(3)), scriptArgs);

			//debug("closing database connection...");
			/* shuts down the database. */
			//database.close();
		} catch (ArrayIndexOutOfBoundsException e) {
			/* this happens if not enough arguments are given to the program. */
			System.out.println("[ERROR] Not enough arguments. Usage:");
			printHelp();
		}
	}

	/**
	 * Start of the GAFramework Program.
	 * 
	 * @param file
	 *            javascript genetic script.
	 * @param itter
	 *            # of iterations.
	 * @param poolSize
	 *            # of chromosomes in the pool.
	 * @param scriptArgs 
	 * @throws ScriptException
	 * @throws SQLException
	 * @throws NoSuchMethodException
	 * @throws IOException 
	 * @since v0.1.0
	 */
	public GAFramework(File file, int itter, int poolSize, String scriptArgs)
			throws ScriptException, SQLException, NoSuchMethodException, IOException {
		Long initTime = System.currentTimeMillis();
		Long passedTime;
		/* calls the javascript initalisation method. */
		engine = new Engine(file);
		
		/*
		 * init method not explicitly required, so try it and ignore if nothing
		 * happens.
		 */
		try {
			engine.inv.invokeFunction("init", scriptArgs);
		} catch (NoSuchMethodException e) {
			debug("No init function...");
		}
		/* invoke the initPool function. */
		engine.inv.invokeFunction("initPool", poolSize);
		boolean debugElite = true;
		for (int i = 0; i < itter; i++) {
			passedTime = System.currentTimeMillis()-initTime;
			if(itter >=100){
				if(i%(itter/100) == 0){
					if(VERBOSE){
							System.out.print("\r" + (int)((((double)i)/(double)itter)*100.0) + "% " + " " + engine.inv.invokeFunction("getLeet") + " " + String.format("%.2f",(itter-i)*((float)passedTime/(float)(i+1))/60000f) + "  ");
					}
				}
			}
			/*
			 * invoke breed and mutate functions, also break if the script calls
			 * for it.
			 * 
			 * the try catches are there because some methods are optional.
			 * 
			 * If a loop method is not found, then do the default order.
			 * 
			 */
			try {
				engine.inv.invokeFunction("loop", i);
			} catch (NoSuchMethodException e) {
				engine.inv.invokeFunction("breed");
				engine.inv.invokeFunction("mutate");
				try {
					engine.inv.invokeFunction("elite");
				} catch (NoSuchMethodException ex) {
					if (debugElite) {
						debug("No elite function...");
						debugElite = false;
					}
				}
			}
			if (engine.inv.invokeFunction("bob").equals(1)) {
				break;
			}
			// time passed, current itteration. time for one itteration, time left from 
		
		}
		passedTime = System.currentTimeMillis()-initTime;
		/*
		 * invoke the output function to output the final solution or other
		 * stuff as required
		 */
		if(OUTPUT == 0){
			verbose("\nOutput:");
			engine.inv.invokeFunction("output");
		}else if(OUTPUT == 1){
			engine.inv.invokeFunction("tableOutput", passedTime);
		}
	}

	/**
	 * Debug logger.
	 * 
	 * @param string
	 *            debug message to output.
	 * @since v0.1.0
	 */
	public static void debug(String string) {
		if (DEBUG) {
			System.out.println("[DEBUG] " + string);
		}
	}

	/**
	 * Verbose logger.
	 * 
	 * @param string
	 *            message to output.
	 * @since v0.1.0
	 */
	public static void verbose(String string) {
		if (VERBOSE) {
			System.out.println(string);
		}
	}

	/**
	 * Outputs the Help Text.
	 * 
	 * @since v0.1.0
	 */
	public static void printHelp() {
		System.out.println("GAFramework <Framework Script> <Database> <Generations> <Chromosomes/Pool> [-chqtw] [-a[{arguments}]]");
		System.out.println("\nThe Following options are available:");
		System.out.println("\n-a[{arguments}]");
		System.out.println("\tThe arguments to pass to the script.");
		System.out.println("\n-c");
		System.out.println("\tPrints the conditions of redistribution.");
		System.out.println("\n-h");
		System.out.println("\tPrints this help page.");
		System.out.println("\n-q");
		System.out.println("\tThe framework is verbose by default, this option mutes everything outside the script.");
		System.out.println("\n-t");
		System.out.println("\tIf the script supports it, it will output data with only spaces between. this makes it easier to create tables for scripts.");
		System.out.println("\n-w");
		System.out.println("\tPrints the warranty information.");
	}
	
	/**
	 * @since v0.2.0
	 */
	public static void printLicense(){
		System.out.println("GAFramework  Copyright (C) 2017 Oliver Strik");
		System.out.println("This program comes with ABSOLUTELY NO WARRANTY; for details type `GAFramework -w'.");
		System.out.println(
				"This is free software, and you are welcome to redistribute it under certain conditions; type `GAFramework -c' for details.\n");
	}
	
//	public static void testing() throws SQLException{
//		Statement statement = database.createStatement();
//		ResultSet table = statement.executeQuery("SELECT * FROM CITIES");
//		table.absolute(1);
//	}
}
